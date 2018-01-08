// Добавить подсветку комнаты
function highlightRoom(element) {
    var roomContainer = element.parentElement
    var roomId = roomContainer.classList[1].slice(2)
    var rowsContainer = roomContainer.parentElement
    var floorContainer = rowsContainer.parentElement
    var floorId = floorContainer.classList[1].slice(2)
    var room = document.querySelector(`.floor-container.f-${floorId} .rooms .room.r-${roomId}`)
    if (!room.classList.contains('disabled')) {
        room.classList.add('active')
    }
}

// Убрать подсветку комнаты
function stopHighlighting(e, event) {
    var activeFloor = document.querySelector('.floor-container .room.active')
    if(activeFloor) {
        activeFloor.classList.remove('active')
    }
}

// Ставлю обработчики эвентов на кнопки в колонках
fetchEvents(0).then(res => {
    var freeSpace = document.querySelectorAll(`.room a`)
    for(let element of freeSpace) {
        element.addEventListener('mouseover', e => highlightRoom(element))
        element.addEventListener('mouseout', e => stopHighlighting(element))
    }            
})