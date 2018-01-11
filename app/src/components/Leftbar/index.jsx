import React, { Component } from 'react'

import Calendar from '../../components/Calendar'
import Floors from '../../components/Floors'

import leftArrow from '../../assets/img/arrow2.svg'
import rightArrow from '../../assets/img/arrow.svg'

export default class Leftbar extends Component {
  constructor() {
    super()
    this.state = {
      showCalendar: false
    }
  }

  componentDidMount() {
    const rendered = new Event('left-bar-rendered')
    document.dispatchEvent(rendered)
    // Установить слушатель эвента на включение календаря
  }

  render() {
    const { data, path } = this.props
    return (
      <div className="left-bar">
        <div className="date">
          <div className="icon-container previous">
            <img src={leftArrow} alt="left-arrow" />
          </div>
          <h5>14 дек. &#183; Сегодня</h5>
          <div className="icon-container next">
            <img src={rightArrow} alt="right-arrow" />
          </div>
        </div>
        <Calendar show={this.state.showCalendar} path={path}/>
        <Floors data={data} />
      </div>
    )
  }
}
