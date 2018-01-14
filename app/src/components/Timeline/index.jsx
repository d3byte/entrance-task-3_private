import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import edit from '../../assets/img/edit.svg'
import close from '../../assets/img/close.svg'

export default class Timeline extends Component {
    constructor() {
        super()
        this.state = {
            events: [],
            floors: [
                {
                    num: 7,
                    rooms: [
                        { id: 1, title: 'Ржавый Фред', capacity: '3-6 человек', floor: 7 },
                        { id: 2, title: 'Прачечная', capacity: 'До 10 человек', floor: 5 },
                        { id: 3, title: 'Жёлтый Дом', capacity: 'До 10 человек', floor: 3 },
                        { id: 4, title: 'Оранжевый тюльпан', capacity: 'До 10 человек', floor: 6 }
                    ]
                },
                {
                    num: 6,
                    rooms: [
                        { id: 1, title: 'Ржавый Фред', capacity: '3-6 человек', floor: 7 },
                        { id: 2, title: 'Прачечная', capacity: 'До 10 человек', floor: 5 },
                        { id: 3, title: 'Жёлтый Дом', capacity: 'До 10 человек', floor: 3 },
                        { id: 4, title: 'Оранжевый тюльпан', capacity: 'До 10 человек', floor: 6 }
                    ]
                },
            ],
            currentTime: null,
            renderData: [],
            active: null
        }
        this.screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth
    }

    // Добавить подсветку комнаты
    highlightRoom = e => {
        let roomContainer = e.target.parentElement.parentElement
        if (roomContainer.classList.contains('flex')) {
            roomContainer = roomContainer.parentElement
        }
        
        const roomId = roomContainer.classList[1].slice(2)
        const rowsContainer = roomContainer.parentElement
        const floorContainer = rowsContainer.parentElement
        const floorId = floorContainer.classList[1].slice(2)
        let room = document.querySelector(`.floor-container.f-${floorId} .rooms .room.r-${roomId}`)
        if (room && !room.classList.contains('disabled')) {
            room.classList.add('active')
        }
    }

    // Убрать подсветку комнаты
    stopHighlighting = e => {
        let activeFloor = document.querySelector('.floor-container .room.active')
        if (activeFloor) {
            activeFloor.classList.remove('active')
        }
    }

    // Позиционирую стрелочку тултипа
    positionArrow = (e, offset) => {
        let width, css
        if(!offset) {
            // eslint-disable-next-line
            width = parseInt(window.getComputedStyle(e.target).getPropertyValue('width'))
            css = `
            .tooltip:before {
                left: ${Math.floor(width / 2)}px !important;
            }
            `
        } else {
            // eslint-disable-next-line
            width = parseInt(window.getComputedStyle(e.e.target).getPropertyValue('width'))
            css = `
            .tooltip:before {
                left: ${e.difference + Math.floor((width / 2))}px !important;
            }
            `
        }
         const head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style)
    }

    // Подсвечиваю колонки, принадлежащие эвенту
    highlightEventCols = (id, amount) => {
        this.setState({ active: id })
    }

    // Преобразую номер месяца в текстовый эквивалент
    monthNumToText = number => {
        const months = [
            'января', 'февраля', 'марта',
            'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября',
            'октября', 'ноября', 'декабря'
        ]
        return months[number - 1]
    }

    // Проверяю, помещается ли тултип на экране. Если нет - вношу коррективы в позиционирование
    checkForContentOverlay = (e, tooltip) => {
        const leftBarWidth = window.getComputedStyle(document.querySelector('.left-bar'), null).getPropertyValue('width')
        // 350 - размер тултипа с запасом в 10px
        if (this.screenWidth - e.clientX < 340) {
            const difference = Math.abs(340 - (this.screenWidth - e.clientX))
            tooltip.style.left = '-' + difference + 'px'
            // eslint-disable-next-line
            this.positionArrow({e, difference}, true)
            // eslint-disable-next-line
        } else if (e.clientX - parseInt(leftBarWidth) < 30) {
            // eslint-disable-next-line
            const difference = Math.abs(35 - (e.clientX - parseInt(leftBarWidth)))
            tooltip.style.left = + difference + 'px'
            this.positionArrow({ e, difference }, true)
        }
    }

    // Удаляю ранее активированный тултип
    removePreviousTooltip = () => {
        let tooltip = document.querySelector('.tooltip'),
            active = document.querySelectorAll('.room.active')
        for (var i = 0; i < active.length; i++) {
            active[i].classList.remove('active')
        }
        if (tooltip) {
            tooltip.remove()
        }
    }

    goTo = (e, event) => {
        if (e.target.classList.contains('clickme') || e.target.parentElement.classList.contains('clickme')) {
            this.props.history.push({ pathname: '/edit', state: {
                ...event
            }})
        }
    }

    // Основная функция, создающая тултип
    createTooltip = (e, event) => {
        document.removeEventListener('click', e => this.goTo(e, event))
        if(e.target.classList.contains(`e-${event.id}`)) {
            this.removePreviousTooltip()
            let tooltip = document.createElement('div')
            tooltip.classList.add('tooltip')
            this.highlightEventCols(event.id)
            this.positionArrow(e)
            this.checkForContentOverlay(e, tooltip)
            tooltip.innerHTML = `
            <div class="header">
                <span class="title">${event.title}</span>
            `
            let editC = document.createElement('div')
            editC.classList.add('icon-container', 'clickme')
            document.addEventListener('click', e => this.goTo(e, event))
            editC.innerHTML = `<img src="${edit}">`
            tooltip.children[0].appendChild(editC)
            tooltip.innerHTML += `
            <div class="time">
                <span>
                    ${event.start.day} ${this.monthNumToText(event.start.month)},
                    ${event.start.time.hours}:${event.start.time.minutes}–${event.end.time.hours}:${event.end.time.minutes}
                </span>
                <span class="dot">&#183;</span>
                <span>
                    ${event.room.title}
                </span>
            </div>
            <div class="participants">
                <div class="avatar">
                    <img src="${close}">
                </div>
                <span class="name">${event.users[0].name}</span>
                <span class="left">и ${event.users.length - 1} участников</span> 
            </div>
            `
            if (this.screenWidth <= 768) {
                tooltip.style.width = this.screenWidth
            }
            e.target.appendChild(tooltip)
        }
    }

    // Определяю текущее время
    determineTime = () => {
        const date = new Date()
        const hours = date.getHours()
        let minutes = date.getMinutes()
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        return {
            time: hours + ':' + minutes,
            hours: hours,
            minutes: minutes
        }
    }

    // Совмещаю уже обработанные данные об эвентах со временем так, чтобы было удобно рендерить таблицу
    computeDataToRender = (currentTime, events) => {
        let data = []

        for (let i = currentTime.hours - 3; i <= currentTime.hours; i++) {
            // eslint-disable-next-line
            let eventInfo = events.map(date => {
                if (date.hoursIncluded.includes(i))
                    return date
            })
            if (i === currentTime.hours) {
                data.push({
                    date: currentTime.time,
                    events: eventInfo.filter(event => event !== undefined)
                })
                continue
            }
            if (i < 0) {
                let correctHour = 24 - Math.abs(i)
                data.push({
                    date: correctHour,
                    events: eventInfo.filter(event => event !== undefined)
                })
                continue
            }
            data.push({
                date: i,
                events: eventInfo.filter(event => event !== undefined)
            })
        }

        for (let i = currentTime.hours + 1; i < 24; i++) {
            // eslint-disable-next-line
            let eventInfo = events.map(date => {
                if (date.hoursIncluded.includes(i))
                    return date
            })
            data.push({
                date: i,
                events: eventInfo.filter(event => event !== undefined)
            })
        }
        for (let i = 0; i < data[0].date; i++) {
            // eslint-disable-next-line
            let eventInfo = events.map(date => {
                if (date.hoursIncluded.includes(i))
                    return date
            })
            data.push({
                date: i,
                events: eventInfo.filter(event => event !== undefined)
            })
        }

        return data.filter(item => data.indexOf(item) < 24)
    }

    // Добавляю стили для вертикальной полосы, отображающей текущее время
    addStyle = currentTime => {
        const css = `
            main.main-page .right-bar .timeline .time-area.current .timing > span:last-of-type {
                margin-right: -${
                    // eslint-disable-next-line
                    23 + parseInt(currentTime.minutes)
                }px;
            }
            .current::before {
                content: '';
                position: absolute;
                width: 1px;
                left: ${currentTime.minutes}px;
                top: 15px;
                height: calc(100% - 15px);
                background: blue;
                border-right: 1px solid #007DFF;
                z-index: 5000
            }
            main.main-page .right-bar .timeline .time-area.current .timing > .hours {
                right: calc(100% - 5px);
            }
            main.main-page .right-bar .timeline .time-area .timing > span:first-of-type {
                margin-right: 0;
                margin-left: -4px;
            }
            main.main-page .right-bar .timeline .time-area:first-of-type .timing > span {
                margin-left: 0;
            }
            main.main-page .right-bar .timeline .time-area.current .timing > span {
                ${currentTime.minutes > 22 ?
                `margin-left: ${
                    // eslint-disable-next-line
                    Math.abs(23 - parseInt(currentTime.minutes))
                }px;`
                :
                `margin-left: -${
                    // eslint-disable-next-line
                    Math.abs(23 - parseInt(currentTime.minutes))
                }px;`
                }
            }
            @media (min-width: 1920px) {
                .current::before {
                    left: ${
                        // eslint-disable-next-line
                        2 * parseInt(currentTime.minutes)
                    }px;
                }

                main.main-page .right-bar .timeline .time-area.current .timing > span {
                    ${currentTime.minutes > 22 ?
                    `margin-left: ${
                        // eslint-disable-next-line
                        2 * Math.abs(11 - parseInt(currentTime.minutes))
                    }px;`
                    :
                    `margin-left: -${
                        // eslint-disable-next-line
                        2 * Math.abs(11 - parseInt(currentTime.minutes))
                    }px;`
                    }
                }
            }`,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style')
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style)
    }

    sortEvents = events => {
        let firstEvent = events[0],
            lastEvent = events[0]
        // eslint-disable-next-line
        events.map(event => {
            if (event.hoursIncluded[0] < firstEvent.hoursIncluded[0]) 
                firstEvent = event
            if (event.hoursIncluded.last() > lastEvent.hoursIncluded.last())
                lastEvent = event
        })
        // eslint-disable-next-line
        let newEvents = events.filter(item => item != firstEvent && item != lastEvent)
        // eslint-disable-next-line
        newEvents.sort((a, b) => {
            // eslint-disable-next-line
            if (parseInt(a.end.hours) == parseInt(b.start.hours)) {
                return -1
                // eslint-disable-next-line
            } else if (parseInt(b.end.hours) == parseInt(a.start.hours)) {
                return 1
            }
        })
        // eslint-disable-next-line
        newEvents = [firstEvent, ...newEvents, lastEvent]
        
        // eslint-disable-next-line
        if(newEvents[0] == newEvents[newEvents.length - 1])
            newEvents.pop()
        return newEvents
    }

    // Вычисляю размеры кнопки
    createButtons = (taIndex, floorIndex, room, data) => {
        let buttons = []
        const time = data[taIndex].date.toString().slice(0, 2)
        // eslint-disable-next-line
        let events = data[taIndex].events.map(event => {
            // eslint-disable-next-line
            if (event.floor === floorIndex && event.room.id == room.id)
                return event
        })
        events = events.filter(item => item !== undefined)
        if (events.length === 1) {
            // eslint-disable-next-line
            events.map((event, index) => {
                let btnSize
                // eslint-disable-next-line
                if (event && time == event.hoursIncluded[0]) {
                    // eslint-disable-next-line
                    btnSize = 60 - parseInt(event.start.time.minutes)
                    const button = (
                        <div className="flex">
                            <Link 
                                to={{ pathname: '/new', state: { 
                                    start: {
                                        hours: event.start.time.hours,
                                        minutes: '00'
                                    },
                                    end: {
                                        hours: event.start.time.hours,
                                        // eslint-disable-next-line
                                        minutes: parseInt(event.start.time.minutes) - 1
                                    },
                                    room
                                }}}
                                onMouseOver={this.highlightRoom}
                                onMouseOut={this.stopHighlighting}
                                style={{ width: (60 - btnSize) + 'px', display: 'block' }}
                            >
                                <button className={'select-room s-' + btnSize}>
                                    +
                                </button>
                            </Link>
                            <div
                                onClick={e => this.createTooltip(e, event)}
                                className={`separator e-${event.id} ${this.state.active === event.id ? 'active' : ''}`} style={{ width: btnSize + 'px' }}>
                            </div>
                        </div>
                    )
                    buttons.push(button)
                // eslint-disable-next-line
                } else if (event && time == event.hoursIncluded.last()) {
                    // eslint-disable-next-line
                    let btnSize = 60 - parseInt(event.end.time.minutes) + '-r'
                    const button = (
                        <div className="flex">
                            <div
                                onClick={e => this.createTooltip(e, event)}
                                // eslint-disable-next-line
                                className={`separator e-${event.id} ${this.state.active === event.id ? 'active': ''}`} style={{ width: (parseInt(event.end.time.minutes)) + 'px' }}>
                            </div>
                            <Link 
                                to={{
                                    pathname: '/new', state: {
                                        start: {
                                            hours: event.start.time.hours,
                                            // eslint-disable-next-line
                                            minutes: parseInt(event.end.time.minutes) + 1
                                        },
                                        end: {
                                            // eslint-disable-next-line
                                            hours: (parseInt(event.start.time.hours) + 1) == 24 ? 0 : (parseInt(event.start.time.hours) + 1),
                                            minutes: '00'
                                        },
                                        room
                                    }
                                }}
                                onMouseOver={this.highlightRoom}
                                onMouseOut={this.stopHighlighting}
                                // eslint-disable-next-line
                                style={{ width: parseInt(60 - parseInt(event.end.time.minutes)) + 'px', display: 'block' }}>
                                <button className={'select-room s-' + btnSize}>
                                    +
                                </button>
                            </Link>
                        </div>
                        
                    )
                    buttons.push(button)
                } else if (event) {
                    const space = (
                        <div
                            onClick={e => this.createTooltip(e, event)}
                            // eslint-disable-next-line
                            className={`separator e-${event.id} ${this.state.active === event.id ? 'active' : ''}`}>
                        </div>
                    )
                    buttons.push(space)
                }
            })
        } else if (events.length > 1) {
            events = this.sortEvents(events)
            let array = []
            // eslint-disable-next-line
            events.map((event, index) => {
                if(index === 0) {
                    const separator = (
                        <div
                            onClick={e => this.createTooltip(e, event)}
                            // eslint-disable-next-line
                            style={{ width: this.screenWidth < 1920 ? (parseInt(event.end.time.minutes) + 'px') : ((parseInt(event.end.time.minutes) * 2) + 'px') }}
                            className={`separator e-${event.id} ${this.state.active === event.id ? 'active': ''}`}
                        ></div>
                    )
                    const link = (
                        <Link
                            to={{
                                pathname: '/new', state: {
                                    start: {
                                        hours: event.start.time.hours,
                                        // eslint-disable-next-line
                                        minutes: parseInt(event.end.time.minutes) + 1
                                    },
                                    end: {
                                        hours: event.start.time.hours,
                                        // eslint-disable-next-line
                                        minutes: parseInt(events[index + 1].start.time.minutes) - 1
                                    },
                                    room
                                }
                            }}
                            onMouseOver={this.highlightRoom}
                            onMouseOut={this.stopHighlighting}
                            className={'select-room s'}
                            // eslint-disable-next-line
                            style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}

                        >
                            <button
                                // eslint-disable-next-line
                                style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}>
                                +
                            </button>
                        </Link>
                    )
                    array.push(separator)
                    array.push(link)
                }  else if (index === events.length - 1) {
                    const separator = (
                        <div
                            onClick={e => this.createTooltip(e, event)}
                            // eslint-disable-next-line
                            style={{ width: this.screenWidth < 1920 ? ((60 - parseInt(event.start.time.minutes)) + 'px') : (((60 - parseInt(event.start.time.minutes)) * 2) + 'px') }}
                            className={`separator e-${event.id} ${this.state.active === event.id ? 'active': ''}`}
                        ></div>
                    )
                    array.push(separator)
                }
                else {
                    const separator = (
                        <div
                            onClick={e => this.createTooltip(e, event)}
                            // eslint-disable-next-line
                            style={{ width: this.screenWidth < 1920 ? ((parseInt(event.end.time.minutes) - parseInt(event.start.time.minutes)) + 'px') : (((parseInt(event.end.time.minutes) - parseInt(event.start.time.minutes)) * 2) + 'px') }}
                            className={`separator e-${event.id} ${this.state.active === event.id ? 'active': ''}`}
                        ></div>
                    )
                    const link = (
                        <Link
                            to={{
                                pathname: '/new', state: {
                                    start: {
                                        hours: event.start.time.hours,
                                        // eslint-disable-next-line
                                        minutes: parseInt(event.end.time.minutes) + 1
                                    },
                                    end: {
                                        hours: event.start.time.hours,
                                        // eslint-disable-next-line
                                        minutes: parseInt(events[index + 1].start.time.minutes) - 1
                                    },
                                    room
                                }
                            }}
                            onMouseOver={this.highlightRoom}
                            onMouseOut={this.stopHighlighting}
                            className={'select-room s'}
                            // eslint-disable-next-line
                            style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}

                        >
                            <button
                                // eslint-disable-next-line
                                style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}>
                                +
                            </button>
                        </Link>
                    )
                    array.push(separator)
                    array.push(link)
                }
            })
            const container = (
                <div className="flex">
                    {array.map(item => item)}
                </div>
            )
            buttons.push(container)
        } else {
            const button = (
                <Link
                    to={{
                        pathname: '/new', state: {
                            start: {
                                hours: time < 10 ? ('0' + time) : time,
                                minutes: '00'
                            },
                            end: {
                                // eslint-disable-next-line
                                hours: (+time + 1) == 24 ? '00' : (+time + 1) < 10 ? '0' + (+time + 1).toString() : (+time + 1),
                                minutes: '00'
                            },
                            room
                        }
                    }}
                    onMouseOver={this.highlightRoom}
                            onMouseOut={this.stopHighlighting}
                    className="button-wrapper">
                    <button className="select-room s-60">
                        +
                    </button>
                </Link>
            )
            buttons.push(button)
        }
        return buttons
    }

    // Готовлю таблицу с эвентами
    getTimelines = (data, currentTime) => {
        // eslint-disable-next-line
        const render = data.map((item, index) => {
            const floors = this.state.floors.map((floor, key) => {
                const floorJSX = (
                    <div key={key} className={'floor f-' + floor.num}>
                        { index === 0 && (<span className="floor-num">{floor.num} этаж</span>) }
                        <div className="rows">
                            {   // eslint-disable-next-line
                                floor.rooms.map((room, k) => (
                                <div className={'room r-' + room.id}>
                                    { index === 0 && <div className="scrolled-tag">{room.title}</div> }
                                    {this.createButtons(index, floor.num, room, data).map(btn => btn)}
                                </div>
                                )
                            )}
                        </div>
                    </div>
                )
                return floorJSX
            })

            // eslint-disable-next-line
            const timeArea = (
                // eslint-disable-next-line
                <div key={index} className={`time-area ta-${index} ${item.date == currentTime.time ? 'current' : ''}`}>
                    <div className="timing">
                        {
                            // eslint-disable-next-line
                            item.date == currentTime.time && 
                            <span className="hours">{currentTime.hours}</span>
                        }
                        <span>{item.date}</span>
                    </div>
                    <div className="floors">
                        {floors}
                    </div>
                </div>
            )
            return timeArea
        })

        return render
    }

    filterEvents = e => {
        const currentTime = this.determineTime()
        // eslint-disable-next-line
        let newEvents = this.state.events.slice(0)
        newEvents = newEvents.map(event => {
            const month = event.start.month,
                day = event.start.day
            // eslint-disable-next-line
            if (e && e.detail && month == (e.detail.month + 1) && day == e.detail.day)
                return event
        }).filter(item => item !== undefined)
        this.setState({ renderData: this.computeDataToRender(currentTime, newEvents), })
    }

    componentDidMount = () => {
        // eslint-disable-next-line
        Array.prototype.last = function () {
            return this[this.length - 1]
        }

        document.addEventListener('filter-events', this.filterEvents)
    }

    componentWillReceiveProps = props => {
        const currentTime = this.determineTime()
        this.addStyle(currentTime)
        this.setState({
            currentTime,
            renderData: this.computeDataToRender(currentTime, props.events),
            events: props.events
        })
        console.log(props)
        if(!props.scroll) {
            this.filterEvents({
                detail: {
                    month: new Date().getMonth(),
                    day: new Date().getDate()
                }
            })
        }
    }

    render = () => {
        return (
        <div className="timeline">
            {
                this.getTimelines(this.state.renderData, this.state.currentTime).map(ta => ta)
            }
        </div>
        )
    }
}
