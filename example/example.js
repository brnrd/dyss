
function modDivs() {
  var sheet = new Sheet();

  var set = {};
  set.width = '100px';
  set.position = 'absolute';
  set.height = '100px';
  set.top = '100px';
  set.left = '100px';
  set.backgroundColor = 'red';
  set.paddingTop = '10px';

  sheet.add('.test', set);

  var set2 = {};
  set2.width = '100px';
  set2.position = 'absolute';
  set2.height = '100px';
  set2.top = '300px';
  set2.left = '300px';
  set2.backgroundColor = 'green';
  set2.paddingTop = '10px';
  set2.transition = 'all 0.5s ease-in-out';

  sheet.add('.test2', set2);

  set2.width = '200px';
  set2.position = 'absolute';
  set2.height = '200px';
  set2.top = '250px';
  set2.left = '250px';
  set2.backgroundColor = 'blue';
  set2.color = 'white';
  set2.paddingTop = '20px';

  setTimeout(function() {
    sheet.updateSet('.test2', set2);
  }, 2000);
}

window.onload = modDivs;
