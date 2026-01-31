// dyss.js
export default class Sheet {
	constructor() {
		const style = document.createElement('style')
		document.head.appendChild(style)

		this._style = style
		this.sheet = style.sheet
	}

	addMediaAttribute(mediaAttribute) {
		// In the CoffeeScript this referenced @_style, but it was never set.
		// Keeping the intended behaviour by storing the <style> element in this._style.
		this._style.setAttribute('media', mediaAttribute)
	}

	getSheet() {
		return this.sheet
	}

	_add(selector, rules, index) {
		// CoffeeScript likely intended: default to 0 when index is not provided.
		if (index == null) index = 0

		if (this.sheet.insertRule) {
			this.sheet.insertRule(`${selector} { ${rules} }`, index)
		} else {
			// Legacy IE API (rare nowadays, but kept for parity)
			this.sheet.addRule(selector, rules, index)
		}
	}

	add(selector, set) {
		const rules = Object.entries(set)
			.map(([key, value]) => `${this._cssify(key)}: ${value};`)
			.join(' ')

		this._add(selector, rules)
	}

	addClass(set) {
		const name = this._getRandomName()
		const randomClass = `.${name}`
		this.add(randomClass, set)
		return name
	}

	updateSet(selector, set) {
		const rule = this._getSelector(selector)

		if (rule === -1) {
			this.add(selector, set)
			return
		}

		for (const [key, value] of Object.entries(set)) {
			// CSSStyleRule.style supports camelCase property names
			rule.style[key] = value
		}
	}

	// Helpers

	_cssify(property) {
		// Converts camelCase to kebab-case for single hump, e.g. backgroundColor -> background-color
		const parts = property.split(/(?=[A-Z])/)

		if (Array.isArray(parts) && parts.length === 2) {
			parts[1] = parts[1].toLowerCase()
			return parts.join('-')
		}

		// If it splits into more than 2 parts, keep the original behaviour as close as possible:
		// CoffeeScript returned `temp` (an array) which would stringify oddly.
		// Returning a sensible kebab-case for general camelCase:
		return parts.map((p, i) => (i === 0 ? p : p.toLowerCase())).join('-')
	}

	_getSelector(selector) {
		const rulesArray = this.sheet.rules || this.sheet.cssRules || []
		for (const rule of rulesArray) {
			if (rule && rule.selectorText === selector) return rule
		}
		return -1
	}

	_getRandomName(length = 8) {
		let name = ''
		while (name.length < length) {
			name += Math.random().toString(36).substr(2)
		}
		return name.substr(0, length)
	}

	_getSelectorType(selector) {
		// CoffeeScript had `chatAt` (typo). Using `charAt`.
		const firstChar = selector.charAt(0)

		if (firstChar === '.') return 'class'
		if (firstChar === '#') return 'id'
		return 'element'
	}
}