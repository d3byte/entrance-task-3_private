// Глобальные переменные для переключения дней и месяцев
var currentDay = new Date().getDate(),
    monthIndex = 2,
    // Эвент для скрывания календаря на странице редактирования или создания эвента
    dayChanged = new Event('day-changed'),
    screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth

// Узнаю, сколько дней в месяце
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate()
}

// Получаю имя месяца по индексу
function getMonthName(month) {
    var monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]

    return monthNames[month]
}

// Получаю индекс месяца по имени
function getMonthIndex(name) {
    var monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]

    return monthNames.indexOf(name)
}

// Заполняю информацию о месяце
function getMonthInfo(month, year) {
    // Проверка на январь и декабрь
    if (month == -1) {
        year -= 1
        month = 11
    } else if (month == 13) {
        year += 1
        month = 0
    }

    var daysAmount = daysInMonth(month, year),
        days = [],
        name = getMonthName(month)

    iterationDay = 1
    iterated = 1
    for(var i = 1; i <= 6; i++) {
        var week = []
        for(var j = iterationDay; j <= daysAmount; j++) {
            week.push(j)
            iterationDay++
            if ((iterationDay - 1) % 7 == 0) {
                break
            }
        }
        days.push(week)
    }

    return {
        name: name,
        days: days.filter(week => week.length != 0)
    }
}

// Функция смены дня
function changeDay({ indexOfWeek, indexOfDay, indexOfMonth, month }, arrow = false) {
    // Изменяю тайтл даты в левой менюшке
    var day = month.days[indexOfWeek][indexOfDay],
        monthName = month.name.toLowerCase().slice(0, 3) + '.',
        h5 = `${day} ${monthName} &#183;`,
        currentMonth = getMonthName(new Date().getMonth())

    currentDay = month.days[indexOfWeek][indexOfDay]
    monthIndex = indexOfMonth

    if (month.name == currentMonth && day == (new Date().getDate() + 1) ) {
        h5 += ' Завтра'
    } else if (month.name == currentMonth && (day == new Date().getDate() - 1)) {
        h5 += ' Вчера'
    } else if (month.name == currentMonth && day == new Date().getDate()) {
        h5 += ' Сегодня'
    } else {
        monthName = month.name.toLowerCase().slice(0, month.name.length - 1) + 'я'
        h5 = `${day} ${monthName}`
    }

    document.querySelector('.left-bar .date h5').innerHTML = h5
    document.querySelector('header .date h5').innerHTML = h5
    

    // Меняю активную клетку таблицы
    var today = document.querySelector('td.today')
    if (today)
        today.classList.remove('today')
    var newToday = document.querySelector(`
        .month:nth-of-type(${indexOfMonth})
        tr:nth-of-type(${indexOfWeek + 1})
        td:nth-of-type(${indexOfDay + 1})
    `)
    if(newToday)
        newToday.classList.add('today')
}

// Добавляю обработчик клика к клетке таблицы
function addEvent(element, info) {
    element.addEventListener('click', () => changeDay(info))
}

// Отдельная функция для обработки клика календаря для выбора даты встречи
function chooseDay({ indexOfWeek, indexOfDay, indexOfMonth, month }) {
    var day = month.days[indexOfWeek][indexOfDay],
        monthName = month.name.toLowerCase().slice(0, month.name.length - 1) + 'я',
        text = `${day} ${monthName}, ${new Date().getFullYear()}`

    document.querySelector('.labeled-input.date input').value = text
    document.querySelector('.calendar.editor').classList.add('hide')
}

// Создаю месяц
function createMonth(monthInfo, current = false, index, editor = false) {
    var month = document.createElement('div')
    month.classList.add('month')
    month.innerHTML = `
        <div class="month-name">
            ${monthInfo.name}
        </div>
    `
    var table = document.createElement('table')
    table.classList.add('table')
    monthInfo.days.map(week => {
        var tr = document.createElement('tr')
        tr.classList.add('tr')
        week.map(day => {
            var td = document.createElement('td')
            td.classList.add('td')
            // Отмечаю сегодня на календаре
            if(current && day == new Date().getDate()) {
                td.classList.add('today')
            }
            td.innerText = day
            // Проверяю, если скрипт применяется для страницы создания встречи или нет
            if(!editor) {
                addEvent(td, {
                    indexOfWeek: monthInfo.days.indexOf(week),
                    indexOfDay: week.indexOf(day),
                    month: monthInfo,
                    indexOfMonth: index
                })
            } else {
                td.addEventListener('click', () => chooseDay({
                    indexOfWeek: monthInfo.days.indexOf(week),
                    indexOfDay: week.indexOf(day),
                    month: monthInfo,
                    indexOfMonth: index
                }))
            }
            tr.appendChild(td)
        })
        table.appendChild(tr)
    })
    month.appendChild(table)

    if(window.location.pathname == '/pages/main.html') {
        if (screenWidth <= 768) {
            document.querySelector('header .calendar .wrapper').appendChild(month)
        } else {
            document.querySelector('main .calendar .wrapper').appendChild(month)
        }
    } else {
        document.querySelector('.calendar .wrapper').appendChild(month)
    }
}

// Показываю или скрываю календарь
function toggleCalendar() {
    var calendar
    if(screenWidth <= 768) {
        calendar = document.querySelector('header .calendar')
    } else {
        calendar = document.querySelector('main .calendar')
    }
    if(calendar.classList.contains('hide')) {
        calendar.classList.remove('hide')
        if (screenWidth <= 648) {
            var blurElem = document.createElement('div')
            blurElem.classList.add('blur')
            document.querySelector('main.main-page').append(blurElem)
        }
    } else {
        calendar.classList.add('hide')
        if (screenWidth <= 648) {
            document.querySelector('.blur').remove()
        }
    }
}

// Переключаю на следующий день
function nextDay(months) {
    var monthInfo = {}
    months[monthIndex - 1].days.map(week => {
        for (let day of week) {
            if (day == (currentDay + 1)) {
                monthInfo = {
                    month: months[monthIndex - 1],
                    indexOfWeek: months[monthIndex - 1].days.indexOf(week),
                    indexOfDay: week.indexOf(currentDay + 1),
                    indexOfMonth: monthIndex
                }
                break
            }
        }
    })
    currentDay++
    if (currentDay > daysInMonth(getMonthIndex(months[monthIndex - 1].name), new Date().getFullYear()) && monthIndex != 3) {
        currentDay = 0
        monthIndex++
        monthInfo = {
            month: months[monthIndex - 1],
            indexOfWeek: 0,
            indexOfDay: 0,
            indexOfMonth: monthIndex
        }
        changeDay(monthInfo, true)
    } else if (currentDay > daysInMonth(new Date().getMonth() + 1, new Date().getFullYear()) && monthIndex == 3) {
        return
    } else {
        changeDay(monthInfo, true)
    }
}

// Переключаю на предыдущий день
function prevDay(months) {
    var monthInfo = {}
    months[monthIndex - 1].days.map(week => {
        for (let day of week) {
            if (day == (currentDay - 1)) {
                monthInfo = {
                    month: months[monthIndex - 1],
                    indexOfWeek: months[monthIndex - 1].days.indexOf(week),
                    indexOfDay: week.indexOf(currentDay - 1),
                    indexOfMonth: monthIndex
                }
                break
            }
        }
    })
    currentDay--
    if (currentDay < 1 && monthIndex != 1) {
        monthIndex--
        currentDay = daysInMonth(getMonthIndex(months[monthIndex - 1].name), new Date().getFullYear())
        monthInfo = {
            month: months[monthIndex - 1],
            indexOfWeek: months[monthIndex - 1].days.length - 1,
            indexOfDay: months[monthIndex - 1].days[months[monthIndex - 1].days.length - 1].length - 1,
            indexOfMonth: monthIndex
        }
        changeDay(monthInfo, true)
    } else if (currentDay < 1 && monthIndex == 1) {
        return
    } else {
        changeDay(monthInfo, true)
    }
}

// Скрываю календарь на странице редактирования или создания встречи
function hideMeetingCalendar(e) {
    var allowedClasses = ['calendar', 'editor', 'wrapper', 'month', 'month-name', 
            'table', 'tr', 'td' 
        ],
        clickedDate = false,
        clickedPlace

    if (e.type != 'click') {
        clickedPlace = e.explicitOriginalTarget
    } else {
        clickedDate = e.target
        document.querySelector('body .container').removeEventListener('click')
    }
    

    var activeDate = document.querySelector('td.today')
    if(activeDate) {
        activeDate.classList.remove('today')
    }
    if (clickedPlace.tagName == 'TD') {
        clickedPlace.classList.add('today')
    } else if (clickedPlace.parentElement.tagName == 'TD') {
        clickedPlace.parentElement.classList.add('today')
    }
    allowedClasses.map(className => {
        if (clickedPlace.classList && clickedPlace.classList.contains(className) ||
            clickedPlace.parentElement.classList && clickedPlace.parentElement.classList.contains(className)
        ) {
            clickedDate = true
            document.querySelector('header').innerHTML = ''
        }
    })
    // Если нажат не календарь, то закрываю меню сразу. Если календарь, то закрываю после того,
    // как дата обновлена
    if (clickedDate) {
        document.addEventListener('day-changed', () => {
            document.querySelector('.calendar.editor').classList.add('hide')
        })
    } else {
        document.querySelector('.calendar.editor').classList.add('hide')
    }   
}

// Показываю календарь на странице редактирования или создания встречи
function showMeetingCalendar() {
    document.querySelector('.calendar.editor').classList.remove('hide')
    document.querySelector('body .container').addEventListener('click', e => hideMeetingCalendar(e))
}

// Основная функция, заполняющая календарь, на главной странице
function fillMainCalendar() {
    var date = new Date(),
        day = date.getDate(),
        year = date.getFullYear(),
        currentMonth = getMonthInfo(date.getMonth(), year),
        monthName = currentMonth.name.toLowerCase().slice(0, 3) + '.',
        previousMonth = getMonthInfo(date.getMonth() - 1, year),
        nextMonth = getMonthInfo(date.getMonth() + 1, year)

    createMonth(previousMonth, false, 1)
    createMonth(currentMonth, true, 2)
    createMonth(nextMonth, false, 3)
    
    var text = `${day} ${monthName} &#183; Сегодня`

    if (screenWidth <= 768) {
        document.querySelector('header .date h5').innerHTML = text
        document.querySelector('header .date h5').addEventListener('click', () => toggleCalendar())
        document.querySelector('header .date .next').addEventListener('click', () => {
            nextDay([previousMonth, currentMonth, nextMonth])
        })
        document.querySelector('header .date .previous').addEventListener('click', () => {
            prevDay([previousMonth, currentMonth, nextMonth])
        })
    } else {
        document.querySelector('.left-bar .date h5').innerHTML = text
        document.querySelector('.left-bar .date h5').addEventListener('click', () => toggleCalendar())
        document.querySelector('.left-bar .date .next').addEventListener('click', () => {
            nextDay([previousMonth, currentMonth, nextMonth])
        })
        document.querySelector('.left-bar .date .previous').addEventListener('click', () => {
            prevDay([previousMonth, currentMonth, nextMonth])
        })
    }
}

// Основная функция, заполняющая календарь, на странице создания встречи
function fillMeetingCalendar() {
    var date = new Date(),
        day = date.getDate(),
        year = date.getFullYear(),
        currentMonth = getMonthInfo(date.getMonth(), year),
        month = currentMonth.name.toLowerCase()
            .slice(0, currentMonth.name.length - 1) + 'я'

    createMonth(currentMonth, true, 2, true)


    var today = `${day} ${month}, ${year}`
    document.querySelector('.labeled-input.date input').value = today
    document.querySelector('.labeled-input.date input').addEventListener('focus', showMeetingCalendar)
    document.querySelector('.labeled-input.date input').addEventListener('blur', e => hideMeetingCalendar(e))
}

if (window.location.pathname != '/pages/new-meeting.html' && window.location.pathname != '/pages/edit-meeting.html') {
    fillMainCalendar()
} else {
    fillMeetingCalendar()
}
