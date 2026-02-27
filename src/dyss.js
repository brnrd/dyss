// dyss.js

/**
 * Dynamically create and update a CSS stylesheet from JavaScript.
 * Creates either a DOM-backed `<style>` sheet or a constructed stylesheet and exposes
 * methods to add, update, and remove rules.
 * @example
 * const sheet = new Sheet()
 * sheet.add('.box', { width: '100px', backgroundColor: 'red' })
 */
export default class Sheet {
	/**
	 * Creates a stylesheet in one of two modes:
	 * - `style-tag` (default, for broad compatibility): injects a `<style>` element into `document.head`
	 * - `constructed`: creates a constructable stylesheet and registers it in `document.adoptedStyleSheets`
	 * @param {{ mode?: 'style-tag' | 'constructed' }} [options]
	 */
	constructor(options = {}) {
		const { mode = 'style-tag' } = options
		this.mode = mode
		this._style = null

		if (mode === 'constructed') {
			if (typeof CSSStyleSheet !== 'function' || !('adoptedStyleSheets' in document)) {
				throw new Error('Constructed stylesheet mode requires CSSStyleSheet and document.adoptedStyleSheets support.')
			}
			this.sheet = new CSSStyleSheet()
			document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.sheet]
			return
		}

		if (mode !== 'style-tag') {
			throw new Error(`Unknown Sheet mode: ${mode}`)
		}

		const style = document.createElement('style')
		document.head.appendChild(style)

		this._style = style
		this.sheet = style.sheet
	}

	/**
	 * Sets the `media` attribute on the underlying `<style>` element (e.g. for print or a single breakpoint).
	 * @param {string} mediaAttribute - The media query string (e.g. `'print'` or `'(max-width: 600px)'`).
	 * @example
	 * sheet.addMediaAttribute('(max-width: 600px)')
	 */
	addMediaAttribute(mediaAttribute) {
		if (!this._style) {
			throw new Error('addMediaAttribute() is only available in style-tag mode.')
		}
		this._style.setAttribute('media', mediaAttribute)
	}

	/**
	 * Returns the underlying CSSStyleSheet.
	 * @returns {CSSStyleSheet | null}
	 */
	getSheet() {
		return this.sheet
	}

	_buildRules(set) {
		return Object.entries(set)
			.map(([key, value]) => `${this._cssify(key)}: ${value};`)
			.join(' ')
	}

	_add(selector, rules, index) {
		if (index == null) index = (this.sheet.cssRules || this.sheet.rules).length
		this.sheet.insertRule(`${selector} { ${rules} }`, index)
	}

	/**
	 * Adds a rule to the stylesheet. Property keys use camelCase (e.g. `backgroundColor`, `borderRadius`).
	 * @param {string} selector - CSS selector (e.g. `'.box'`, `'#id'`).
	 * @param {Object.<string, string>} set - Map of CSS property names (camelCase) to values. Use `'value !important'` for important.
	 * @param {number} [index] - Optional index to insert at; default is append.
	 * @example
	 * sheet.add('.card', { width: '200px', backgroundColor: 'black' })
	 * sheet.add('.first', { color: 'red' }, 0)
	 */
	add(selector, set, index) {
		const rules = this._buildRules(set)
		this._add(selector, rules, index)
	}

	/**
	 * Creates a new class with a random name, adds a rule for it, and returns the class name (without the dot).
	 * @param {Object.<string, string>} set - Map of CSS property names (camelCase) to values.
	 * @returns {string} The generated class name (use with `element.classList.add(name)`).
	 * @example
	 * const cls = sheet.addClass({ padding: '16px', color: 'white' })
	 * element.classList.add(cls)
	 */
	addClass(set) {
		const name = this._getRandomName()
		const randomClass = `.${name}`
		this.add(randomClass, set)
		return name
	}

	/**
	 * Merges properties into an existing rule. Creates a new rule if the selector does not exist.
	 * Supports `!important` in values (e.g. `'red !important'`).
	 * @param {string} selector - CSS selector of the rule to update.
	 * @param {Object.<string, string>} set - Map of CSS property names to values (merged into existing rule).
	 * @example
	 * sheet.updateSet('.box', { backgroundColor: 'blue', borderRadius: '8px' })
	 */
	updateSet(selector, set) {
		const rule = this._getSelector(selector)

		if (rule === -1) {
			this.add(selector, set)
			return
		}

		for (const [key, value] of Object.entries(set)) {
			const prop = this._cssify(key)
			const important = typeof value === 'string' && value.includes('!important')
			const val = important ? value.replace(/\s*!important\s*$/i, '').trim() : value
			if (important) {
				rule.style.setProperty(prop, val, 'important')
			} else {
				rule.style[key] = val
			}
		}
	}

	/**
	 * Replaces all properties of an existing rule with the new set. Creates a new rule if the selector does not exist.
	 * @param {string} selector - CSS selector of the rule to replace.
	 * @param {Object.<string, string>} set - Map of CSS property names to values (replaces previous properties).
	 * @example
	 * sheet.replaceSet('.box', { padding: '10px' })  // previous properties removed
	 */
	replaceSet(selector, set) {
		const rule = this._getSelector(selector)
		if (rule === -1) {
			this.add(selector, set)
			return
		}
		// Clear existing properties (iterate backwards when removing)
		for (let i = rule.style.length - 1; i >= 0; i--) {
			rule.style.removeProperty(rule.style[i])
		}
		for (const [key, value] of Object.entries(set)) {
			const prop = this._cssify(key)
			const important = typeof value === 'string' && value.includes('!important')
			const val = important ? value.replace(/\s*!important\s*$/i, '').trim() : value
			if (important) {
				rule.style.setProperty(prop, val, 'important')
			} else {
				rule.style[key] = val
			}
		}
	}

	/**
	 * Removes the rule for the given selector (including rules inside `@media` blocks).
	 * @param {string} selector - CSS selector of the rule to remove.
	 * @example
	 * sheet.remove('.box')
	 */
	remove(selector) {
		const found = this._findRule(selector)
		if (found) found.parent.deleteRule(found.index)
	}

	/**
	 * Removes the rule for a class. Accepts the class name with or without the leading dot.
	 * @param {string} className - Class name (e.g. `'my-class'` or `'.my-class'`).
	 * @example
	 * sheet.removeClass(cls)
	 */
	removeClass(className) {
		const selector = className.startsWith('.') ? className : `.${className}`
		this.remove(selector)
	}

	/**
	 * Removes the underlying `<style>` element or unregisters the constructed stylesheet,
	 * then nulls the instance references. Call when cleaning up (e.g. component unmount).
	 * @example
	 * sheet.destroy()
	 */
	destroy() {
		if (this.sheet && 'adoptedStyleSheets' in document) {
			document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => sheet !== this.sheet)
		}
		if (this._style && this._style.parentNode) {
			this._style.remove()
		}
		this.mode = null
		this._style = null
		this.sheet = null
	}

	/**
	 * Adds a rule inside an `@media` block. Creates the block if it does not exist; reuses it for the same query.
	 * @param {string} mediaQuery - Media query string (e.g. `'(max-width: 600px)'`).
	 * @param {string} selector - CSS selector for the rule inside the media block.
	 * @param {Object.<string, string>} set - Map of CSS property names to values.
	 * @example
	 * sheet.addMedia('(max-width: 600px)', '.box', { padding: '8px' })
	 */
	addMedia(mediaQuery, selector, set) {
		const mediaRule = this._getOrCreateMediaRule(mediaQuery)
		const rules = this._buildRules(set)
		const index = mediaRule.cssRules.length
		mediaRule.insertRule(`${selector} { ${rules} }`, index)
	}

	/**
	 * Adds a rule for a selector with a pseudo-class or pseudo-element (e.g. `:hover`, `::before`).
	 * @param {string} selector - Base selector (e.g. `'.btn'`).
	 * @param {string} pseudo - Pseudo-class or pseudo-element with or without leading colon (e.g. `'hover'` or `':hover'`).
	 * @param {Object.<string, string>} set - Map of CSS property names to values.
	 * @example
	 * sheet.addPseudo('.btn', ':hover', { backgroundColor: 'blue' })
	 */
	addPseudo(selector, pseudo, set) {
		const fullSelector = selector + (pseudo.startsWith(':') ? pseudo : `:${pseudo}`)
		this.add(fullSelector, set)
	}

	/**
	 * Returns the CSSStyleRule for the given selector, or null if not found. Includes rules inside `@media` blocks.
	 * @param {string} selector - CSS selector to look up.
	 * @returns {CSSStyleRule | null}
	 * @example
	 * const rule = sheet.get('.box')
	 * if (rule) console.log(rule.style.color)
	 */
	get(selector) {
		const found = this._findRule(selector)
		return found ? found.rule : null
	}

	// Helpers

	_findRule(selector) {
		const rules = this.sheet?.cssRules || this.sheet?.rules || []
		for (let i = 0; i < rules.length; i++) {
			const r = rules[i]
			if (r.selectorText === selector) return { parent: this.sheet, index: i, rule: r }
			if (r.cssRules) {
				for (let j = 0; j < r.cssRules.length; j++) {
					if (r.cssRules[j].selectorText === selector) return { parent: r, index: j, rule: r.cssRules[j] }
				}
			}
		}
		return null
	}

	_getOrCreateMediaRule(mediaQuery) {
		const rules = this.sheet.cssRules || this.sheet.rules
		for (const r of rules) {
			if (r.media && r.media.mediaText === mediaQuery) return r
		}
		const index = rules.length
		this.sheet.insertRule(`@media ${mediaQuery} {}`, index)
		return rules[index]
	}

	_cssify(property) {
		// Converts camelCase to kebab-case for single hump, e.g. backgroundColor -> background-color
		const parts = property.split(/(?=[A-Z])/)

		if (Array.isArray(parts) && parts.length === 2) {
			parts[1] = parts[1].toLowerCase()
			return parts.join('-')
		}

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
		const firstChar = selector.charAt(0)

		if (firstChar === '.') return 'class'
		if (firstChar === '#') return 'id'
		return 'element'
	}
}
