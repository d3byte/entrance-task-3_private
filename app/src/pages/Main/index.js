import React, { Component } from 'react'

import Header from '../../components/Header'

export default class Main extends Component {
  render() {
    const { location } = this.props
    return (
      <Header path={location.pathname}/>
    )
  }
}
