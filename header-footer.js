(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('#dr-header-nav-menu');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
      header.classList.add('dr-header-nav-panel-open');
    } else {
      header.classList.remove('dr-header-nav-panel-open');
    }
  });
})();
