// Mobile navbar toggle — shared by all pages.
(() => {
  const nav = document.querySelector('.nav');
  const toggle = document.getElementById('navToggle');
  if (!nav || !toggle) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu after tapping a link
  nav.querySelectorAll('.nav__links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
