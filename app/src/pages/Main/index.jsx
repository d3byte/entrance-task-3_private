import React, { Component } from 'react'

import Header from '../../components/Header'

export default class Main extends Component {
  constructor() {
    super()
    this.state = {
      data: []
    }
  }

  render() {
    const { location } = this.props
    return (
      <div>
        <Header path={location.pathname} />
        <main className="main-page">
          <div className="left-bar">
            <div className="date">
              <div className="icon-container previous">
                <img src="desktop-assets/arrow2.svg" />
              </div>
              <h5>14 дек. &#183; Сегодня </h5>
              <div className="icon-container next">
                <img src="desktop-assets/arrow.svg" />
              </div>
            </div>
            <div className="calendar hide">
              <div className="wrapper">
              </div>
            </div>
            <div className="floor-container f-7">
              <div className="floor-num">7 этаж</div>
              <ul className="rooms">
                <li className="room r-1 disabled">
                  <span className="title">Ржавый Фред</span>
                  <br />
                  <span className="capacity">3–6 человек</span>
                </li>
                <li className="room r-2">
                  <span className="title">Прачечная</span>
                  <br />
                  <span className="capacity">До 10 человек</span>
                </li>
                <li className="room r-3">
                  <span className="title">Жёлтый Дом</span>
                  <br />
                  <span className="capacity">До 10 человек</span>
                </li>
                <li className="room r-4 disabled">
                  <span className="title">Оранжевый тюльпан</span>
                  <br />
                  <span className="capacity">До 10 человек</span>
                </li>
              </ul>
            </div>

            <div className="floor-container f-6">
              <div className="floor-num">6 этаж</div>
              <ul className="rooms">
                <li className="room r-1">
                  <span className="title">Джокер</span>
                  <br />
                  <span className="capacity">3–6 человек</span>
                </li>
                <li className="room r-2">
                  <span className="title">Мариванна</span>
                  <br />
                  <span className="capacity">3–6 человек</span>
                </li>
                <li className="room r-3">
                  <span className="title">Тонкий Боб</span>
                  <br />
                  <span className="capacity">3–6 человек</span>
                </li>
                <li className="room r-4">
                  <span className="title">Чёрная Вдова</span>
                  <br />
                  <span className="capacity">3–6 человек</span>
                </li>
                <li className="room r-5">
                  <span className="title">Белорусский ликёр</span>
                  <br />
                  <span className="capacity">3–6 человек</span>
                </li>
              </ul>
            </div>

          </div>
          <div className="right-bar">
            <div className="timeline">
            </div>
          </div>
        </main>
      </div>
    )
  }
}
