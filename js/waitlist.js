const WAITLIST_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby3Z5a2L9_CXP4RnT_ocE-At_IBWT6GUWOQWAVAXkovTtu0uk5_E3BjKC_j8Dv0EwGgJg/exec';

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('navbar-toggle');
  const navMenu = document.getElementById('navbar-nav');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const form = document.getElementById('waitlist-form');
  const success = document.getElementById('waitlist-success');

  if (!form) return;

  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('blur', () => input.classList.add('is-touched'));
  });

  let hideTimeout;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.querySelectorAll('input').forEach((input) => input.classList.add('is-touched'));
      form.reportValidity();
      return;
    }

    fetch(WAITLIST_WEBAPP_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: new URLSearchParams(new FormData(form)),
    }).catch(() => {});

    form.reset();
    form.querySelectorAll('input').forEach((input) => input.classList.remove('is-touched'));

    success.hidden = false;
    requestAnimationFrame(() => success.classList.add('is-visible'));

    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      success.classList.remove('is-visible');
      setTimeout(() => { success.hidden = true; }, 300);
    }, 5000);
  });
});
