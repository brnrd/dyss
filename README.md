jCSS
====

A small library to dynamically create and manipulate CSS stylesheets.

Usage
-----

Import jCSS.js or jCSS.min.js at the end of the body.

	<script type="text/javascript" src="jCSS.js"></script>

Then in your JavaScript file, create a new stylesheet :

	var sheet = new Sheet();

Create a set of CSS properties and name the keys as you would do for an element.style. and add it to the stylesheet :

	var set = {};
	set.width = '100px';
	set.position = 'absolute';
	set.height = '100px';
	set.top = '100px';
	set.left = '100px';
	set.backgroundColor = 'red';
	set.paddingTop = '10px';

	sheet.add('.test', set);

Compatibility
-------------

Is currently working on the latest Chrome, Firefox and Safari.
IE is yet to be tested.

To compile
----------

Install Coffeescript :

  sudo npm install -g coffee-script

Then run in the working repository

  coffee -wcmb ./

(Watch Compile Map Bare)

To minify
---------

(note to self)

uglifyjs -mc -o jCSS.min.js -- jCSS.js

Todo
----

- Add doc
- Comment the code
- Add functions
- Add tests
- Add precise compatibility list
- Do a whole lot of other usefull things
- Support pseudo elements

Licence
-------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>


