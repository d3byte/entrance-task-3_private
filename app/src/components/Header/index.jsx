import React, { Component } from 'react'

import Calendar from '../Calendar'

import logo from '../../assets/img/logo.svg'

export default class Header extends Component {
  render() {
    const { path } = this.props
    return (
        <header className={path === '/' ? 'main-page' : ''}>
            <img src={logo} alt="logo"/>
            {
                path === '/' && (
                    <a href="new-meeting.html" className="button-wrapper">
                        <button className="button blue">Создать встречу</button>
                    </a>
                )
            }
            {
                path == '/' && (
                    <div className="date">
                        <div className="icon-container previous">
                            <img src="desktop-assets/arrow2.svg" alt="ui-element" />
                        </div>
                        <h5>14 дек. &#183; Сегодня </h5>
                        <div className="icon-container next">
                            <img src="desktop-assets/arrow.svg" alt="ui-element" />
                        </div>
                    </div>
                )
            }
            { path === '/' && <Calendar path={path} /> }
        </header>
    )
  }
}
