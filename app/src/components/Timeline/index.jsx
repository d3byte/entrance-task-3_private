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

    // Вычисляю размеры кнопки
    computeButtonSize = (taIndex, floorIndex, roomId, data) => {
        let btnSize = 60
        const time = data[taIndex].date.toString().slice(0, 2)
        // eslint-disable-next-line
        const events = data[taIndex].events.map(event => {
            // eslint-disable-next-line
            if (event.floor === floorIndex && event.room.id == roomId)
                return event
        })
        // eslint-disable-next-line
        events.map((event, index) => {
            // eslint-disable-next-line
            if (event && time == event.hoursIncluded[0]) {
                btnSize -= event.start.time.minutes
                // eslint-disable-next-line
            } else if (event && time == event.hoursIncluded.last()) {
                btnSize = event.end.time.minutes + '-r'
                // if (index === events.length - 1) {
                // btnSize += '-r
                //}
            } else if (!event) {
                return btnSize
            } else {
                btnSize = ''
            }
        })
        return btnSize
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
                                    <Link to="/new" className="button-wrapper">
                                        <button
                                            className={
                                                'select-room s-' +
                                                this.computeButtonSize(index, floor.num, room.id, data)
                                            }
                                        >
                                            +
                                        </button>
                                    </Link>
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
                    <div class="timing">
                        {
                            // eslint-disable-next-line
                            item.date == currentTime.time && 
                            <span class="hours">{currentTime.hours}</span>
                        }
                        <span>{item.date}</span>
                    </div>
                    <div class="floors">
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
