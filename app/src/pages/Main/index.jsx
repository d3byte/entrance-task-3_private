import React, { Component } from 'react'

import Header from '../../components/Header'
import Leftbar from '../../components/Leftbar'


export default class Main extends Component {
  constructor() {
    super()
    this.state = {
      data: ['room', 'room']
    }
  }

  render() {
    const { location } = this.props
    return (
      <div>
        <Header path={location.pathname} />
        <main className="main-page">
          <Leftbar path={location.pathname} data={this.state.data}/>
          <div className="right-bar">
            <div className="timeline">
            </div>
          </div>
        </main>
      </div>
    )
  }
}
