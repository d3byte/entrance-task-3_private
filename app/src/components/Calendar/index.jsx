import React, { Component } from 'react'

export default class Calendar extends Component {
  constructor() {
    super()
    this.state = {
      currentDay: new Date().getDate(),
      monthIndex: 2,
      h5: new Date().getDate() + '&#183; Сегодня',
      hide: false,
      months: []
    }

    this.dayChanged = new Event('day-changed')
    this.screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth
  }

  daysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate()
  }

  getMonthName = month => {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]

    return monthNames[month]
  }

  getMonthIndex = name => {
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
      "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ]

    return monthNames.indexOf(name)
  }

  getMonthInfo = (month, year) => {
    if (month === -1) {
      year -= 1
      month = 11
    } else if (month === 13) {
      year += 1
      month = 0
    }

    let daysAmount = this.daysInMonth(month, year),
      days = [],
      name = this.getMonthName(month),
      iterationDay = 1

    
    for (var i = 1; i <= 6; i++) {
      var week = []
      for (var j = iterationDay; j <= daysAmount; j++) {
        week.push(j)
        iterationDay++
        if ((iterationDay - 1) % 7 === 0) {
          break
        }
      }
      days.push(week)
    }

    return {
      name: name,
      days: days.filter(week => week.length !== 0)
    }
  }

  // TODO: Рефакторинг querySelector`ов
  changeDay = ({ indexOfWeek, indexOfDay, indexOfMonth, month }, arrow = false) => {
    let day = month.days[indexOfWeek][indexOfDay],
      monthName = month.name.toLowerCase().slice(0, 3) + '.',
      h5 = `${day} ${monthName} &#183;`,
      currentMonth = this.getMonthName(new Date().getMonth())

    if (month.name === currentMonth && day === (new Date().getDate() + 1)) {
      h5 += ' Завтра'
    } else if (month.name === currentMonth && (day === new Date().getDate() - 1)) {
      h5 += ' Вчера'
    } else if (month.name === currentMonth && day === new Date().getDate()) {
      h5 += ' Сегодня'
    } else {
      monthName = month.name.toLowerCase().slice(0, month.name.length - 1) + 'я'
      h5 = `${day} ${monthName}`
    }

    this.setState({
      currentDay: month.days[indexOfWeek][indexOfDay],
      monthIndex: indexOfMonth,
      h5
    })

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
    if (newToday)
      newToday.classList.add('today')
  }

  chooseDay = ({ indexOfWeek, indexOfDay, indexOfMonth, month }) => {
    let day = month.days[indexOfWeek][indexOfDay],
        monthName = month.name.toLowerCase().slice(0, month.name.length - 1) + 'я',
        text = `${day} ${monthName}, ${new Date().getFullYear()}`

    document.querySelector('.labeled-input.date input').value = text
    document.querySelector('.calendar.editor').classList.add('hide')
  }

  createMonth = (monthInfo, current = false, index, editor = false) => {
    let weeks = monthInfo.days.map((daysOfWeek, key) => {
      let days = daysOfWeek.map((day, i) => {
        const info = {
          indexOfWeek: monthInfo.days.indexOf(daysOfWeek),
          indexOfDay: daysOfWeek.indexOf(day),
          month: monthInfo,
          indexOfMonth: index
        }
        const td = (
          <td
            key={i}
            onClick={() => !editor ? this.changeDay(info) : this.chooseDay(info)}
            className={'td ' + current && day === new Date().getDate() ? 'today' : ''}
          >
            {day}
          </td>
        )
        return td
      })
      const week = <tr key={key} className="tr">{days}</tr>
      return week
    })
    const table = (
      <table className="table">
        <tbody>{weeks}</tbody>
      </table>
    )
    
    const month = (
      <div key={index} className="month">
        <div className="month-name">
          {monthInfo.name}
        </div>
        {table}
      </div>
    )

    return month
  }

  toggleCalendar = () => {
    let calendar
    if (this.screenWidth <= 768) {
      calendar = document.querySelector('header .calendar')
    } else {
      calendar = document.querySelector('main .calendar')
    }
    if (calendar.classList.contains('hide')) {
      calendar.classList.remove('hide')
      if (this.screenWidth <= 648) {
        var blurElem = document.createElement('div')
        blurElem.classList.add('blur')
        document.querySelector('main.main-page').append(blurElem)
      }
    } else {
      calendar.classList.add('hide')
      if (this.screenWidth <= 648) {
        document.querySelector('.blur').remove()
      }
    }
  }

  nextDay = months => {
    var monthInfo = {}
    months[this.state.monthIndex - 1].days.map(week => {
      for (let day of week) {
        if (day === (this.state.currentDay + 1)) {
          monthInfo = {
            month: months[this.state.monthIndex - 1],
            indexOfWeek: months[this.state.monthIndex - 1].days.indexOf(week),
            indexOfDay: week.indexOf(this.state.currentDay + 1),
            indexOfMonth: this.state.monthIndex
          }
          break
        }
      }
      return false
    })
    this.setState({ currentDay: this.state.currentDay + 1 })
    if (this.state.currentDay > this.daysInMonth(this.getMonthIndex(months[this.state.monthIndex - 1].name), new Date().getFullYear()) && this.state.monthIndex !== 3) {
      this.setState({ currentDay: 0, monthIndex: this.state.monthIndex + 1 })
      monthInfo = {
        month: months[this.state.monthIndex - 1],
        indexOfWeek: 0,
        indexOfDay: 0,
        indexOfMonth: this.state.monthIndex
      }
      this.changeDay(monthInfo, true)
    } else if (this.state.currentDay > this.daysInMonth(new Date().getMonth() + 1, new Date().getFullYear()) && this.state.monthIndex === 3) {
      return
    } else {
      this.changeDay(monthInfo, true)
    }
  }

  prevDay = months => {
    var monthInfo = {}
    months[this.state.monthIndex - 1].days.map(week => {
      for (let day of week) {
        if (day === (this.state.currentDay - 1)) {
          monthInfo = {
            month: months[this.state.monthIndex - 1],
            indexOfWeek: months[this.state.monthIndex - 1].days.indexOf(week),
            indexOfDay: week.indexOf(this.state.currentDay - 1),
            indexOfMonth: this.state.monthIndex
          }
          break
        }
      }
      return false
    })
    this.setState({ currentDay: this.state.currentDay - 1 })
    if (this.state.currentDay < 1 && this.state.monthIndex !== 1) {
      this.setState({
        monthIndex: this.state.monthIndex - 1,
        currentDay: this.daysInMonth(this.getMonthIndex(months[this.state.monthIndex - 2].name), new Date().getFullYear())
      })
      monthInfo = {
        month: months[this.state.monthIndex - 1],
        indexOfWeek: months[this.state.monthIndex - 1].days.length - 1,
        indexOfDay: months[this.state.monthIndex - 1].days[months[this.state.monthIndex - 1].days.length - 1].length - 1,
        indexOfMonth: this.state.monthIndex
      }
      this.changeDay(monthInfo, true)
    } else if (this.state.currentDay < 1 && this.state.monthIndex === 1) {
      return
    } else {
      this.changeDay(monthInfo, true)
    }
  }

  hideMeetingCalendar = e => {
    let allowedClasses = ['calendar', 'editor', 'wrapper', 'month', 'month-name',
      'table', 'tr', 'td'
    ],
      clickedDate = false,
      clickedPlace

    if (e.type !== 'click') {
      clickedPlace = e.explicitOriginalTarget
    } else {
      clickedDate = e.target
      document.querySelector('body .container').removeEventListener('click')
    }

    let activeDate = document.querySelector('td.today')
    if (activeDate) {
      activeDate.classList.remove('today')
    }
    if (clickedPlace.tagName === 'TD') {
      clickedPlace.classList.add('today')
    } else if (clickedPlace.parentElement.tagName === 'TD') {
      clickedPlace.parentElement.classList.add('today')
    }
    allowedClasses.map(className => {
      if ((clickedPlace.classList && clickedPlace.classList.contains(className)) ||
        (clickedPlace.parentElement.classList && clickedPlace.parentElement.classList.contains(className))
      ) {
        clickedDate = true
      }
      return false
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

  showMeetingCalendar = () => {
    document.querySelector('.calendar.editor').classList.remove('hide')
    document.querySelector('body .container').addEventListener('click', e => this.hideMeetingCalendar(e))
  }

  fillMainCalendar = () => {
    let date = new Date(),
      day = date.getDate(),
      year = date.getFullYear(),
      currentMonth = this.getMonthInfo(date.getMonth(), year),
      monthName = currentMonth.name.toLowerCase().slice(0, 3) + '.',
      previousMonth = this.getMonthInfo(date.getMonth() - 1, year),
      nextMonth = this.getMonthInfo(date.getMonth() + 1, year)

    const months = [
      this.createMonth(previousMonth, false, 1),
      this.createMonth(currentMonth, true, 2),
      this.createMonth(nextMonth, false, 3)
    ]

    this.setState({ months })

    const text = `${day} ${monthName} &#183; Сегодня`

    this.setState({ h5: text })

    if (this.screenWidth <= 768) {
      document.addEventListener('header-rendered', () => {
        console.log('header-rendered event fired')
        document.querySelector('header .date h5').innerHTML = text
        const toggle = new Event('toggle-header-calendar')
        document.dispatchEvent(toggle)
        document.querySelector('header .date h5').addEventListener('click', () => this.toggleCalendar())
        document.querySelector('header .date .next').addEventListener('click', () => {
          this.nextDay([previousMonth, currentMonth, nextMonth])
        })
        document.querySelector('header .date .previous').addEventListener('click', () => {
          this.prevDay([previousMonth, currentMonth, nextMonth])
        })
      })
    } else {
      console.log('else')
      document.addEventListener('left-bar-rendered', () => {
        console.log('left-bar-rendered event fired')
        const toggle = new Event('toggle-left-bar-calendar')
        document.dispatchEvent(toggle)
        document.querySelector('.left-bar .date h5').innerHTML = text
        document.querySelector('.left-bar .date h5').addEventListener('click', () => this.toggleCalendar())
        document.querySelector('.left-bar .date .next').addEventListener('click', () => {
          this.nextDay([previousMonth, currentMonth, nextMonth])
        })
        document.querySelector('.left-bar .date .previous').addEventListener('click', () => {
          this.prevDay([previousMonth, currentMonth, nextMonth])
        })
      })
      
    }
  }

  fillMeetingCalendar = () => {
    let date = new Date(),
      day = date.getDate(),
      year = date.getFullYear(),
      currentMonth = this.getMonthInfo(date.getMonth(), year),
      month = currentMonth.name.toLowerCase()
        .slice(0, currentMonth.name.length - 1) + 'я'

    this.setState({ months: [this.createMonth(currentMonth, true, 2, true)] })

    const today = `${day} ${month}, ${year}`

    document.querySelector('.labeled-input.date input').value = today
    document.querySelector('.labeled-input.date input').addEventListener('focus', this.showMeetingCalendar)
    document.querySelector('.labeled-input.date input').addEventListener('blur', e => this.hideMeetingCalendar(e))
  }

  componentDidMount = () => {
    const { path } = this.props
    if (path !== '/new' && path !== '/edit') {
      this.fillMainCalendar()
      return
    }
     this.fillMeetingCalendar()
  }

  componentWillReceiveProps = nextProps => {
    console.log(nextProps)
  }
  

  render() {
    return (
      <div className={this.props.editor ? 'calendar hide editor' : 'calendar hide'}>
          <div className="wrapper">
            {
              this.state.months.map(month => month)
            }
          </div>
      </div>
    )
  }
}
