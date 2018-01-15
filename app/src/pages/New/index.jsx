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

    getRecommendation = (rooms, info) => {

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

    setTodayDate = () => {
        let date = new Date(),
            day = date.getDate(),
            month = date.getMonth(),
            year = date.getFullYear()

        if (month === -1) {
            year -= 1
            month = 11
        } else if (month === 13) {
            year += 1
            month = 0
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
            dateInput
        })
    }

    handleThemeInput = e => {
        this.setState({ theme: e.target.value })
    }

    handleTimeInput = (e, field) => {
        if (e.target.value.length === 2 && this.state.start.length !== 3) {
            e.target.value = e.target.value + ':'
            this.setState({ [field]: e.target.value })
        } else if (e.target.value.length < 6) {
            this.setState({ [field]: e.target.value })
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
            dateInput
        })
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
            this.setState({
                users,
                rooms,
                events
            })
        }
    }

    chooseRoom = room => {
        this.setState({ room })
    }

    cancelRoom = () => {
        this.setState({ room: null })
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
        this.setState({ users, invitedUsers, showUsers: false, updated: false })
    }

    removeUser = user => {
        let invitedUsers = this.state.invitedUsers.slice(0).filter(invitedUser => invitedUser.id != user.id),
            users = this.state.users.slice(0)
        users.push(user)
        this.setState({ users, invitedUsers, updated: false })
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
        this.setTodayDate()
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
                                                    this.state.rooms.map((room, key) => (
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

const NewComponent = compose(
    graphql(CREATE_EVENT, { name: 'createEvent' }),
    graphql(FETCH_DATA, { name: 'fetchData' }),
)(New)

// 3
export default NewComponent