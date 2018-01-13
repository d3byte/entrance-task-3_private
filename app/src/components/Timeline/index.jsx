import React, { Component } from 'react'
import { Link } from 'react-router-dom'

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
            renderData: []
        }
        this.screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth
    }

    // Определяю количество колонок, принадлежащих эвенту
    determineColAmount(eventId) {
        const amount = document.querySelectorAll(`.event-${eventId}`).length
        return amount
    }

    // Позиционирую стрелочку тултипа
    positionArrow = ({ layerX }, right) => {
        const css = `
            .tooltip:before {
                left: ${layerX}px !important;
            }
        `,
            head = document.head || document.getElementsByTagName('head')[0],
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
        for (var i = 0; i < amount; i++) {
            document.querySelectorAll(`.event-${id}`)[i].classList.add('active')
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
        return months[number - 1]
    }

    // Проверяю, помещается ли тултип на экране. Если нет - вношу коррективы в позиционирование
    checkForContentOverlay = ({ clientX, layerX }, tooltip) => {
        const leftBarWidth = window.getComputedStyle(document.querySelector('.left-bar'), null).getPropertyValue('width')
        // 350 - размер тултипа с запасом в 10px
        if (this.screenWidth - clientX < 340) {
            const difference = Math.abs(340 - (this.screenWidth - clientX))
            let offset = layerX + difference
            if (offset > 340)
                offset = 320
            tooltip.style.left = '-' + difference + 'px'
            this.positionArrow({ layerX: offset })
        } else if (clientX - parseInt(leftBarWidth) < 30) {
            const difference = Math.abs(35 - (clientX - parseInt(leftBarWidth)))
            tooltip.style.left = + difference + 'px'
            this.positionArrow({ layerX: Math.abs(layerX - difference) })
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
        if (e.target.tagName != 'BUTTON') {
            let tooltip = document.createElement('div'),
                amount = this.determineColAmount(event.id)
            tooltip.classList.add('tooltip')
            this.highlightEventCols(event.id, amount)
            this.positionArrow(e)
            this.checkForContentOverlay(e, tooltip)
            tooltip.innerHTML = `
            <div class="header">
                <span class="title">${event.title}</span>
                <div class="icon-container">
                    <img src="desktop-assets/edit-gray.png">
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
                    <img src="desktop-assets/close.svg">
                </div>
                <span class="name">Дарт Вейдер</span>
                <span class="left">и 12 участников</span> 
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
    createButtons = (taIndex, floorIndex, roomId, data) => {
        let buttons = []
        const time = data[taIndex].date.toString().slice(0, 2)
        // eslint-disable-next-line
        let events = data[taIndex].events.map(event => {
            // eslint-disable-next-line
            if (event.floor === floorIndex && event.room.id == roomId)
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
                    btnSize = 60 - event.start.time.minutes
                    console.log(btnSize)
                    const button = (
                        <div className="flex">
                            <Link to="/new" style={{ width: (60 - btnSize) + 'px', display: 'block' }}>
                                <button className={'select-room s-' + btnSize}>
                                    +
                            </button>
                            </Link>
                            <div className={`separator e-${event.id}`} style={{ width: btnSize + 'px' }}>
                            </div>
                        </div>
                    )
                    buttons.push(button)
                    // eslint-disable-next-line
                } else if (event && time == event.hoursIncluded.last()) {
                    let btnSize = event.end.time.minutes + '-r'
                    const button = (
                        <div className="flex">
                            <div className={`separator e-${event.id}`} style={{ width: (60 - btnSize) + 'px' }}>
                            </div>
                            <Link to="/new" style={{ width: event.end.time.minutes + 'px', display: 'block' }}>
                                <button className={'select-room s-' + btnSize}>
                                    +
                                </button>
                            </Link>
                        </div>
                        
                    )
                    buttons.push(button)
                } else if (event) {
                    const space = (
                        <div className={`event-time e-${event.id}`}>
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
                            style={{ width: this.screenWidth < 1920 ? (event.end.time.minutes + 'px') : ((event.end.time.minutes * 2) + 'px') }}
                            className={`separator e-${event.id}`}
                        ></div>
                    )
                    const link = (
                        <Link
                            to="/new" className={'select-room s'}
                            style={{ width: (events[index + 1].start.time.minutes - event.end.time.minutes) + 'px' }}

                        >
                            <button style={{ width: (events[index + 1].start.time.minutes - event.end.time.minutes) + 'px' }}>
                                +
                        </button>
                        </Link>
                    )
                    array.push(separator)
                    array.push(link)
                }  else if (index == events.length - 1) {
                    const separator = (
                        <div
                            style={{ width: this.screenWidth < 1920 ? ((60 - event.start.time.minutes) + 'px') : (((60 - event.start.time.minutes) * 2) + 'px') }}
                            className={`separator e-${event.id}`}
                        ></div>
                    )
                    array.push(separator)
                }
                else {
                    const separator = (
                        <div
                            style={{ width: this.screenWidth < 1920 ? ((event.end.time.minutes - event.start.time.minutes) + 'px') : (((event.end.time.minutes - event.start.time.minutes) * 2) + 'px') }}
                            className={`separator e-${event.id}`}
                        ></div>
                    )
                    const link = (
                        <Link
                            to="/new" className={'select-room s'}
                            style={{ width: (events[index + 1].start.time.minutes - event.end.time.minutes) + 'px' }}

                        >
                            <button style={{ width: (events[index + 1].start.time.minutes - event.end.time.minutes) + 'px' }}>
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
                <Link to="/new" className="button-wrapper">
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
                        <span className="floor-num">{floor.num} этаж</span>
                        <div className="rows">
                            {floor.rooms.map((room, k) => (
                                <div className={'room r-' + room.id}>
                                    <div className="scrolled-tag">{room.name}</div>
                                    {this.createButtons(index, floor.num, room.id, data).map(btn => btn)}
                                    {/* <Link to="/new" className="button-wrapper">
                                        <button
                                            className={
                                                'select-room s-' +
                                                this.computeButtonSize(index, floor.num, room.id, data)
                                            }
                                        >
                                            +
                                        </button>
                                    </Link> */}
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
