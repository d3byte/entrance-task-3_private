import React, { Component } from 'react'

import Header from '../../components/Header'
import LeftBar from '../../components/Leftbar'

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
                <LeftBar path={location.pathname} data={this.state.data}/>
                <div className="right-bar">
                    <div className="timeline">
                    </div>  
                </div>
            </main>
        </div>
    )
  }
}
