// Функция, симулирующая получение данных с сервера
function fetchEvents(ms) {
    var events = [
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
function determineTime() {
    var date = new Date()
    var hours = date.getHours()
    var minutes = date.getMinutes()
    if(minutes < 10) {
        minutes = "0" + minutes
    }
    return {
        time: hours + ':' + minutes,
        hours: hours,
        minutes: minutes
    }
}

// Функция для преобразования данных типа Date в удобный мне формат
function splitDate(date) {
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
function hoursIncluded(start, end) {
    var hours = []
    for (var i = start; i <= end; i++) {
        hours.push(parseInt(i))
    }
    return hours
}

// Обрабатываю полученные с сервера данные об эвентах
function handleEventData(data) {
    var newData = []
    data.map(event => {
        let eventInfo = {
            id: event.id,
            title: event.title,
            floor: event.room.floor,
            room: {
                id: event.room.id,
                title: event.room.title,
                capacity: event.room.capacity,
                users: event.users
            },
            start: splitDate(event.dateStart),
            end: splitDate(event.dateEnd),
            hoursIncluded: hoursIncluded(event.dateStart.slice(11, 13), event.dateEnd.slice(11, 13))
        }
        newData.push(eventInfo)
    })
    return newData
}

// Совмещаю уже обработанные данные об эвентах со временем так, чтобы было удобно рендерить таблицу
function computeDataToRender(currentTime, events) {
    var data = []

    var handledData = handleEventData(events)

    for (var i = currentTime.hours - 3; i <= currentTime.hours; i++) {
        var eventInfo = handledData.map(date => {
            if (date.hoursIncluded.includes(i))
                return date
        })
        if (i == currentTime.hours) {
            data.push({
                date: currentTime.time,
                events: eventInfo.filter(event => event != undefined)
            })
            continue
        }
        if(i < 0) {
            var correctHour = 24 - Math.abs(i)
            data.push({
                date: correctHour,
                events: eventInfo.filter(event => event != undefined)
            })
            continue
        }
        data.push({
            date: i,
            events: eventInfo.filter(event => event != undefined)
        })
    }

    for (var i = currentTime.hours + 1; i < 24; i++) {
        var eventInfo = handledData.map(date => {
            if (date.hoursIncluded.includes(i))
                return date
        })
        data.push({
            date: i,
            events: eventInfo.filter(event => event != undefined)
        })
    }
    for (var i = 0; i < data[0].date; i++) {
        var eventInfo = handledData.map(date => {
            if (date.hoursIncluded.includes(i))
                return date
        })
        data.push({
            date: i,
            events: eventInfo.filter(event => event != undefined)
        })
    }

    return data.filter(item => data.indexOf(item) < 24)
}

// Добавляю стили для вертикальной полосы, отображающей текущее время
function addStyle(currentTime) {
    var css = `main.main-page .right-bar .timeline .time-area.current .timing > span:last-of-type {
                    margin-right: -${23 + parseInt(currentTime.minutes)}px;
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
                    `margin-left: ${Math.abs(23 - parseInt(currentTime.minutes))}px;`
                    :
                    `margin-left: -${Math.abs(23 - parseInt(currentTime.minutes))}px;`
                }
                }
                @media (min-width: 1920px) {
                    .current::before {
                        left: ${2 * parseInt(currentTime.minutes)}px;
                    }

                    main.main-page .right-bar .timeline .time-area.current .timing > span {
                    ${currentTime.minutes > 22 ?
                        `margin-left: ${2 * Math.abs(11 - parseInt(currentTime.minutes))}px;`
                        :
                        `margin-left: -${2 * Math.abs(11 - parseInt(currentTime.minutes))}px;`
                    }
                    }
                }`,
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

// Рендерю таблицу с эвентами
function renderTimelines(data, currentTime) {
    var render = ''
    // Частично захардкоженная строка для рендера. В следующем задании это будет рендериться на основе существующих комнат
    console.log(data)
    data.map((item, index) => {
        var renderString = `
        <div class="time-area ta-${index} ${item.date == currentTime.time ? 'current' : ''}">
            <div class="timing">
                ${item.date == currentTime.time ? `<span class="hours">${currentTime.hours}</span>` : ''}
                <span>${item.date}</span>
            </div>
            <div class="floors">
                <div class="floor f-7">
                    ${ index == 0 ? '<span class="floor-num">7 этаж</span>' : '' }
                    <div class="rows">
                        <div class="room r-1">
                            ${index == 0 ? '<div class="scrolled-tag">Ржавый Фред</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-2">
                            ${index == 0 ? '<div class="scrolled-tag">Прачечная</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-3">
                            ${index == 0 ? '<div class="scrolled-tag">Жёлтый дом</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-4">
                            ${index == 0 ? '<div class="scrolled-tag">Оранжевый тюльпан</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="floor f-6">
                    ${ index == 0 ? '<span class="floor-num">6 этаж</span>' : '' }
                    <div class="rows">
                        <div class="room r-1">
                            ${index == 0 ? '<div class="scrolled-tag">Джокер</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-2">
                            ${index == 0 ? '<div class="scrolled-tag">Мариванна</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-3">
                            ${index == 0 ? '<div class="scrolled-tag">Тонкий Боб</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-4">
                            ${index == 0 ? '<div class="scrolled-tag">Чёрная Вдова</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                        <div class="room r-5">
                            ${index == 0 ? '<div class="scrolled-tag">Белорусский ликёр</div>' : ''}
                            <a href="new-meeting.html" class="button-wrapper">
                                <button class="select-room s s-60">+</button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
        render += renderString
    })
    addStyle(currentTime)
    document.querySelector('.timeline').innerHTML = render
    data.map((item, index) => {
        if(item.events) {
            item.events.map((event, i) => {
                if(item.date.toString().slice(0, 2) == event.hoursIncluded[0]) {
                    // Изменяю кнопку внутри дива, чтобы отобразить занятое эвентом время
                    document.querySelector(`
                    .ta-${index} .f-${event.floor} .r-${event.room.id}
                    `).innerHTML = `
                    <a href="new-meeting.html" class="button-wrapper">
                        <button class="select-room s s-${60 - event.start.time.minutes}">+</button>
                    </a>    
                    `
                    // Добавляю класс, чтобы определять все колонки, относящиеся к эвенту, для создания тултипа
                    document.querySelector(`
                    .ta-${index} .f-${event.floor} .r-${event.room.id}
                    `).classList.add(`event-${event.id}`)
                } else if (item.date.toString().slice(0, 2) == event.hoursIncluded[event.hoursIncluded.length - 1]) {
                    // Изменяю кнопку внутри дива, чтобы отобразить занятое эвентом время
                    document.querySelector(`
                    .ta-${index} .f-${event.floor} .r-${event.room.id}
                    `).innerHTML = `
                    <a href="new-meeting.html" class="button-wrapper">
                        <button class="select-room s s-${event.end.time.minutes}-r">+</button>
                    </a>   
                    `
                    document.querySelector(`
                    .ta-${index} .f-${event.floor} .r-${event.room.id}
                    `).classList.add(`event-${event.id}`)
                } else {
                    // Если целый час принадлежит эвенту, убираю кнопку
                    document.querySelector(`
                    .ta-${index} .f-${event.floor} .r-${event.room.id}
                    `).removeChild(document.querySelector(`.ta-${index} .f-${event.floor} .r-${event.room.id} a`))
                    document.querySelector(`
                    .ta-${index} .f-${event.floor} .r-${event.room.id}
                    `).classList.add(`event-${event.id}`)
                }
            })
        }
    })
}

// Главная функция
function setTimeline() {
    fetchEvents(0).then(res => {
        var currentTime = determineTime()
        var renderData = computeDataToRender(currentTime, res)
        renderTimelines(renderData, currentTime)
    })
}

setTimeline()