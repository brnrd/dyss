
function setThings() {
  var sheet = new Sheet();
  var colorSet = {};
  var input = document.getElementById('color-input');
  input.onkeyup = changeColor;

  function changeColor(event) {
    var hex = '#' + input.value;
    var regex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if (hex.match(regex)) {
      colorSet.color = hex;
      colorSet.borderColor = hex;
      sheet.updateSet('.user-defined', colorSet);
    }
  }

}
window.onload = setThings;
