# dyss

![npm](https://img.shields.io/npm/v/dyss) ![npm](https://img.shields.io/npm/dm/dyss)

A tiny utility to dynamically create and update CSS stylesheets from JavaScript.

`dyss` lets you generate CSS rules at runtime, update them efficiently, and avoid inline styles while keeping your UI fully dynamic.

This project is a modernised ES module version of the original CoffeeScript implementation.

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

### new Sheet()

Creates a new `<style>` element and an associated stylesheet.

---

### sheet.add(selector, set)

Adds a rule to the stylesheet.

```js
sheet.add('.card', {
	width: '200px',
	backgroundColor: 'black'
})
```

The keys must use the same naming convention as `element.style`
(camelCase, for example `backgroundColor`, `borderRadius`, etc.).

---

### sheet.addClass(set) → string

Creates a new class with a random name and returns it.

```js
const cls = sheet.addClass({ color: 'red' })
```

---

### sheet.updateSet(selector, set)

Updates an existing rule.

If the selector does not exist yet, it is created automatically.

---

### sheet.addMediaAttribute(value)

Sets the `media` attribute on the underlying `<style>` element.

```js
sheet.addMediaAttribute('(max-width: 600px)')
```

---

## Important note about local development

When using ES modules, your files must be served over HTTP.

Opening the HTML file directly with `file://` will not work in modern browsers.

For example:

```bash
cd example
python3 -m http.server 8000
```

Then open:

```
http://localhost:8000/
```

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

Works in all modern evergreen browsers (Chrome, Firefox, Safari, Edge).
