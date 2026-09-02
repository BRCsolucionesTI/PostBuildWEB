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

  initChatAnimation();
  initOpsAnimation();
  initMetricsAnimation();
});

function initChatAnimation() {
  const chatScreen = document.getElementById('chat-screen');
  if (!chatScreen) return;

  const bubbles = Array.from(chatScreen.querySelectorAll('.chat-bubble'));
  const chosenOption = chatScreen.querySelector('.schedule-option[data-selected="true"]');
  const stepDelays = [800, 1600, 1400, 1800, 1600, 1400, 1600];
  const resetPause = 2500;
  const timers = [];

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers.length = 0;
  }

  function resetChat() {
    bubbles.forEach((bubble) => bubble.classList.remove('is-visible'));
    if (chosenOption) chosenOption.classList.remove('is-chosen');
  }

  function playSequence() {
    resetChat();
    let elapsed = 0;

    bubbles.forEach((bubble, index) => {
      elapsed += stepDelays[index] || 1500;
      timers.push(setTimeout(() => {
        bubble.classList.add('is-visible');
        if (bubble.classList.contains('chat-bubble--schedule') && chosenOption) {
          timers.push(setTimeout(() => {
            chosenOption.classList.add('is-chosen');
          }, 500));
        }
      }, elapsed));
    });

    timers.push(setTimeout(() => {
      clearTimers();
      playSequence();
    }, elapsed + resetPause));
  }

  playSequence();
}

function initOpsAnimation() {
  const tabletScreen = document.getElementById('tablet-screen');
  const grid = document.getElementById('calendar-grid');
  const dayView = document.getElementById('calendar-day');
  const dayTitle = document.getElementById('calendar-day-title');
  const dayVisits = document.getElementById('calendar-day-visits');
  if (!tabletScreen || !grid || !dayView) return;

  for (let day = 1; day <= 30; day++) {
    const cell = document.createElement('span');
    cell.className = 'calendar-day-cell';
    cell.dataset.day = String(day);
    cell.textContent = String(day);
    grid.appendChild(cell);
  }

  const scenes = [
    {
      day: 6,
      label: 'Viernes 6',
      visits: [
        { time: '10:00', type: 'Visita técnica', tech: 'Diego Fuentes', final: 'Aprobado', finalClass: 'badge--approved' },
        { time: '15:30', type: 'Visita de trabajo', tech: 'Camila Rojas', final: 'Rechazado', finalClass: 'badge--rejected' }
      ]
    },
    {
      day: 17,
      label: 'Martes 17',
      visits: [
        { time: '09:30', type: 'Visita técnica', tech: 'Matías Herrera', final: 'Aprobado', finalClass: 'badge--approved' },
        { time: '13:00', type: 'Visita de trabajo', tech: 'Fernanda Soto', final: 'Completado', finalClass: 'badge--done' }
      ]
    },
    {
      day: 24,
      label: 'Lunes 24',
      visits: [
        { time: '11:00', type: 'Visita técnica', tech: 'Valentina Cruz', final: 'Completado', finalClass: 'badge--done' },
        { time: '16:00', type: 'Visita de trabajo', tech: 'Tomás Álvarez', final: 'Aprobado', finalClass: 'badge--approved' }
      ]
    }
  ];

  const highlightDelay = 900;
  const zoomDelay = 700;
  const displayPause = 3000;
  const zoomOutPause = 700;
  const timers = [];
  let sceneIndex = 0;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers.length = 0;
  }

  function buildVisitRow(visit) {
    const row = document.createElement('div');
    row.className = 'visit-row';
    row.innerHTML = `
      <span class="visit-row__time">${visit.time}</span>
      <div class="visit-row__info">
        <span class="visit-row__type">${visit.type}</span>
        <span class="visit-row__tech">${visit.tech}</span>
      </div>
      <span class="visit-row__badge">${visit.final}</span>
    `;
    row.querySelector('.visit-row__badge').classList.add(visit.finalClass);
    return row;
  }

  function playScene() {
    const scene = scenes[sceneIndex];
    const cell = grid.querySelector(`[data-day="${scene.day}"]`);

    timers.push(setTimeout(() => {
      if (cell) cell.classList.add('is-target');

      timers.push(setTimeout(() => {
        if (cell) {
          const cellRect = cell.getBoundingClientRect();
          const screenRect = tabletScreen.getBoundingClientRect();
          const originX = ((cellRect.left + cellRect.width / 2 - screenRect.left) / screenRect.width) * 100;
          const originY = ((cellRect.top + cellRect.height / 2 - screenRect.top) / screenRect.height) * 100;
          dayView.style.transformOrigin = `${originX}% ${originY}%`;
        }

        dayTitle.textContent = scene.label;
        dayVisits.innerHTML = '';
        scene.visits.forEach((visit) => dayVisits.appendChild(buildVisitRow(visit)));

        dayView.classList.add('is-visible');

        timers.push(setTimeout(() => {
          dayView.classList.remove('is-visible');

          timers.push(setTimeout(() => {
            if (cell) cell.classList.remove('is-target');

            timers.push(setTimeout(() => {
              sceneIndex = (sceneIndex + 1) % scenes.length;
              playScene();
            }, zoomOutPause));
          }, 400));
        }, displayPause));
      }, zoomDelay));
    }, highlightDelay));
  }

  playScene();

  window.addEventListener('beforeunload', clearTimers);
}

function initMetricsAnimation() {
  const cards = document.querySelectorAll('.metric-card');
  if (!cards.length) return;

  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      card.classList.add('is-visible');
      card.querySelectorAll('[data-count-to]').forEach(animateCount);
      obs.unobserve(card);
    });
  }, { threshold: 0.3 });

  cards.forEach((card) => observer.observe(card));
}
