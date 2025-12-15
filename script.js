let field = document.querySelector('.calendar')

for (let i = 1; i < 36; i += 1) {
    let cell = document.createElement('div')
    cell.classList.add('day')
    cell.setAttribute('id', `${i}`)
    if(i > 31) {
        cell.innerHTML = i - 31
    } else {
        cell.innerHTML = i
    }
    
    field.appendChild(cell)
}

let now = new Date();
let monthIndex = now.getMonth(); // 0-11
let months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
let month = document.querySelector('h1')
month.innerHTML = months[monthIndex]

document.querySelector('.previous-month').addEventListener('click', function() {
    monthIndex -= 1
    if (monthIndex < 0) {
        monthIndex = months.length - 1
    }
    month.innerHTML = months[monthIndex]
    
})

document.querySelector('.next-month').addEventListener('click', function() {
    monthIndex += 1
    if (monthIndex > months.length - 1) {
        monthIndex = 0
    }
    month.innerHTML = months[monthIndex]
    
})