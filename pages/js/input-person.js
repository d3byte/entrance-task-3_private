var users = [
    { id: 1, name: 'Лекс Лютер', floor: 7 }, 
    { id: 2, name: 'Томас Андерсон', floor: 2 },
    { id: 3, name: 'Дарт Вейдер', floor: 1 }, 
    { id: 4, name: 'Кларк Кент', floor: 2 },
]

var invitedUsers = []

// Эвент, чтобы закрывать список юзеров после добавления
var personAdded = new Event('person-added')

// Обработчик для отображения подходящих пользователей под введённое имя
function inputHandler(e) {
    var text = e.target.value
    if(text != '') {
        var suitableUser = users.map(user => {
            if (user.name.indexOf(text) !== -1) {
                return user
            }
        })
        suitableUser = suitableUser.filter(item => item != undefined)
        if (suitableUser[0]) {
            var previousSuitable = document.querySelector('li.person.suitable')
            if (previousSuitable)
                previousSuitable.classList.remove('suitable')
            var nextSuitable = document.querySelector(`.person.p-${suitableUser[0].id}`)
            var copy = nextSuitable.cloneNode(true)
            copy.classList.add('suitable')
            copy.addEventListener('click', () => addUser(suitableUser[0]))
            nextSuitable.remove()
            document.querySelector('ul.people').insertBefore(copy, document.querySelector('ul.people').firstChild)
        }
    }
}

// Добавляю юзера в список снизу
function addUser(user) {
    invitedUsers.push(user)
    var userContainer = document.createElement('div')
    userContainer.classList.add('invited-person', `p-${user.id}`)
    userContainer.innerHTML = `
        <div class="person-wrapper">
            <img src="desktop-assets/close-white.svg" class="avatar"> ${user.name}
        </div>
    `
    var img = document.createElement('img')
    img.setAttribute('src', 'desktop-assets/close.svg')
    img.classList.add('icon')
    img.addEventListener('click', () => removeUser(user))
    userContainer.appendChild(img)
    document.querySelector('.invited-people').appendChild(userContainer)
    document.querySelector(`ul.people li.p-${user.id}`).remove()
    // Создаю эвент об успешном добавлении
    document.dispatchEvent(personAdded)
    document.querySelector('.input-dropdown').classList.add('hide')
}

// Убираю юзера из этого списка
function removeUser(user) {
    invitedUsers = invitedUsers.filter(invitedUser => invitedUser.id != user.id)
    document.querySelector(`.invited-people .p-${user.id}`).remove()
    var userContainer = document.createElement('li')
    userContainer.classList.add('person', `p-${user.id}`)
    userContainer.innerHTML = `
            <img src="desktop-assets/close.svg">
            <span class="name">${user.name}</span>
            <span class="dot">&#183;</span>
            <span class="floor">${user.floor} этаж</span>
        `
    userContainer.addEventListener('click', () => addUser(user))
    document.querySelector('ul.people').appendChild(userContainer)
}

// Показываю список пользователей для приглашения
function showUserList() {
    document.querySelector('.input-dropdown').classList.remove('hide')
}

// Скрываю список пользователей для приглашения
function hideUserList(e) {
    // Проверяю, если был нажат элемент списка пользователей
    var clickedPlace = e.explicitOriginalTarget,
        allowedClasses = ['name', 'input-dropdown', 'people', 'person', 'avatar', 'dot', 'floor'],
        clickedPerson = false
    allowedClasses.map(className => {
        if (clickedPlace.classList && clickedPlace.classList.contains(className)) {
            clickedPerson = true
        }
    })
    // Если нажат не список, то закрываю меню сразу. Если список, то закрываю после того,
    // как список обновлён
    if(clickedPerson) {
        document.addEventListener('person-added', () => {
            document.querySelector('.input-dropdown').classList.add('hide')
        })
    } else {
        document.querySelector('.input-dropdown').classList.add('hide')
    }   
}

// Рендерю список пользователей
function renderUserList(users) {
    users.map(user => {
        var userContainer = document.createElement('li')
        userContainer.classList.add('person', `p-${user.id}`)
        userContainer.innerHTML = `
            <img src="desktop-assets/close.svg" class="avatar">
            <span class="name">${user.name}</span>
            <span class="dot">&#183;</span>
            <span class="floor">${user.floor} этаж</span>
        `
        userContainer.addEventListener('click', e => addUser(user))
        document.querySelector('ul.people').appendChild(userContainer)
    })
}

renderUserList(users)

document.querySelector('.labeled-input.participants input').addEventListener('input', e => inputHandler(e))
document.querySelector('.labeled-input.participants input').addEventListener('focus', showUserList)
document.querySelector('.labeled-input.participants input').addEventListener('blur',e => hideUserList(e))