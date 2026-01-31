import Sheet from '../lib/dyss.js'

function $(id) {
	return document.getElementById(id)
}

const sheet = new Sheet()

// Create a reusable class once, then update its rules live.
const cardClassName = sheet.addClass({
	display: 'block',
	padding: '16px',
	width: '360px',
	borderRadius: '16px',
	backgroundColor: '#1f2937',
	color: '#f9fafb',
	boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
	fontSize: '16px',
	lineHeight: '1.35'
})

const preview = $('preview')
preview.classList.add(cardClassName)

$('className').textContent = `Dynamic class: .${cardClassName}`

const state = {
	width: Number($('width').value),
	radius: Number($('radius').value),
	bg: $('bg').value,
	fg: $('fg').value,
	shadow: $('shadow').value,
	size: $('size').value
}

function apply() {
	sheet.updateSet(`.${cardClassName}`, {
		width: `${state.width}px`,
		borderRadius: `${state.radius}px`,
		backgroundColor: state.bg,
		color: state.fg,
		boxShadow: state.shadow,
		fontSize: state.size
	})
}

function bindRange(id, key) {
	const el = $(id)
	el.addEventListener('input', () => {
		state[key] = Number(el.value)
		apply()
	})
}

function bindValue(id, key) {
	const el = $(id)
	el.addEventListener('input', () => {
		state[key] = el.value
		apply()
	})
	el.addEventListener('change', () => {
		state[key] = el.value
		apply()
	})
}

bindRange('width', 'width')
bindRange('radius', 'radius')
bindValue('bg', 'bg')
bindValue('fg', 'fg')
bindValue('shadow', 'shadow')
bindValue('size', 'size')

apply()