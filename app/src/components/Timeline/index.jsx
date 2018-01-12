import React, { Component } from 'react'

export default class Timeline extends Component {
    constructor() {
        super()
        this.state = {
            events: []
        }
    }

    fetchEvents = (ms) => {
        const events = [
            {
                "id": "1",
                "title": "ШРИ 2018 - начало",
                "dateStart": "2017-12-28T12:16:23.309Z",
                "dateEnd": "2017-12-28T14:57:23.309Z",
                "users": [
                    {
                        "id": "1",
                        "login": "veged"
                    },
                    {
                        "id": "2",
                        "login": "alt-j"
                    }
                ],
                "room": {
                    "id": "1",
                    "title": "404",
                    "capacity": 5,
                    "floor": 7
                }
            },
            {
                "id": "2",
                "title": "👾 Хакатон 👾",
                "dateStart": "2017-12-28T14:57:23.309Z",
                "dateEnd": "2017-12-28T15:57:23.309Z",
                "users": [
                    {
                        "id": "2",
                        "login": "alt-j"
                    },
                    {
                        "id": "3",
                        "login": "yeti-or"
                    }
                ],
                "room": {
                    "id": "2",
                    "title": "Деньги",
                    "capacity": 4,
                    "floor": 6
                }
            },
            {
                "id": "3",
                "title": "🍨 Пробуем kefir.js",
                "dateStart": "2017-12-28T16:57:23.309Z",
                "dateEnd": "2017-12-28T21:57:23.309Z",
                "users": [
                    {
                        "id": "1",
                        "login": "veged"
                    },
                    {
                        "id": "3",
                        "login": "yeti-or"
                    }
                ],
                "room": {
                    "id": "3",
                    "title": "Карты",
                    "capacity": 4,
                    "floor": 7
                }
            }
        ]
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(events), ms)
        })
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
                    users: event.users
                },
                start: this.splitDate(event.dateStart),
                end: this.splitDate(event.dateEnd),
                hoursIncluded: this.hoursIncluded(event.dateStart.slice(11, 13), event.dateEnd.slice(11, 13))
            }
        })
        return newData
    }

    // Совмещаю уже обработанные данные об эвентах со временем так, чтобы было удобно рендерить таблицу
    computeDataToRender = (currentTime, events) => {
        let data = []

        const handledData = this.handleEventData(events)

        for (let i = currentTime.hours - 3; i <= currentTime.hours; i++) {
            // eslint-disable-next-line
            let eventInfo = handledData.map(date => {
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
                var correctHour = 24 - Math.abs(i)
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
            let eventInfo = handledData.map(date => {
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
            let eventInfo = handledData.map(date => {
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

    componentDidMount = () => {
      this.fetchEvents().then(events => {
          events = this.handleEventData(events)
          this.setState({ events })
      })
      console.log(this.state.events)
    }
    

    render = () => {
        return (
        <div className="timeline">
            
        </div>
        )
    }
}
