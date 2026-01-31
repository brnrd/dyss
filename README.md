# dyss

![npm](https://img.shields.io/npm/v/dyss) ![npm](https://img.shields.io/npm/dm/dyss)

A tiny utility to dynamically create and update CSS stylesheets from JavaScript.

`dyss` lets you generate CSS rules at runtime, update them efficiently, and avoid inline styles while keeping your UI fully dynamic.

This project is a modernised ES module version of the original CoffeeScript implementation.

**Documentation:** The source is fully documented with JSDoc. In your editor you get parameter types, return types, and short examples on hover. The API section below is a quick reference; for details, open `src/dyss.js` or rely on your IDE.

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

Quick reference. JSDoc in the source provides types and examples for your editor.

### new Sheet()

Creates a new `<style>` element and an associated stylesheet.

---

### sheet.add(selector, set, index?)

Adds a rule to the stylesheet. Optionally pass `index` to insert at a specific position (default is append).

```js
sheet.add('.card', {
	width: '200px',
	backgroundColor: 'black'
})
sheet.add('.inserted', { color: 'red' }, 0)  // insert at index 0
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

### sheet.addMedia(mediaQuery, selector, set)

Adds a rule inside an `@media` block. Creates the block if it does not exist; reuses it for the same query.

```js
sheet.addMedia('(max-width: 600px)', '.box', { padding: '8px' })
```

---

### sheet.addPseudo(selector, pseudo, set)

Adds a rule for a selector with a pseudo-class or pseudo-element (e.g. `:hover`, `::before`).

```js
sheet.addPseudo('.btn', ':hover', { backgroundColor: 'blue' })
sheet.addPseudo('.link', '::after', { content: '""' })
```

---

### sheet.updateSet(selector, set)

Merges properties into an existing rule. If the selector does not exist, a new rule is created.

---

### sheet.replaceSet(selector, set)

Replaces all properties of an existing rule with the new set. If the selector does not exist, a new rule is created.

---

### sheet.get(selector) → CSSStyleRule | null

Returns the rule for the given selector (including rules inside `@media`), or `null` if not found.

```js
const rule = sheet.get('.box')
if (rule) console.log(rule.style.color)
```

---

### sheet.remove(selector)

Removes the rule for the given selector (including rules inside `@media`).

---

### sheet.removeClass(className)

Removes the rule for a class. Pass the class name with or without the leading dot.

```js
const cls = sheet.addClass({ color: 'red' })
// later:
sheet.removeClass(cls)
```

---

### sheet.destroy()

Removes the `<style>` element from the document and nulls the sheet reference. Call when cleaning up (e.g. component unmount).

---

### !important

You can use `!important` in property values; it is preserved when adding and applied when updating.

```js
sheet.add('.override', { color: 'red !important' })
sheet.updateSet('.override', { color: 'blue !important' })
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

Works in all modern evergreen browsers (Chrome, Firefox, Safari, Edge).
