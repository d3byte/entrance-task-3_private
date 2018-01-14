import React, { Component } from 'react'

import Header from '../../components/Header'
import Calendar from '../../components/Calendar'

import close from '../../assets/img/close.svg'
import calendar from '../../assets/img/calendar.svg'
import closeWhite from '../../assets/img/close-white.svg'



export default class New extends Component {
    constructor() {
        super()
        this.state = {
            start: '16:00',
            end: '16:30',
            date: '',
            dateInput: '',
            rooms: [
                { id: 1, title: 'Ржавый Фред', capacity: '3-6 человек', floor: 7 },
                { id: 2, title: 'Прачечная', capacity: 'До 10 человек', floor: 5 },
                { id: 3, title: 'Жёлтый Дом', capacity: 'До 10 человек', floor: 3 },
                { id: 4, title: 'Оранжевый тюльпан', capacity: 'До 10 человек', floor: 6 }
            ],
            room: null,
            users: [],
            invitedUsers: [],
            theme: '',
            error_start: false,
            error_end: false
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
            month = this.monthNumToText(date.getMonth()),
            year = date.getFullYear()

        if (month === -1) {
            year -= 1
            month = 11
        } else if (month === 13) {
            year += 1
            month = 0
        }
        
        const text = `${day} ${month}, ${year}`

        return text
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

        this.setState({
            date: `${year}-${month}-${day}`,
            dateInput
        })

        
    }

    setPropsInfo = location => {
        if(!location)
            return
        const { start, end, room } = location
        this.setState({
            start: start.hours + ':' + start.minutes,
            end: end.hours + ':' + end.minutes,
            room: room
        })
    }

    chooseRoom = room => {
        // console.log(room)
        this.setState({ room })
    }

    cancelRoom = () => {
        this.setState({ room: null })
    }

    componentDidMount = () => {
        if(this.props && this.props.location)
            this.setPropsInfo(this.props.location.state)
        this.setTodayDate()
        document.addEventListener('new-date', this.handleDateInput)
    }

    componentWillUnmount = () => {
        document.removeEventListener('new-date')
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
                                <img src={close} alt="close-icon" />
                            </div>
                        </div>

                        <div className="row auto gutters space-between">
                            <div className="row-col">
                                <div className="labeled-input">
                                    <label>Тема</label>
                                    <input onInput={this.handleThemeInput} type="text" placeholder="О чём будете говорить?" />
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
                                    <input type="text" placeholder="Например, Тор Одинович" />
                                    <div className="input-dropdown hide">
                                        <ul className="people">
                                        </ul>
                                    </div>
                                    <div className="invited-people">
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
                <div className="hide-desktop">
                    Выберите переговорку
                </div>
                <div className="btns">
                    <a href="main.html" className="button-wrapper hide-mobile">
                        <button className="button">Отмена</button>
                    </a>
                    <button className="button create"  disabled>Создать встречу</button>
                </div>
            </footer>
        </div>
        )
    }
}
