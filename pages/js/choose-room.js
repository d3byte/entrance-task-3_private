function chooseRoom(roomInfo) {
    document.querySelector('.labeled-room.list').classList.add('hide')
    var room = document.createElement('div')
    room.classList.add('labeled-room', 'active')
    room.innerHTML = `
        <label>Ваша переговорка</label>
        <div class="room">
            <div class="info">
                <span class="time">16:00–16:30</span>
                <span class="location">${roomInfo.title} &#183; ${roomInfo.floor} этаж</span>
            </div>
            <img src="desktop-assets/close-white.svg" onclick="cancelRoom()">
        </div>
    `
    document.querySelector('.room-interface').appendChild(room)
    if (window.location.pathname == '/pages/new-meeting.html') {
        document.querySelector('.button.create').classList.add('blue')
        document.querySelector('.button.create').disabled = false
    } else if (window.location.pathname == '/pages/edit-meeting.html') {
        document.querySelector('.button.save').classList.add('blue')
        document.querySelector('.button.save').disabled = false
    }
    document.querySelector('footer .hide-desktop').classList.add('hide')
    document.querySelector('.body-wrapper').classList.remove('marg-b')
    document.querySelector('.body-wrapper').classList.add('marg-b-sm')
}

function cancelRoom() {
    document.querySelector('.labeled-room.active').remove()
    document.querySelector('.labeled-room.list').classList.remove('hide')
    if (window.location.pathname == '/pages/new-meeting.html') {
        document.querySelector('.button.create').classList.remove('blue')
        document.querySelector('.button.create').disabled = true
    } else if (window.location.pathname == '/pages/edit-meeting.html') {
        document.querySelector('.button.save').classList.remove('blue')
        document.querySelector('.button.save').disabled = true
    }
    document.querySelector('footer .hide-desktop').classList.remove('hide')
    document.querySelector('.body-wrapper').classList.add('marg-b')
    document.querySelector('.body-wrapper').classList.remove('marg-b-sm')
}