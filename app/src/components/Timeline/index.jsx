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
                        { id: 1, name: 'Ржавый Фред', capacity: '3-6 человек' },
                        { id: 2, name: 'Прачечная', capacity: 'До 10 человек' },
                        { id: 3, name: 'Жёлтый Дом', capacity: 'До 10 человек' },
                        { id: 4, name: 'Оранжевый тюльпан', capacity: 'До 10 человек' }
                    ]
                },
                {
                    num: 6,
                    rooms: [
                        { id: 1, name: 'Ржавый Фред', capacity: '3-6 человек' },
                        { id: 2, name: 'Прачечная', capacity: 'До 10 человек' },
                        { id: 3, name: 'Жёлтый Дом', capacity: 'До 10 человек' },
                        { id: 4, name: 'Оранжевый тюльпан', capacity: 'До 10 человек' }
                    ]
                },
            ],
            currentTime: null,
            renderData: [],
            active: null
        }
        this.screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth
    }

    // Позиционирую стрелочку тултипа
    positionArrow = (e, offset) => {
        let width, css
        if(!offset) {
            width = parseInt(window.getComputedStyle(e.target).getPropertyValue('width'))
            css = `
            .tooltip:before {
                left: ${Math.floor(width / 2)}px !important;
            }
            `
        } else {
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
            this.positionArrow({e, difference}, true)
        } else if (e.clientX - parseInt(leftBarWidth) < 30) {
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

    // Основная функция, создающая тултип
    createTooltip = (e, event) => {
        this.removePreviousTooltip()
        let tooltip = document.createElement('div')
        tooltip.classList.add('tooltip')
        this.highlightEventCols(event.id)
        this.positionArrow(e)
        this.checkForContentOverlay(e, tooltip)
        tooltip.innerHTML = `
        <div class="header">
            <span class="title">${event.title}</span>
            <div class="icon-container">
                <img src="${edit}">
            </div>
        </div>
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
            <span class="name">${event.users[0].login}</span>
            <span class="left">и ${event.users.length - 1} участников</span> 
        </div>
        `
        if (this.screenWidth <= 768) {
            tooltip.style.width = this.screenWidth
        }
        e.target.appendChild(tooltip)
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
        events.map(event => {
            if (event.hoursIncluded[0] < firstEvent.hoursIncluded[0]) 
                firstEvent = event
            if (event.hoursIncluded.last() > lastEvent.hoursIncluded.last())
                lastEvent = event
        })
        let newEvents = events.filter(item => item != firstEvent && item != lastEvent)
        newEvents.sort((a, b) => {
            if (parseInt(a.end.hours) == parseInt(b.start.hours)) {
                return -1
            } else if (parseInt(b.end.hours) == parseInt(a.start.hours)) {
                return 1
            }
        })
        newEvents = [firstEvent, ...newEvents, lastEvent]
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
        events = events.filter(item => item != undefined)
        // eslint-disable-next-line
        if (events.length == 1) {
            // console.log(events)
            events.map((event, index) => {
                let btnSize
                // eslint-disable-next-line
                if (event && time == event.hoursIncluded[0]) {
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
                                        minutes: parseInt(event.start.time.minutes) - 1
                                    },
                                    room
                                }}}
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
                    let btnSize = 60 - parseInt(event.end.time.minutes) + '-r'
                    const button = (
                        <div className="flex">
                            <div
                                onClick={e => this.createTooltip(e, event)}
                                className={`separator e-${event.id} ${this.state.active === event.id ? 'active': ''}`} style={{ width: (parseInt(event.end.time.minutes)) + 'px' }}>
                            </div>
                            <Link 
                                to={{
                                    pathname: '/new', state: {
                                        start: {
                                            hours: event.start.time.hours,
                                            minutes: parseInt(event.end.time.minutes) + 1
                                        },
                                        end: {
                                            hours: (parseInt(event.start.time.hours) + 1) == 24 ? 0 : (parseInt(event.start.time.hours) + 1),
                                            minutes: '00'
                                        },
                                        room
                                    }
                                }}
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
                            className={`separator e-${event.id} ${this.state.active === event.id ? 'active' : ''}`}>
                        </div>
                    )
                    buttons.push(space)
                }
            })
        } else if (events.length > 1) {
            events = this.sortEvents(events)
            let array = []
            events.map((event, index) => {
                if(index == 0) {
                    const separator = (
                        <div
                            onClick={e => this.createTooltip(e, event)}
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
                                        minutes: parseInt(event.end.time.minutes) + 1
                                    },
                                    end: {
                                        hours: event.start.time.hours,
                                        minutes: parseInt(events[index + 1].start.time.minutes) - 1
                                    },
                                    room
                                }
                            }}
                            className={'select-room s'}
                            style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}

                        >
                            <button style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}>
                                +
                            </button>
                        </Link>
                    )
                    array.push(separator)
                    array.push(link)
                }  else if (index == events.length - 1) {
                    const separator = (
                        <div
                            onClick={e => this.createTooltip(e, event)}
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
                                        minutes: parseInt(event.end.time.minutes) + 1
                                    },
                                    end: {
                                        hours: event.start.time.hours,
                                        minutes: parseInt(events[index + 1].start.time.minutes) - 1
                                    },
                                    room
                                }
                            }}
                            className={'select-room s'}
                            style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}

                        >
                            <button style={{ width: (parseInt(events[index + 1].start.time.minutes) - parseInt(event.end.time.minutes)) + 'px' }}>
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
                                hours: (+time + 1) == 24 ? '00' : (+time + 1) < 10 ? '0' + (+time + 1).toString() : (+time + 1),
                                minutes: '00'
                            },
                            room
                        }
                    }}
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
                        {index == 0 && <span className="floor-num">{floor.num} этаж</span>}
                        <div className="rows">
                            {floor.rooms.map((room, k) => (
                                <div className={'room r-' + room.id}>
                                    { index == 0 && <div className="scrolled-tag">{room.name}</div> }
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
                <div className={`time-area ta-${index} ${item.date == currentTime.time ? 'current' : ''}`}>
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

    componentDidMount = () => {
        // eslint-disable-next-line
        Array.prototype.last = function () {
            return this[this.length - 1]
        }
    }

    componentWillReceiveProps = props => {
        const currentTime = this.determineTime()
        this.addStyle(currentTime)
        this.setState({
            currentTime,
            renderData: this.computeDataToRender(currentTime, props.events)
        })
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
