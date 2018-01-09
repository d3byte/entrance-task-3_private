import React, { Component } from 'react'

export default class Floor extends Component {
  render() {
    const {
        floor,
        rooms
    } = this.props
    return (
        <div className={'floor-container f-' + floor}>
            <div className="floor-num">{floor} этаж</div>
            <ul className="rooms">
                {
                    rooms.map(room => (
                        <li className={'room r-' + room.id}>
                            <span className="title">{room.name}</span>
                            <br />
                            <span className="capacity">{room.capacity}</span>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
  }
}
