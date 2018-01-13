import React, { Component } from 'react'

import Header from '../../components/Header'

export default class New extends Component {
  componentDidMount = () => {
    console.log(this.props)
  }
  
  render() {
    return (
      <Header/>
    )
  }
}
