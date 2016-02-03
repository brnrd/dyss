function setDucks() {
  console.warn('Mind the duck!');
  var sheet = new Sheet();
  var colorSet = {};

  var beakInput = document.getElementById('beak');
  var palmInput = document.getElementById('palm');
  var bgInput = document.getElementById('background');

  beakInput.onkeyup = changeColor;
  palmInput.onkeyup = changeColor;
  bgInput.onkeyup = changeColor;

  function changeColor(event) {
    var input = event.target;
    var duckPart = input.id;
    var color = input.value;
    if (color === '' && duckPart !== 'background') {
      color = '#f29e07';
    }
    var hex = color.indexOf('#') > -1 ? color : '#' + color;
    var regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (hex.match(regex)) {
      if (duckPart === 'background') {
        colorSet.backgroundColor = hex;
        sheet.updateSet('body', colorSet);
      } else {
        colorSet.color = hex;
        sheet.updateSet('.' + duckPart, colorSet);
      }
    }
  }

}
window.onload = setDucks;
