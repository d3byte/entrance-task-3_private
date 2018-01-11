import React, { Component } from 'react'

import Floor from '../Floor'

export default class Floors extends Component {
    render() {
        const { data } = this.props
        const rooms = [
            { id: 1, name: 'Ржавый Фред', capacity: '3-6 человек' },
            { id: 2, name: 'Прачечная', capacity: 'До 10 человек' },
            { id: 3, name: 'Жёлтый Дом', capacity: 'До 10 человек' },
            { id: 4, name: 'Оранжевый тюльпан', capacity: 'До 10 человек' }
        ]
        return (
            <div>
                {data && data.map((item, key) => <Floor key={key} floor={7} rooms={rooms} />)}
            </div>
        )
    }
}
