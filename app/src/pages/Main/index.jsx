import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

import Header from '../../components/Header'
import Leftbar from '../../components/Leftbar'
import Timeline from '../../components/Timeline'

import emoji2 from '../../assets/img/emoji2.svg'

class Main extends Component {
    constructor() {
        super()
        this.state = {
            floors: [{ num: 7 }, { num: 6 }],
            events: [],
            rooms: [],
            scrolled: false,
            date: ''
        }
        this.screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth
    }
    
    // Функция для преобразования данных типа Date в удобный мне формат
    splitDate = date => {
        return {
            year: date.slice(0, 4),
            month: date.slice(5, 7),
            day: date.slice(8, 10),
            time: {
                hours: date.slice(11, 13),
                minutes: date.slice(14, 16),
                seconds: date.slice(17, 19),
            },
        }
    }

    // Функция для высчитывания часов, затронутых эвентом
    hoursIncluded = (start, end) => {
        let hours = []
        for (var i = start; i <= end; i++) {
            // eslint-disable-next-line
            hours.push(parseInt(i))
        }
        return hours
    }

    // Обрабатываю полученные с сервера данные об эвентах
    handleEventData = data => {
        let newData = data.map(event => {
            return {
                id: event.id,
                title: event.title,
                floor: event.room.floor,
                room: {
                    id: event.room.id,
                    title: event.room.title,
                    capacity: event.room.capacity,
                },
                users: event.users,
                dateStart: event.dateStart,
                dateEnd: event.dateEnd,
                start: this.splitDate(event.dateStart),
                end: this.splitDate(event.dateEnd),
                hoursIncluded: this.hoursIncluded(event.dateStart.slice(11, 13), event.dateEnd.slice(11, 13))
            }
        })
        return newData
    }

    handleScroll = e => {
        if (e.currentTarget.scrollLeft >= 50 && !this.state.scrolled) {
            this.setState({ scrolled: true })
        } else if (e.currentTarget.scrollLeft < -50) {
            this.setState({ scrolled: false })
        }
    }

    showModal = () => {
        let modalOverlay = document.createElement('div')
        modalOverlay.classList.add('overlay')
        modalOverlay.setAttribute('id', 'modal-overlay')
        document.body.insertBefore(modalOverlay, document.getElementById('root'))
        document.getElementById('created-meeting').classList.remove('hide')
        let modal = document.querySelector('.modal')
        modal.classList.add('open')
        modal.style.top = '25%'
        document.addEventListener('click', this.hideModal)
    }

    hideModal = e => {
        if(!e.target.classList.contains('md')) {
            const overlay = document.querySelector('#modal-overlay')
            if(overlay)
                overlay.remove()
            document.getElementById('created-meeting').classList.add('hide')
            document.querySelector('.modal').classList.remove('open')
            localStorage.removeItem('info')
            localStorage.removeItem('success')
        }
    }

    setFloors = rooms => {
        let floorNums = rooms.map(room => room.floor)
        // Избавляюсь от повторений номеров этажей и сортирую в порядке убывания
        floorNums = [...new Set(floorNums)].sort((a, b) => {
            if(a > b)
                return -1
            else if (a < b)
                return 1
        })

        const floors = floorNums.map(floor => {
            return {
                num: floor,
                rooms: rooms.filter(room => room.floor === floor)
            }
        })

        this.setState({ floors })
    }

    componentDidMount = () => {
        if (localStorage.success == 'true') {
            this.showModal()
        }
    }

    componentWillReceiveProps = props => {
        const { fetchData } = props
        if(fetchData) {
            console.log(fetchData)
            let newEvents = this.handleEventData(fetchData.events)
            this.setState({ rooms: fetchData.rooms, events: newEvents, users: fetchData.users })
            this.setFloors(fetchData.rooms)
        }
    }
    

    render() {
        const { location, history } = this.props
        let info
        if(localStorage.info) {
            info = JSON.parse(localStorage.info)
        }
        return (
        <div>
            <Header path={location.pathname} />
            <main className="main-page">
                {   !this.state.scrolled ? 
                    <Leftbar path={location.pathname} data={this.state.floors}/> :
                        <div className="hide"><Leftbar path={location.pathname} data={this.state.data} /></div>
                }
                {
                    this.screenWidth <= 768 ? (
                        <div className={'right-bar ' + (this.state.scrolled ? 'scrolled' : '')} onScroll={this.handleScroll}>
                            <Timeline history={history} users={this.state.users} floors={this.state.floors} events={this.state.events} scroll={this.state.scrolled} />
                        </div>
                    ) : (
                        <div className={'right-bar ' + (this.state.scrolled ? 'scrolled' : '')}>
                            <Timeline history={history} users={this.state.users} floors={this.state.floors} events={this.state.events} scroll={this.state.scrolled} />
                        </div>
                    )
                }
            </main>
            {
                localStorage.getItem('info') !== null && (
                    <div id="created-meeting" className="modal-box hide">
                        <div className="modal md">
                            <div className="modal-body md">
                                <div className="col centered md">
                                    <img src={emoji2} alt="emogi" className="md" />
                                    <h4 className="md">Встреча создана!</h4>
                                    <p className="text-cente md">
                                        {info.date} <br />
                                        {info.room.title} &#183; {info.room.floor} этаж
                                    </p>
                                </div>
                                <div className="row centered md">
                                    <button className="button blue" onClick={this.hideModal}>Хорошо</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
        )
    }
}

const FETCH_DATA = gql`
    query FetchData {
        rooms {
            id
            title
            capacity
            floor
        }
        users {
            id
            login
            homeFloor
            avatarUrl
        }
        events {
            id
            title
            dateStart
            dateEnd
            users {
                id
                login
                homeFloor
                avatarUrl
            }
            room {
                id
                title
                capacity
                floor
            }
        }
    }
`

export default graphql(FETCH_DATA, { name: 'fetchData' })(Main)