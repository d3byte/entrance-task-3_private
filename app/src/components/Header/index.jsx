import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Calendar from '../Calendar'

import logo from '../../assets/img/logo.svg'
import leftArrow from '../../assets/img/arrow2.svg'
import rightArrow from '../../assets/img/arrow.svg'

export default class Header extends Component {
    componentDidMount() {
        const rendered = new Event('header-rendered')
        document.dispatchEvent(rendered)
    }
      
    render() {
        const { path } = this.props
        return (
            <header className={path === '/' ? 'main-page' : ''}>
                <img src={logo} alt="logo"/>
                {
                    path === '/' && (
                        <Link to="/new" className="button-wrapper">
                            <button className="button blue">Создать встречу</button>
                        </Link>
                    )
                }
                {
                    path === '/' && (
                        <div className="date">
                            <div className="icon-container previous">
                                <img src={leftArrow} alt="left-arrow" />
                            </div>
                            <h5>14 дек. &#183; Сегодня </h5>
                            <div className="icon-container next">
                                <img src={rightArrow} alt="right-arrow" />
                            </div>
                        </div>
                    )
                }
                { path === '/' && <Calendar path={path} /> }
            </header>
        )
  }
}
