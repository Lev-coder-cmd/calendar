let field = document.querySelector('.calendar')

for (let i = 0; i < 35; i += 1) {
    let cell = document.createElement('div')
    cell.classList.add('day')
    cell.setAttribute('id', `${i}`)
    field.appendChild(cell)
}