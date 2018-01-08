var oldScroll = 0

// Это работает только на мобильных устройствах, так как на
// декстопе, в режиме адаптивности, не получается прокрутить 
// в отрицательное значение
function handleScroll(e) {
    var scroll = e.currentTarget.scrollLeft
    if(scroll > oldScroll) {
        oldScroll += scroll
    } else {
        oldScroll -= scroll
    }
    if (scroll >= 50) {
        document.querySelector('.left-bar').classList.add('hide')
        document.querySelector('.right-bar').classList.add('scrolled')
    } else if (scroll < -50) {
        document.querySelector('.left-bar').classList.remove('hide')
        document.querySelector('.right-bar').classList.remove('scrolled')
    }
}

var screenWidth = window.screen.innerWidth || document.clientWidth || document.body.clientWidth

document.querySelector('.right-bar').addEventListener('scroll', e => {
    if(screenWidth <= 768) {
        handleScroll(e)
    }
})
