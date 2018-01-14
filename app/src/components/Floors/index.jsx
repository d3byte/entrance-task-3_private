import React, { Component } from 'react'

import Floor from '../Floor'

export default class Floors extends Component {
    render() {
        const { data } = this.props
        const rooms = [
            { id: 1, title: 'Ржавый Фред', capacity: '3-6 человек', floor: 7 },
            { id: 2, title: 'Прачечная', capacity: 'До 10 человек', floor: 5 },
            { id: 3, title: 'Жёлтый Дом', capacity: 'До 10 человек', floor: 3 },
            { id: 4, title: 'Оранжевый тюльпан', capacity: 'До 10 человек', floor: 6 }
        ]
        return (
            <div>
                {data && data.map((item, key) => <Floor key={key} floor={item.num} rooms={rooms} />)}
            </div>
        )
    }
}
