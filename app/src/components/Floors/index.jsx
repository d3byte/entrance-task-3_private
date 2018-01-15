import React, { Component } from 'react'

import Floor from '../Floor'

export default class Floors extends Component {
    render() {
        const { data } = this.props
        return (
            <div>
                {data && data.map((floor, key) => <Floor key={key} floor={floor.num} rooms={floor.rooms} />)}
            </div>
        )
    }
}
