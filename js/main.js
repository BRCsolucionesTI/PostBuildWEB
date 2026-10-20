document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('is-loading');

  const navToggle = document.getElementById('navbar-toggle');
  const navMenu = document.getElementById('navbar-nav');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const heroVideo = document.getElementById('hero-video');
  const heroVideoToggle = document.getElementById('hero-video-toggle');

  if (heroVideo && heroVideoToggle) {
    heroVideoToggle.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play();
      } else {
        heroVideo.pause();
      }
    });

    heroVideo.addEventListener('play', () => {
      heroVideoToggle.classList.remove('is-paused');
      heroVideoToggle.setAttribute('aria-label', 'Pausar video');
    });

    heroVideo.addEventListener('pause', () => {
      heroVideoToggle.classList.add('is-paused');
      heroVideoToggle.setAttribute('aria-label', 'Reproducir video');
    });
  }

});

