import Sheet from 'dyss'

const sheet = new Sheet()

const cls = sheet.addClass({
	padding: '16px',
	backgroundColor: '#2563eb',
	color: 'white',
	borderRadius: '12px',
	transition: 'border-radius 150ms ease'
})

document.querySelector('.card').classList.add(cls)

const radius = document.getElementById('radius')
radius.addEventListener('input', () => {
	sheet.updateSet(`.${cls}`, { borderRadius: `${radius.value}px` })
})