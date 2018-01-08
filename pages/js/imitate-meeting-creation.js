// Создаю встречу (нет)
function createMeeting() {
    localStorage.setItem('success', 'true')
    window.location.replace('/pages/main.html')
}

// Проверяю, создана ли была встреча или нет
function checkForMeetingCreation() {
    if (localStorage.success == 'true') {
        localStorage.removeItem('success')
        $.modalwindow({ target: '#created-meeting' })
    }
}

if (window.location.pathname == '/pages/main.html') {
    checkForMeetingCreation()
}