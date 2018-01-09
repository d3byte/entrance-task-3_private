import React, { Component } from 'react'

import Calendar from '../../components/Calendar'
import Floors from '../../components/Floors'

export default class Leftbar extends Component {
  render() {
    const { data, path } = this.props
    return (
      <div className="left-bar">
        <Calendar path={path}/>
        <Floors data={data} />
      </div>
    )
  }
}
