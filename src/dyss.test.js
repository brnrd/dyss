import { describe, it, expect, beforeEach } from 'vitest'
import Sheet from './dyss.js'

describe('Sheet', () => {
	let sheet

	beforeEach(() => {
		// Clear any previous style elements from head so tests don't interfere
		document.head.querySelectorAll('style').forEach((el) => el.remove())
		sheet = new Sheet()
	})

	describe('constructor', () => {
		it('appends a style element to document.head', () => {
			const styles = document.head.querySelectorAll('style')
			expect(styles.length).toBeGreaterThanOrEqual(1)
			expect(styles[styles.length - 1]).toBe(sheet._style)
		})

		it('exposes the CSSStyleSheet via sheet and getSheet()', () => {
			expect(sheet.sheet).toBeDefined()
			expect(sheet.getSheet()).toBe(sheet.sheet)
		})
	})

	describe('addMediaAttribute', () => {
		it('sets the media attribute on the style element', () => {
			sheet.addMediaAttribute('print')
			expect(sheet._style.getAttribute('media')).toBe('print')
		})

		it('overwrites previous media attribute', () => {
			sheet.addMediaAttribute('screen')
			sheet.addMediaAttribute('(max-width: 600px)')
			expect(sheet._style.getAttribute('media')).toBe('(max-width: 600px)')
		})
	})

	describe('add', () => {
		it('inserts a rule with selector and camelCase properties converted to kebab-case', () => {
			sheet.add('.foo', { color: 'red', backgroundColor: 'blue' })
			const rules = sheet.sheet.cssRules || sheet.sheet.rules
			expect(rules.length).toBe(1)
			expect(rules[0].selectorText).toMatch(/\.foo/)
			expect(rules[0].cssText).toContain('color')
			expect(rules[0].cssText).toContain('background-color')
			expect(rules[0].cssText).toContain('red')
			expect(rules[0].cssText).toContain('blue')
		})

		it('supports multiple properties', () => {
			sheet.add('#bar', { marginTop: '10px', paddingLeft: '5px' })
			const rules = sheet.sheet.cssRules || sheet.sheet.rules
			expect(rules.length).toBe(1)
			expect(rules[0].cssText).toContain('margin-top')
			expect(rules[0].cssText).toContain('padding-left')
		})
	})

	describe('addClass', () => {
		it('returns a non-empty class name (without the dot)', () => {
			const name = sheet.addClass({ color: 'green' })
			expect(typeof name).toBe('string')
			expect(name.length).toBeGreaterThan(0)
			expect(name).not.toMatch(/^\./)
		})

		it('adds a rule for the generated class', () => {
			const name = sheet.addClass({ color: 'green' })
			const rules = sheet.sheet.cssRules || sheet.sheet.rules
			expect(rules.length).toBe(1)
			const rule = rules[0]
			expect(rule.style.color).toBe('green')
			// selectorText can escape digits (e.g. .1foo -> .\31 foo); normalize for comparison
			if (rule.selectorText != null) {
				const raw = rule.selectorText.trim().replace(/^\.\s*/, '')
				const unescaped = raw.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, hex) =>
					String.fromCharCode(parseInt(hex, 16))
				)
				expect(unescaped).toBe(name)
			}
		})
	})

	describe('updateSet', () => {
		it('adds a new rule when selector does not exist', () => {
			sheet.updateSet('.new', { color: 'red' })
			const rule = sheet._getSelector('.new')
			expect(rule).not.toBe(-1)
			expect(rule.style.color).toBe('red')
		})

		it('updates existing rule when selector exists', () => {
			sheet.add('.existing', { color: 'red' })
			sheet.updateSet('.existing', { color: 'blue', fontSize: '12px' })
			const rule = sheet._getSelector('.existing')
			expect(rule).not.toBe(-1)
			expect(rule.style.color).toBe('blue')
			expect(rule.style.fontSize).toBe('12px')
		})
	})

	describe('_cssify', () => {
		it('converts single camelCase to kebab-case', () => {
			expect(sheet._cssify('backgroundColor')).toBe('background-color')
		})

		it('converts multi-hump camelCase to kebab-case', () => {
			expect(sheet._cssify('borderTopLeftRadius')).toBe('border-top-left-radius')
		})

		it('leaves lowercase property unchanged for single word', () => {
			expect(sheet._cssify('color')).toBe('color')
		})
	})

	describe('_getSelector', () => {
		it('returns the rule when selector exists', () => {
			sheet.add('.found', { color: 'red' })
			const rule = sheet._getSelector('.found')
			expect(rule).not.toBe(-1)
			expect(rule.selectorText).toMatch(/\.found/)
		})

		it('returns -1 when selector does not exist', () => {
			expect(sheet._getSelector('.nonexistent')).toBe(-1)
		})
	})

	describe('_getRandomName', () => {
		it('returns a string of default length 8', () => {
			const name = sheet._getRandomName()
			expect(name.length).toBe(8)
			expect(name).toMatch(/^[a-z0-9]+$/)
		})

		it('respects custom length', () => {
			const name = sheet._getRandomName(12)
			expect(name.length).toBe(12)
		})

		it('returns only alphanumeric characters', () => {
			const name = sheet._getRandomName(10)
			expect(name).toMatch(/^[a-z0-9]+$/)
		})
	})

	describe('_getSelectorType', () => {
		it('returns "class" for class selector', () => {
			expect(sheet._getSelectorType('.my-class')).toBe('class')
		})

		it('returns "id" for id selector', () => {
			expect(sheet._getSelectorType('#my-id')).toBe('id')
		})

		it('returns "element" for element selector', () => {
			expect(sheet._getSelectorType('div')).toBe('element')
		})
	})

	describe('remove', () => {
		it('removes a rule by selector', () => {
			sheet.add('.gone', { color: 'red' })
			expect(sheet.get('.gone')).not.toBeNull()
			sheet.remove('.gone')
			expect(sheet.get('.gone')).toBeNull()
		})

		it('does nothing when selector does not exist', () => {
			sheet.remove('.nonexistent')
			expect(sheet.sheet.cssRules.length).toBe(0)
		})
	})

	describe('removeClass', () => {
		it('removes rule for class name (without dot)', () => {
			const name = sheet.addClass({ color: 'blue' })
			expect(sheet.get(`.${name}`)).not.toBeNull()
			sheet.removeClass(name)
			expect(sheet.get(`.${name}`)).toBeNull()
		})

		it('removes rule when passed with dot', () => {
			const name = sheet.addClass({ color: 'blue' })
			sheet.removeClass(`.${name}`)
			expect(sheet.get(`.${name}`)).toBeNull()
		})
	})

	describe('destroy', () => {
		it('removes the style element from document.head', () => {
			const style = sheet._style
			expect(document.head.contains(style)).toBe(true)
			sheet.destroy()
			expect(document.head.contains(style)).toBe(false)
		})

		it('nulls _style and sheet', () => {
			sheet.destroy()
			expect(sheet._style).toBeNull()
			expect(sheet.sheet).toBeNull()
		})
	})

	describe('addMedia', () => {
		it('adds a rule inside a media query', () => {
			sheet.addMedia('(max-width: 600px)', '.box', { padding: '8px' })
			const rules = sheet.sheet.cssRules || sheet.sheet.rules
			expect(rules.length).toBe(1)
			expect(rules[0].media).toBeDefined()
			expect(rules[0].media.mediaText).toBe('(max-width: 600px)')
			expect(rules[0].cssRules.length).toBe(1)
			expect(rules[0].cssRules[0].selectorText).toMatch(/\.box/)
			expect(rules[0].cssRules[0].style.padding).toBe('8px')
		})

		it('reuses existing @media block for same query', () => {
			sheet.addMedia('(max-width: 600px)', '.a', { color: 'red' })
			sheet.addMedia('(max-width: 600px)', '.b', { color: 'blue' })
			const rules = sheet.sheet.cssRules
			expect(rules.length).toBe(1)
			expect(rules[0].cssRules.length).toBe(2)
		})
	})

	describe('add with index', () => {
		it('inserts rule at given index', () => {
			sheet.add('.first', { color: 'red' })
			sheet.add('.third', { color: 'blue' })
			sheet.add('.second', { color: 'green' }, 1)
			const rules = sheet.sheet.cssRules
			expect(rules[0].selectorText).toMatch(/\.first/)
			expect(rules[1].selectorText).toMatch(/\.second/)
			expect(rules[2].selectorText).toMatch(/\.third/)
		})
	})

	describe('get', () => {
		it('returns the rule when selector exists', () => {
			sheet.add('.found', { color: 'red' })
			const rule = sheet.get('.found')
			expect(rule).not.toBeNull()
			expect(rule.selectorText).toMatch(/\.found/)
			expect(rule.style.color).toBe('red')
		})

		it('returns null when selector does not exist', () => {
			expect(sheet.get('.missing')).toBeNull()
		})
	})

	describe('addPseudo', () => {
		it('adds rule for selector + pseudo', () => {
			sheet.addPseudo('.btn', ':hover', { backgroundColor: 'blue' })
			const rule = sheet.get('.btn:hover')
			expect(rule).not.toBeNull()
			expect(rule.style.backgroundColor).toBe('blue')
		})

		it('adds colon if pseudo does not start with :', () => {
			sheet.addPseudo('.link', 'hover', { color: 'red' })
			expect(sheet.get('.link:hover')).not.toBeNull()
		})
	})

	describe('!important', () => {
		it('add() preserves !important in declaration', () => {
			sheet.add('.imp', { color: 'red !important' })
			const rule = sheet.get('.imp')
			expect(rule.style.getPropertyPriority('color')).toBe('important')
			expect(rule.style.color).toBe('red')
		})

		it('updateSet() applies !important via setProperty', () => {
			sheet.add('.x', { color: 'red' })
			sheet.updateSet('.x', { color: 'blue !important' })
			const rule = sheet.get('.x')
			expect(rule.style.getPropertyPriority('color')).toBe('important')
			expect(rule.style.color).toBe('blue')
		})
	})

	describe('replaceSet', () => {
		it('replaces all properties when rule exists', () => {
			sheet.add('.rep', { color: 'red', fontSize: '12px' })
			sheet.replaceSet('.rep', { padding: '10px' })
			const rule = sheet.get('.rep')
			expect(rule.style.color).toBe('')
			expect(rule.style.fontSize).toBe('')
			expect(rule.style.padding).toBe('10px')
		})

		it('adds new rule when selector does not exist', () => {
			sheet.replaceSet('.new', { margin: '5px' })
			expect(sheet.get('.new')).not.toBeNull()
			expect(sheet.get('.new').style.margin).toBe('5px')
		})
	})
})
