import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose } from 'react-apollo'

import Header from '../../components/Header'
import Calendar from '../../components/Calendar'

import close from '../../assets/img/close.svg'
import calendar from '../../assets/img/calendar.svg'
import closeWhite from '../../assets/img/close-white.svg'

class New extends Component {
    constructor() {
        super()
        this.state = {
            start: '',
            end: '',
            date: '',
            dateInput: '',
            rooms: [],
            room: null,
            users: [],
            invitedUsers: [],
            showUsers: false,
            theme: '',
            error_start: false,
            error_end: false,
            events: []
        }
    }

    // Преобразую номер месяца в текстовый эквивалент
    monthNumToText = number => {
        const months = [
            'января', 'февраля', 'марта',
            'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября',
            'октября', 'ноября', 'декабря'
        ]
        return months[number]
    }

    handleThemeInput = e => {
        this.setState({ theme: e.target.value })
    }

    handleTimeInput = (e, field) => {
        if (e.target.value.length === 5 && this.state.start.length === 5 || e.target.value.length === 5 && this.state.end.length === 5) {
            this.setState({ [field]: e.target.value }, this.getRecommendation)
        } else if (e.target.value.length === 2 && this.state.start.length !== 3) {
            e.target.value = e.target.value + ':'
            this.setState({ [field]: e.target.value, updated: false })
        } else if (e.target.value.length < 6) {
            this.setState({ [field]: e.target.value, updated: false })
        }

    }

    handleDateInput = e => {
        const { day, month, year } = e.detail,
            date = new Date()


        if (day < date.getDate()) {
            // Оповестить пользователя, что нельзя ставить прошедшие даты
            console.log(false)
        }

        const dateInput = `${day} ${this.monthNumToText(month)}, ${year}`

        let newMonth
        if (month + 1 < 10) {
            newMonth = '0' + (month + 1)
        } else {
            newMonth = month + 1
        }

        this.setState({
            date: `${year}-${newMonth}-${day}`,
            dateInput,
            updated: false,
        }, () => {
            this.filterEvents({ detail: { day, month: parseInt(month) } })
            this.getRecommendation()
        })
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

    filterEvents = e => {
        // eslint-disable-next-line
        let newEvents = this.state.events.slice(0)
        newEvents = newEvents.map(event => {
            const month = event.start.month,
                day = event.start.day
            // eslint-disable-next-line
            if (e && e.detail && month == (e.detail.month + 1) && day == e.detail.day)
                return event
        }).filter(item => item !== undefined)
        this.setState({ todayEvents: this.handleEventData(newEvents) })
    }

    getRecommendation = () => {
        // Отсеять комнаты, где недостаточно места для участников
        if (this.state.todayEvents && !this.state.room) {
            console.log('aaa')
            let roomsWithEnoughCapacity = this.state.rooms.filter(room => room.capacity >= this.state.invitedUsers.length)
            let rooms = [],
                { start, end } = this.state,
                availableRooms = roomsWithEnoughCapacity.filter(room => {
                    // Отобрать только свободные комнаты
                    let time = { hours: 0, taken: [] },
                        events = []
                    this.state.todayEvents.map(event => {
                        if (event.room.id === room.id) {
                            time.hours += event.hoursIncluded.length
                            time.taken.push({ start: event.start, end: event.end, hoursIncluded: event.hoursIncluded })
                            events.push(event)
                        }
                    })
                    let roomSuits = true
                    if (time.hours !== 24) {
                        time.taken.map(item => {
                            // Если первый час эвента равен часу окончания
                            if (item.hoursIncluded[0] == parseInt(end.slice(0, 2))) {
                                if (item.start.time.minutes < parseInt(end.slice(3, 5))) {
                                    roomSuits = false
                                }
                            }
                            // Если последний час эвента равен часу начала
                            if (item.hoursIncluded[item.hoursIncluded.length - 1] == parseInt(start.slice(0, 2))) {
                                if (item.end.time.minutes < parseInt(start.slice(3, 5))) {
                                    roomSuits = false
                                }
                            }
                            // Проверить остальные часы
                            if (item.hoursIncluded[item.hoursIncluded.length - 1] != parseInt(start.slice(0, 2)) &&
                                item.hoursIncluded[0] != parseInt(start.slice(0, 2)) &&
                                item.hoursIncluded.includes(parseInt(start.slice(0, 2))) ||
                                item.hoursIncluded[item.hoursIncluded.length - 1] != parseInt(end.slice(0, 2)) &&
                                item.hoursIncluded[0] != parseInt(end.slice(0, 2)) &&
                                item.hoursIncluded.includes(parseInt(end.slice(0, 2)))) {
                                roomSuits = false
                            }

                        })
                        // делать что-то
                    } else roomSuits = false

                    if (!roomSuits)
                        rooms.push({ time, room, events })

                    return roomSuits ? room : undefined
                }).filter(item => item !== undefined)
            // Подсчитать общее количество пройденных этажей юзерами в каждую комнату  
            // И сформировать удобную структуру данных
            let suitableRooms = []
            availableRooms.map(room => {
                let floorsAmount = 0
                this.state.invitedUsers.map(user => floorsAmount += Math.abs(user.homeFloor - room.floor))
                suitableRooms.push({ floorsAmount, room })
            })
            // Отсортировать комнаты
            suitableRooms.sort((a, b) => {
                if (a.floorsAmount < b.floorsAmount)
                    return -1
                else return 1
            })

            // Если есть доступные переговорки
            suitableRooms = suitableRooms.map(room => room.room)
            if (suitableRooms.length > 0) {
                console.log(suitableRooms)
                this.setState({ recommendedRooms: suitableRooms })
            } else {
                let foundRoom = false
                rooms.map((item, index) => {
                    // Если комната не занята целые сутки
                    if (!foundRoom) {
                        item.events.map(event => {
                            let crossesTime = false
                            for (let hour = parseInt(start.slice(0, 2)); hour <= parseInt(end.slice(0, 2)); hour++) {
                                if (event.hoursIncluded.includes(hour)) {
                                    crossesTime = true
                                    break
                                }
                            }
                            if (crossesTime) {
                                let roomsWithEnoughCapacity = this.state.rooms.filter(room => room.capacity >= event.users.length),
                                    availableRooms = roomsWithEnoughCapacity.filter(room => {
                                        // Отобрать только свободные комнаты
                                        let time = { hours: 0, taken: [] }
                                        this.state.todayEvents.map(item => {
                                            if (item.room.id === room.id) {
                                                time.hours += item.hoursIncluded.length
                                                time.taken.push({ start: item.start, end: item.end, hoursIncluded: item.hoursIncluded })
                                            }
                                        })
                                        let roomSuits = true
                                        if (time.hours !== 24) {
                                            time.taken.map(item => {
                                                // Если первый час эвента равен часу окончания
                                                if (item.hoursIncluded[0] == event.end.time.hours) {
                                                    if (item.start.time.minutes < event.end.time.minutes) {
                                                        roomSuits = false
                                                    }
                                                }
                                                // Если последний час эвента равен часу начала
                                                if (item.hoursIncluded[item.hoursIncluded.length - 1] == event.start.time.hours) {
                                                    if (item.end.time.minutes < event.start.time.minutes) {
                                                        roomSuits = false
                                                    }
                                                }
                                                // Проверить остальные часы
                                                if (item.hoursIncluded[item.hoursIncluded.length - 1] == event.start.time.hours &&
                                                    item.hoursIncluded[0] == event.start.time.hours &&
                                                    item.hoursIncluded.includes(event.start.time.hours) ||
                                                    item.hoursIncluded[item.hoursIncluded.length - 1] == event.end.time.hours &&
                                                    item.hoursIncluded[0] == event.end.time.hours &&
                                                    item.hoursIncluded.includes(event.end.time.hours)) {
                                                    roomSuits = false
                                                }

                                            })
                                            // делать что-то
                                        } else roomSuits = false

                                        return roomSuits ? room : undefined
                                    }).filter(item => item !== undefined)
                                let suitableRooms = []
                                availableRooms.map(room => {
                                    let floorsAmount = 0
                                    event.users.map(user => floorsAmount += Math.abs(user.homeFloor - room.floor))
                                    suitableRooms.push({ floorsAmount, room })
                                })
                                // Отсортировать комнаты
                                suitableRooms.sort((a, b) => {
                                    if (a.floorsAmount < b.floorsAmount)
                                        return -1
                                    else return 1
                                })
                                // Если есть доступные переговорки
                                suitableRooms = suitableRooms.map(room => room.room)
                                this.props.changeEventRoom({ variables: { id: event.id, roomId: suitableRooms[0].id } }).then(data => {
                                    this.setState({ recommendedRooms: [item.room] })
                                    foundRoom = true
                                })
                            }
                        })
                    }
                })
            }
        }
    }

    setPropsInfo = (location, data) => {
        if(location !== undefined) {
            const { start, end, room } = location
            this.setState({
                start: start.hours + ':' + start.minutes,
                end: end.hours + ':' + end.minutes,
                room: room,
            })
        }
        if(data !== undefined) {
            const { users, rooms, events } = data
            console.log(events)
            this.setState({
                users,
                rooms,
                events: this.handleEventData(events)
            })
            const date = new Date(),
                day = date.getDate(),
                month = date.getMonth(),
                year = date.getFullYear()
            this.handleDateInput({ detail: { day, month, year } })
        }
    }

    chooseRoom = room => {
        this.setState({ room })
    }

    cancelRoom = () => {
        this.setState({ room: null, updated: false }, this.getRecommendation)
    }

    userInputHandler = e => {
        const text = e.target.value
        if (text !== '') {
            var suitableUser = this.state.users.map(user => {
                if (user.login.indexOf(text) !== -1) {
                    return user
                }
            })
            suitableUser = suitableUser.filter(item => item != undefined)
            if (suitableUser[0]) {
                let newUsers = this.state.users.slice(0).filter(user => user != suitableUser[0])
                newUsers.unshift(suitableUser[0])
                this.setState({ users: newUsers })
            }
        }
    }

    addUser = user => {
        let invitedUsers = this.state.invitedUsers.slice(0),
            users = this.state.users.slice(0).filter(item => item != user)
        invitedUsers.push(user)
        this.setState({ users, invitedUsers, showUsers: false, updated: false }, this.getRecommendation)
    }

    removeUser = user => {
        let invitedUsers = this.state.invitedUsers.slice(0).filter(invitedUser => invitedUser.id != user.id),
            users = this.state.users.slice(0)
        users.push(user)
        this.setState({ users, invitedUsers, updated: false }, this.getRecommendation)
    }

    showUserList = () => {
        this.setState({ showUsers: true })
    }

    hideUserList = e => {
        // Проверяю, если был нажат элемент списка пользователей
        const clickedPlace = e.nativeEvent.explicitOriginalTarget,
            allowedClasses = ['name', 'input-dropdown', 'people', 'person', 'avatar', 'dot', 'floor']

        let clickedPerson = false
        
        allowedClasses.map(className => {
            if (clickedPlace && clickedPlace.classList && clickedPlace.classList.contains(className)) {
                clickedPerson = true
            }
        })
        // Если нажат не список, то закрываю меню сразу. Если список, то закрываю после того,
        // как список обновлён
        
        if (!clickedPerson && this.screenWidth > 768) {
            this.setState({ showUsers: false })
        } else if(this.screenWidth <= 768) {
            return
        }
    }

    reset = () => {
        let invitedUsers = this.state.invitedUsers.slice(0)
        let users = this.state.users.slice(0)
        users = users.concat(invitedUsers)
        this.setState({ 
            start: '', end: '', date: '', users, 
            invitedUsers: [], showUsers: '', theme: '',
            room: null, error_end: false, error_start: false
        })
        this.setTodayDate()
    }

    submit = () => {
        const input = {
            title: this.state.theme,
            dateStart: this.state.date + 'T' + this.state.start + ':00.309Z',
            dateEnd: this.state.date + 'T' + this.state.end + ':00.309Z'
        }

        const usersIds = this.state.invitedUsers.map(user => user.id)
        const roomId = this.state.room.id

        this.props.createEvent({ variables: { input, usersIds, roomId } }).then(data => {
            localStorage.setItem('success', 'true')
            localStorage.setItem(
                'info',
                JSON.stringify({
                    date: this.state.dateInput.slice(0, this.state.dateInput.length - 5) + ' ' + this.state.start + '–' + this.state.end,
                    room: this.state.room
                })
            )
            this.props.history.push('/')
        }).catch(error => console.log('there was an error sending the query', error))
        
    }

    componentDidMount = () => {
        if(this.props && this.props.location)
            this.setPropsInfo(this.props.location.state)
        document.addEventListener('new-date', this.handleDateInput)
    }

    componentWillUnmount = () => {
        document.removeEventListener('new-date', this.handleDateInput)
    }

    componentWillReceiveProps = props => {
        this.setPropsInfo(props.location.state, props.fetchData)
    }
    
    
    
    render() {
        const { location } = this.props
        return (
        <div className="footer-to-bottom">
            <div className="body-wrapper marg-b">
                <Header path={location.pathname} />
                <main>
                    <div className="container">
                        <div className="row space-between">
                            <h4>Новая встреча</h4>
                            <div className="icon-container hide-mobile">
                                <img src={close} alt="close-icon" onClick={this.reset} />
                            </div>
                        </div>

                        <div className="row auto gutters space-between">
                            <div className="row-col">
                                <div className="labeled-input">
                                    <label>Тема</label>
                                    <input onChange={this.handleThemeInput} value={this.state.theme} type="text" placeholder="О чём будете говорить?" />
                                </div>
                            </div>

                            <div className="row-col input-date">
                                <div className="labeled-input date">
                                    <label>Дата</label>
                                    <input type="text" value={this.state.dateInput} readOnly />
                                    <img src={calendar} alt="calendar-icon" />
                                </div>
                                <Calendar editor path={location.pathname}/>
                                <div className="labeled-input time">
                                    <label>Начало</label>
                                    <input
                                        className={this.state.error_start ? 'error-input' : ''}
                                        type="text" value={this.state.start} 
                                        onChange={e => this.handleTimeInput(e, 'start')} 
                                        placeholder="16:00" 
                                    />
                                </div>
                                <span>–</span>
                                <div className="labeled-input time">
                                    <label>Конец</label>
                                    <input 
                                        className={this.state.error_end ? 'error-input' : ''}
                                        type="text" value={this.state.end} 
                                        onChange={e => this.handleTimeInput(e, 'end')}
                                        placeholder="16:30"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row auto gutters gray">
                            <div className="row-col">
                                <div className="labeled-input participants">
                                    <label>Участники</label>
                                    <input 
                                        type="text" placeholder="Например, Тор Одинович" 
                                        onChange={this.userInputHandler}
                                        onFocus={this.showUserList}
                                        onBlur={this.hideUserList}
                                    />
                                    <div className={`input-dropdown ${this.state.showUsers ? '' : 'hide'}`}>
                                        <ul className="people">
                                        {
                                            this.state.users.map((user, key) => (
                                                <li 
                                                    className={`person p-${user.id} ${this.state.users[0].id == user.id ? 'suitable': ''}`} 
                                                    onClick={() => this.addUser(user)} key={key}
                                                >
                                                    <img src={user.avatarUrl} className="avatar"/>
                                                    <span className="name">{user.login}</span>
                                                    <span className="dot">&#183;</span>
                                                    <span className="floor">{user.floor} этаж</span>
                                                </li>
                                            ))
                                        }
                                        </ul>
                                    </div>
                                    <div className="invited-people">
                                    {
                                        this.state.invitedUsers && this.state.invitedUsers.map((user, key) => (
                                            <div key={key} className={`invited-person p-${user.id}`}>
                                                <div className="person-wrapper">
                                                    <img src={user.avatarUrl} className="avatar"/>
                                                    {user.login}
                                                </div>
                                                <img 
                                                    onClick={() => this.removeUser(user)}
                                                    src={close} alt="close" 
                                                />
                                            </div>
                                        ))
                                    }
                                    </div>
                                </div>
                            </div>

                            <div className="row-col room-interface">
                                {
                                    this.state.room === null ? (
                                            <div className="labeled-room list">
                                                <label>Рекомендованные переговорки</label>
                                                {
                                                    this.state.recommendedRooms && this.state.recommendedRooms.map((room, key) => (
                                                        <div key={key} className="room" onClick={() => this.chooseRoom(room)}>
                                                            <div className="info">
                                                                <span className="time">{this.state.start}–{this.state.end}</span>
                                                                <span className="location">{room.title} &#183; {room.floor} этаж</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                    ) : (
                                        <div className="labeled-room active">
                                            <label>Ваша переговорка</label>
                                            <div className="room">
                                                <div className="info">
                                                    <span className="time">{this.state.start}–{this.state.end}</span>
                                                    <span className="location">{this.state.room.title} &#183; {this.state.room.floor} этаж</span>
                                                </div>
                                                <img src={closeWhite} alt="close" onClick={this.cancelRoom} />
                                            </div>
                                        </div>
                                    )
                                }

                            </div>

                        </div>
                    </div>
                </main>
            </div>
            <footer>
                {
                    this.state.room === null  && (
                        <div className="hide-desktop">
                            Выберите переговорку
                        </div>
                    )
                }
                <div className="btns">
                    <Link to="/" className="button-wrapper hide-mobile">
                        <button className="button">Отмена</button>
                    </Link>
                    <button 
                        className="button create" onClick={this.submit}
                        disabled={
                            this.state.invitedUsers.length > 0 && this.state.theme.length > 0 &&
                            this.state.room !== null && this.state.date.length > 0 &&
                            this.state.start.length === 5 && this.state.end.length === 5 &&
                            !this.state.error_end && !this.state.error_start ? false : true
                    }>Создать встречу</button>
                </div>
            </footer>
        </div>
        )
    }
}

const CREATE_EVENT = gql`
  mutation createEvent($input: EventInput!, $usersIds: [ID], $roomId: ID!) {
    createEvent(input: $input, usersIds: $usersIds, roomId: $roomId) {
        id
    }
  }
`

const FETCH_DATA = gql`
query users {
    users {
        id
        login
        avatarUrl
        homeFloor
    }
    rooms {
        id
        title
        capacity
        floor
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

const CHANGE_ROOM = gql`
mutation changeRoom($id: ID!, $roomId: ID!) {
    changeEventRoom(id: $id, roomId: $roomId) {
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

const NewComponent = compose(
    graphql(CREATE_EVENT, { name: 'createEvent' }),
    graphql(FETCH_DATA, { name: 'fetchData' }),
    graphql(CHANGE_ROOM, { name: 'changeEventRoom' })
)(New)

// 3
export default NewComponent