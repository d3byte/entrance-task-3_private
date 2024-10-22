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
                        rooms && rooms.map((room, key) => (
                            <li key={key} className={'room r-' + room.id}>
                                <span className="title">{room.title}</span>
                                <br />
                                <span className="capacity">До {room.capacity} человек</span>
                            </li>
                        ))
                    }
                </ul>
            </div>
        )
    }
}
