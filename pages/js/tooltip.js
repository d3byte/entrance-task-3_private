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
            "dateEnd": "2017-12-29T21:57:23.309Z",
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
    events = handleEventData(events)
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(events), ms)
    })
}

// Определяю количество колонок, принадлежащих эвенту
function determineColAmount(eventId) {
    var amount = document.querySelectorAll(`.event-${eventId}`).length
    return amount
}

// Позиционирую стрелочку тултипа
function positionArrow({layerX}, right) {
    var css = `
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
function highlightEventCols(id, amount) {
    for(var i = 0; i < amount; i++) {
        document.querySelectorAll(`.event-${id}`)[i].classList.add('active')
    }
}

// Преобразую номер месяца в текстовый эквивалент
function monthNumToText(number) {
    const months = [
        'января', 'февраля', 'марта', 
        'апреля', 'мая', 'июня', 
        'июля', 'августа', 'сентября', 
        'октября', 'ноября', 'декабря'
    ]
    return months[number - 1]
}

// Проверяю, помещается ли тултип на экране. Если нет - вношу коррективы в позиционирование
function checkForContentOverlay({clientX, layerX}, tooltip) {
    var leftBarWidth = window.getComputedStyle(document.querySelector('.left-bar'), null).getPropertyValue('width'),
        screenWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth
    // 350 - размер тултипа с запасом в 10px
    if(screenWidth - clientX < 340) {
        var difference = Math.abs(340 - (screenWidth - clientX))
        var offset = layerX + difference
        if (offset > 340)
            offset = 320
        tooltip.style.left = '-' + difference + 'px'
        positionArrow({ layerX: offset })
    } else if (clientX - parseInt(leftBarWidth) < 30) {
        var difference = Math.abs(35 - (clientX - parseInt(leftBarWidth)))
        tooltip.style.left = + difference + 'px'
        positionArrow({ layerX: Math.abs(layerX - difference)})
    }
}
 
// Удаляю ранее активированный тултип
function removePreviousTooltip() {
    var tooltip = document.querySelector('.tooltip'),
        active = document.querySelectorAll('.room.active')
    for(var i = 0; i < active.length; i++) {
        active[i].classList.remove('active')
    }
    if (tooltip) {
        tooltip.remove()
    }
}

// Основная функция, создающая тултип
function createTooltip(e, event) {
    removePreviousTooltip()
    if(e.target.tagName != 'BUTTON') {
        var tooltip = document.createElement('div'),
            amount = determineColAmount(event.id)
        tooltip.classList.add('tooltip')
        highlightEventCols(event.id, amount)
        positionArrow(e)
        checkForContentOverlay(e, tooltip)
        tooltip.innerHTML = `
        <div class="header">
            <span class="title">${event.title}</span>
             <div class="icon-container">
                <img src="desktop-assets/edit-gray.png">
            </div>
        </div>
        <div class="time">
            <span>
                ${event.start.day} ${monthNumToText(event.start.month)},
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

        if (screenWidth <= 768) {
            tooltip.style.width = screenWidth
        }
        e.target.appendChild(tooltip)
    }
}

// Ставлю обработчики эвентов на колонки
fetchEvents(0).then(res => {
    res.map(item => {
        item.hoursIncluded.map((hour, index) => {
            document.querySelectorAll(`.event-${item.id}`)[index].addEventListener('click', e => createTooltip(e, item))
        })
    })
})
