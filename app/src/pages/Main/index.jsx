import React, { Component } from 'react'

import Header from '../../components/Header'
import Leftbar from '../../components/Leftbar'
import Timeline from '../../components/Timeline'


export default class Main extends Component {
    constructor() {
        super()
        this.state = {
            data: ['room', 'room'],
            events: [],
            rooms: []
        }
    }

    fetchEvents = ms => {
        const events = [
            {
                "id": "1",
                "title": "ШРИ 2018 - начало",
                "dateStart": "2017-12-28T12:16:23.309Z",
                "dateEnd": "2017-12-28T14:57:23.309Z",
                "users": [
                {
                    "id": "1",
                    "name": "Дарт Вейдер",
                    "login": "veged"
                },
                {
                    "id": "2",
                    "name": "Лекс Лютор",
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
                    "name": "Лекс Лютор",
                    "login": "alt-j"
                },
                {
                    "id": "3",
                    "name": "Кларк Кент",
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
                    "name": "Дарт Вейдер",
                    "login": "veged"
                },
                {
                    "id": "3",
                    "name": "Кларк Кент",
                    "login": "yeti-or"
                }
                ],
                "room": {
                    "id": "3",
                    "title": "Карты",
                    "capacity": 4,
                    "floor": 7
                },
            },
            {
                "id": "4",
                "title": "Jjjjoо",
                "dateStart": "2017-12-28T21:59:00.309Z",
                "dateEnd": "2017-12-28T23:00:00.309Z",
                "users": [
                    {
                        "id": "3",
                        "name": "Кларк Кент",
                        "login": "yeti-or"
                    },
                    {
                        "id": "1",
                        "name": "Дарт Вейдер",
                        "login": "veged"
                    },
                    {
                        "id": "2",
                        "name": "Лекс Лютор",
                        "login": "alt-j"
                    },
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
                    capacity: event.room.capacity
                },
                users: event.users,
                start: this.splitDate(event.dateStart),
                end: this.splitDate(event.dateEnd),
                hoursIncluded: this.hoursIncluded(event.dateStart.slice(11, 13), event.dateEnd.slice(11, 13))
            }
        })
        return newData
    }

    componentDidMount = () => {
      this.fetchEvents(0).then(events => {
          let newEvents = this.handleEventData(events)
          this.setState({ events: newEvents })
      })
    }
    

    render() {
        const { location } = this.props
        return (
        <div>
            <Header path={location.pathname} />
            <main className="main-page">
                <Leftbar path={location.pathname} data={this.state.data}/>
                <div className="right-bar">
                    <Timeline events={this.state.events}/>
                </div>
            </main>
        </div>
        )
    }
}
