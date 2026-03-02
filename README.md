# dyss

![npm](https://img.shields.io/npm/v/dyss) ![npm](https://img.shields.io/npm/dm/dyss)

A tiny utility to dynamically create and update CSS stylesheets from JavaScript.

`dyss` lets you generate CSS rules at runtime, update them efficiently, and avoid inline styles while keeping your UI fully dynamic.

This project is a modernised ES module version of the original CoffeeScript implementation.

For live examples and backstory, see https://vegetalope.com/build/dyss/.

**Documentation:** Read the latest published docs at https://vegetalope.com/build/dyss/docs/.
The source is also documented with JSDoc, so your editor will still show parameter types, return types, and examples on hover.

---

## Install from npm

```bash
npm install dyss
```

## Basic example

```js
import Sheet from 'dyss'

const sheet = new Sheet()

sheet.add('.box', {
	width: '120px',
	height: '120px',
	backgroundColor: 'red',
	position: 'absolute',
	top: '40px',
	left: '40px'
})
```

This creates a real stylesheet and inserts a CSS rule for `.box`.

If you want a constructable stylesheet that is also registered in `document.adoptedStyleSheets`, use:

```js
const constructedSheet = new Sheet({ mode: 'constructed' })
```

---

## Create a dynamic class

You can generate a unique class name and reuse it later.

```js
const className = sheet.addClass({
	padding: '16px',
	backgroundColor: '#1f2937',
	color: 'white',
	borderRadius: '12px'
})

// Apply it to any element
element.classList.add(className)
```

---

## Update an existing rule

```js
sheet.updateSet(`.${className}`, {
	backgroundColor: '#2563eb',
	borderRadius: '24px'
})
```

Only the rule inside the stylesheet is modified, not the element styles.

---

## API

Quick reference based on the published docs. The current public surface is 15 items total: 2 instance properties and 13 public methods.

### `sheet.mode`

Stores the active creation mode for the instance.

- Starts as `style-tag` by default unless you pass a different mode to the constructor.
- After `destroy()`, dyss sets this property to `null`.

### `sheet.sheet`

Holds the underlying native stylesheet object used for rule insertion and lookup.

- This is the same object returned by `getSheet()`.
- After `destroy()`, dyss clears the property and sets it to `null`.

### `new Sheet(options?: { mode?: 'style-tag' | 'constructed' })`

Creates a stylesheet instance in the browser and stores the underlying `CSSStyleSheet` on the instance.

- `style-tag` is the default and injects a real `<style>` element into `document.head`.
- `constructed` uses `new CSSStyleSheet()` and appends it to `document.adoptedStyleSheets`.
- Constructed mode throws if the current browser does not support constructable stylesheets.

```js
import Sheet from 'dyss'

const sheet = new Sheet()
const adopted = new Sheet({ mode: 'constructed' })
```

### `sheet.addMediaAttribute(mediaAttribute)`

Sets the `media` attribute on the backing `<style>` tag.

- Only available in `style-tag` mode.
- Useful when the entire stylesheet should apply only to `print` or a single media query.

```js
const sheet = new Sheet()

sheet.addMediaAttribute('(max-width: 60rem)')
```

### `sheet.getSheet()`

Returns the underlying native `CSSStyleSheet` instance.

```js
const nativeSheet = sheet.getSheet()

if (nativeSheet) {
	console.log(nativeSheet.cssRules.length)
}
```

### `sheet.add(selector, set, index?)`

Inserts a CSS rule for a selector using an object of camelCase style declarations.

- Property keys should follow the same naming style as `element.style`, such as `backgroundColor`.
- If `index` is omitted, the rule is appended to the end of the stylesheet.

```js
sheet.add('.card', {
	padding: '1rem',
	backgroundColor: '#111827',
	color: '#ffffff'
})

sheet.add('.card--first', { order: '0' }, 0)
```

### `sheet.addClass(set)`

Generates a random class name, inserts a rule for it, and returns the class name without a leading dot.

- The returned value is intended for `element.classList.add(...)`.
- Internally, dyss prefixes the generated name with `.` before inserting the rule.

```js
const pillClass = sheet.addClass({
	padding: '0.4rem 0.7rem',
	borderRadius: '999px',
	backgroundColor: '#c21f2b',
	color: '#ffffff'
})

button.classList.add(pillClass)
```

### `sheet.updateSet(selector, set)`

Merges declarations into an existing rule, or creates the rule if it does not exist yet.

- This preserves existing properties that are not mentioned in the new set.
- Values ending in `!important` are applied with `style.setProperty(..., 'important')`.

```js
sheet.updateSet('.card', {
	backgroundColor: '#2563eb',
	borderRadius: '1rem',
	color: '#ffffff !important'
})
```

### `sheet.replaceSet(selector, set)`

Removes every existing declaration from a rule, then applies the new set.

- This is a full replacement, not a merge.
- If the selector is missing, dyss creates a new rule first.

```js
sheet.replaceSet('.card', {
	display: 'grid',
	gap: '0.75rem'
})
```

### `sheet.remove(selector)`

Deletes the matching rule from the stylesheet.

- The lookup includes top-level rules and rules nested inside `@media` blocks.

```js
sheet.remove('.card')
```

### `sheet.removeClass(className)`

Deletes a class rule using either the raw class name or the dotted selector form.

- Passing `badge` and `.badge` both target the same `.badge` rule.

```js
const badgeClass = sheet.addClass({ color: '#ffffff' })

sheet.removeClass(badgeClass)
sheet.removeClass('.legacy-badge')
```

### `sheet.destroy()`

Cleans up the stylesheet and clears the instance references.

- In `style-tag` mode, dyss removes the injected `<style>` element from the DOM.
- In `constructed` mode, dyss removes the sheet from `document.adoptedStyleSheets`.

```js
const sheet = new Sheet()

sheet.add('.toast', { opacity: '1' })

// later, during teardown
sheet.destroy()
```

### `sheet.addMedia(mediaQuery, selector, set)`

Adds a selector rule inside an `@media` block, creating the media block on first use.

- Reuses an existing `@media` rule when the same media query string is used again.
- Rules inside the block are appended in insertion order.

```js
sheet.addMedia('(max-width: 48rem)', '.card', {
	padding: '0.75rem',
	fontSize: '0.95rem'
})
```

### `sheet.addPseudo(selector, pseudo, set)`

Adds a rule for a pseudo-class or pseudo-element.

- The `pseudo` argument may be passed as `hover` or `:hover`.
- Pseudo-elements such as `::before` also work.

```js
sheet.addPseudo('.button', ':hover', {
	backgroundColor: '#1a2747',
	color: '#ffffff'
})

sheet.addPseudo('.button', '::before', {
	content: '""',
	display: 'block'
})
```

### `sheet.get(selector)`

Returns the matching `CSSStyleRule`, or `null` when no rule matches.

- Like `remove()`, this searches top-level rules and rules nested inside media queries.
- Once you have the rule, you can inspect `rule.style`, `rule.cssText`, and other CSSOM properties.

```js
const rule = sheet.get('.card')

if (rule) {
	console.log(rule.style.backgroundColor)
}
```

---

## Running the Example Locally (Modern JS/ESM Approach)

To use ES modules in the browser, your files must be served over HTTP(S)—directly opening HTML files via `file://` does **not** support ESM in modern browsers.

We recommend using a minimal JS-friendly dev server. Here are two common ways:

**Option 1: Using [vite](https://vitejs.dev/) (recommended for JS projects)**

```bash
npm create vite@latest  # or, if already initialized: npm install vite --save-dev
npx vite --root=example
```

Then open:

```
http://localhost:5173/
```


**Tip:** You can use other modern dev servers like [`serve`](https://www.npmjs.com/package/serve), [`http-server`](https://www.npmjs.com/package/http-server), etc. Pick whichever suits your stack.

---

## Build and minify

This project uses `esbuild`.

Install it:

```bash
npm install --save-dev esbuild
```

Build and minify:

```bash
npx esbuild src/dyss.js --bundle --minify --format=esm --target=es2019 --outfile=dist/dyss.min.js
```

---

## Browser support

`style-tag` mode works in modern evergreen browsers.

`constructed` mode requires `document.adoptedStyleSheets` and constructable `CSSStyleSheet` support.
