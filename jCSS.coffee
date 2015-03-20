class Sheet

  constructor: ->
    style = document.createElement 'style'
    # isWebkit = !!window.webkitURL
    # isWebkit = isWebkit or 'WebkitAppearance' in document.documentElement.style
    # style.appendChild document.createTextNode '' if isWebkit
    document.head.appendChild style
    @sheet = style.sheet

  addMediaAttribute: (mediaAttribute) ->
    @_style.setAttribute 'media', mediaAttribute
    return

  getSheet: ->
    @sheet

  _add: (selector, rules, index) ->
    index = 0 if index?
    if @sheet.insertRule
      @sheet.insertRule "#{selector} { #{rules} }", index
    else
      @sheet.add selector, rules, index
    return

  add: (selector, set) ->
    rules = for key, value of set
      "#{@_cssify key}: #{value};"
    rules = rules.join ' '
    @_add selector, rules
    return

  addClass: (set) ->
    name = @_getRandomName()
    randomClass = '.' + name
    @add randomClass, set
    name

  updateSet: (selector, set) ->
    item = @_getSelector selector
    if item is -1
      @add selector, set
    else
      for key, value of set
        item.style[key] = value
    return

  # Helpers

  _cssify: (proprety) ->
    cssedProperty = ''
    temp = proprety.split /(?=[A-Z])/
    if temp instanceof Array and temp.length is 2
      temp[1] = temp[1].toLowerCase();
      cssedProperty = temp.join '-'
    else
      cssedProperty = temp
    return cssedProperty

  _getSelector: (selector) ->
    rulesArray = @sheet.rules
    rulesArray = @sheet.cssRules if not rulesArray
    return rule for rule in rulesArray when rule.selectorText is selector
    -1

  _getRandomName: (length=8) ->
    name = ""
    name += Math.random().toString(36).substr(2) while name.length < length
    name.substr 0, length

  _getSelectorType: (selector) ->
    firstChar = selector.chatAt 0
    type = switch
      when firstChar is '.' then 'class'
      when firstChar is '#' then 'id'
      else 'element'
