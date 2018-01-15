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
import emoji from '../../assets/img/emoji1.svg'

class Edit extends Component {
    constructor() {
        super()
        this.state = {
            id: null,
            start: '',
            end: '',
            floor: null,
            date: '',
            dateInput: '',
            recommendedRooms: [],
            rooms: [],
            room: null,
            users: [],
            invitedUsers: [],
            showUsers: false,
            theme: '',
            error_start: false,
            error_end: false,
            updated: false
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

        this.setState({
            date: `${year}-${month}-${day}`,
            dateInput,
            updated: false
        })
    }

    handleThemeInput = e => {
        this.setState({ theme: e.target.value })
    }

    handleTimeInput = (e, field) => {
        if (e.target.value.length === 2 && this.state.start.length !== 3) {
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
        if(month + 1 < 10) {
            newMonth = '0' + (month + 1)
        } else {
            newMonth = month + 1
        }

        this.setState({
            date: `${year}-${newMonth}-${day}`,
            dateInput,
            updated: false
        })
    }
    
    getRecommendation = (rooms, info) => {

    }

    setPropsInfo = location => {
        if(!location)
            return
        const { start, end, room, id, title, users, allUsers, floor, floors } = location
        let newUsers = allUsers.slice(0).filter(user => {
            let isUsed = false
            users.map(item => {
                if(item.id == user.id)
                    isUsed = true
            })
            return isUsed ? undefined : user
        }).filter(item => item !== undefined)

        let newRooms = []
        floors.map(floor => newRooms = newRooms.concat(floor.rooms))
        
        this.setState({
            start: start.time.hours + ':' + start.time.minutes,
            end: end.time.hours + ':' + end.time.minutes,
            room,
            rooms: newRooms,
            theme: title,
            floor,
            invitedUsers: users,
            users: newUsers
        })
        this.handleDateInput({ detail: { day: start.day, month: parseInt(start.month) - 1, year: start.year } })
    }

    chooseRoom = room => {
        this.setState({ room, updated: false })
    }

    cancelRoom = () => {
        this.setState({ room: null, updated: false })
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
            if (clickedPlace.classList && clickedPlace.classList.contains(className)) {
                clickedPerson = true
            }
        })
        // Если нажат не список, то закрываю меню сразу. Если список, то закрываю после того,
        // как список обновлён
        if (!clickedPerson) {
            this.setState({ showUsers: false })
        } else {
            
        }
    }

    reset = () => {
        let invitedUsers = this.state.invitedUsers.slice(0)
        let users = this.state.users.slice(0)
        users = users.concat(invitedUsers)
        this.setState({ 
            start: '', end: '', date: '', users, 
            invitedUsers: [], showUsers: '', theme: '',
            room: null, error_end: false, error_start: false,
            updated: false
        })
        this.setTodayDate()
    }

    removeEvent = () => {
        this.props.removeEvent({ variables: { id: this.props.location.state.id } })
        this.props.history.push('/')
    }

    showModal = () => {
        let modalOverlay = document.createElement('div')
        modalOverlay.classList.add('overlay')
        modalOverlay.setAttribute('id', 'modal-overlay')
        document.body.insertBefore(modalOverlay, document.getElementById('root'))
        document.getElementById('delete-meeting').classList.remove('hide')
        let modal = document.querySelector('.modal')
        modal.classList.add('open')
        modal.style.top = '25%'
        document.addEventListener('click', this.hideModal)
    }

    hideModal = e => {
        if (!e.target.classList.contains('md')) {
            const overlay = document.querySelector('#modal-overlay')
            if (overlay)
                overlay.remove()
            document.getElementById('delete-meeting').classList.add('hide')
            document.querySelector('.modal').classList.remove('open')
        }
    }

    compareArrays = (a, b) => {
        return !a.some(function (e, i) {
            return e != b[i]
        })
    }

    submit = () => {
        const { 
            updateEvent, addUserToEvent,
            removeUserFromEvent, changeEventRoom
        } = this.props

        let eventInputChanged = false, userAdded = false, userRemoved = false, roomChanged = false,
            userAddedIds = [], userRemovedIds = []

        const { state } = this.props.location
        const { start, end, room, users, allUsers, title, dateStart, dateEnd, id } = state
        const prevStart = start.time.hours + ':' + start.time.minutes,
            prevEnd = end.time.hours + ':' + end.time.minutes

        if (this.state.start !== prevStart || this.state.end !== prevEnd || this.state.theme !== title ||
            this.state.date !== dateStart.slice(0, 10) || this.state.date !== dateEnd.slice(0, 10)) {
            eventInputChanged = true
        }

        if (!this.compareArrays(users, this.state.invitedUsers) || !this.compareArrays(allUsers, this.state.users)) {
            userRemovedIds = users.map(user => {
                if (!this.state.invitedUsers.includes(user)) {
                    return user.id
                }
            }).filter(item => item !== undefined)
            if(userRemovedIds.length > 0) {
                userRemoved = true
            }

            userAddedIds = this.state.invitedUsers.map(user => {
                if (!users.includes(user)) {
                    return user.id
                }
            }).filter(item => item !== undefined)

            if (userAddedIds.length > 0) {
                userAdded = true
            }
        }

        if (room.id !== this.state.room.id) {
            roomChanged = true
        }

        if (eventInputChanged) {
            const input = {
                title: this.state.theme,
                dateStart: this.state.date + 'T' + this.state.start + ':00.309Z',
                dateEnd: this.state.date + 'T' + this.state.end + ':00.309Z'
            }
            this.props.updateEvent({ variables: { id, input } })
        }

        if (userAdded) {
            userAddedIds.map(userId => this.props.addUserToEvent({ variables: { id, userId } }))
        }

        if (userRemoved) {
            userRemovedIds.map(userId => this.props.removeUserFromEvent({ variables: { id, userId } }))
        }

        if (roomChanged) {
            this.props.changeEventRoom({ variables: { id, roomId: this.state.room.id } })
        }

        if (eventInputChanged || userAdded || userRemoved || roomChanged) {
            this.setState({ updated: true })
        }
    }

    componentDidMount = () => {
        if(this.props && this.props.location)
            this.setPropsInfo(this.props.location.state)
        document.addEventListener('new-date', this.handleDateInput)
    }

    componentWillUnmount = () => {
        document.removeEventListener('new-date', this.handleDateInput)
    }
    
    
    render() {
        const { location } = this.props
        return (
        <div className="footer-to-bottom">
            <div className="body-wrapper marg-b-sm">
                <Header path={location.pathname} />
                <main>
                    <div className="container">
                        <div className="row space-between">
                            {
                                this.state.updated ? <h4 className="success">Встреча сохранена</h4> : <h4>Редактирование встречи</h4>
                            }
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
                                                    <span className="location">{this.state.room.title} &#183; {this.state.floor} этаж</span>
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
                    this.state.room === null && (
                        <div className="hide-desktop">
                            Выберите переговорку
                    </div>
                    )
                }
                <div className="btns">
                    <Link to="/" className="button-wrapper">
                        <button className="button">Отмена</button>
                    </Link>
                    <button className="button hide-mobile" onClick={this.showModal}>Удалить встречу</button>
                    <button
                        onClick={this.submit}
                        className="button save blue"
                        disabled={
                            this.state.invitedUsers.length > 0 && this.state.theme.length > 0 &&
                            this.state.room !== null && this.state.date.length > 0 &&
                            this.state.start.length === 5 && this.state.end.length === 5 &&
                            !this.state.error_end && !this.state.error_start ? false : true
                        }
                    >Сохранить</button>
                </div>
            </footer>
            <div id="delete-meeting" className="modal-box hide">
                <div className="modal md">
                    <div className="modal-body md">
                        <div className="col centered md">
                            <img src={emoji} alt="emoji" className="md"/>
                            <h4 className="md">Встреча будет удалена безвозвратно</h4>
                        </div>
                        <div className="row centered">
                            <button className="button">Отмена</button>
                            <button className="button" onClick={this.removeEvent}>Удалить</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

const UPDATE_EVENT = gql`
mutation updateEvent($id: ID!, $input: EventInput!) {
    updateEvent(id: $id, input: $input) {
        id
    }
}
`

const REMOVE_EVENT = gql`
mutation removeEvent($id: ID!) {
    removeEvent(id: $id) {
        id
    }
}
`

const ADD_USER = gql`
mutation addUser($id: ID!, $userId: ID!) {
    addUserToEvent(id: $id, userId: $userId) {
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

const REMOVE_USER = gql`
mutation removeUser($id: ID!, $userId: ID!) {
    removeUserFromEvent(id: $id, userId: $userId) {
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

const EditComponent = compose(
    graphql(UPDATE_EVENT, { name: 'updateEvent' }),
    graphql(REMOVE_EVENT, { name: 'removeEvent' }),
    graphql(ADD_USER, { name: 'addUserToEvent' }),
    graphql(REMOVE_USER, { name: 'removeUserFromEvent' }),
    graphql(CHANGE_ROOM, { name: 'changeEventRoom' })
)(Edit)

export default EditComponent