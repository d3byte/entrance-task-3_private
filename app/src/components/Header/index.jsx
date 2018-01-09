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
                path == '/' && (
                    <div>
                        <a href="new-meeting.html" className="button-wrapper">
                            <button className="button blue">Создать встречу</button>
                        </a>
                        <Calendar path={path}/>
                    </div>
                )
            }
        </header>
    )
  }
}
