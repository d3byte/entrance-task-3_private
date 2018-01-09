import React, { Component } from 'react'

export default class Calendar extends Component {
  render() {
    return (
      <div>
        <div className="date">
            <div className="icon-container previous">
                <img src="desktop-assets/arrow2.svg" alt="ui-element" />
            </div>
            <h5>14 дек. &#183; Сегодня </h5>
            <div className="icon-container next">
                <img src="desktop-assets/arrow.svg" alt="ui-element" />
            </div>
        </div>
        <div className="calendar hide">
            <div className="wrapper">
            </div>
        </div>
      </div>
    )
  }
}
