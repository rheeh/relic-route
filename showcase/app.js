(() => {
  'use strict';
  const tabs = [...document.querySelectorAll('[data-screen]')];
  const panels = [...document.querySelectorAll('.screen-panel')];
  function activateScreen(tab, focus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateScreen(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { event.preventDefault(); activateScreen(tabs[target], true); }
    });
  });

  const film = document.querySelector('#project-film');
  document.querySelectorAll('[data-play-film]').forEach(link => {
    link.addEventListener('click', () => {
      if (film) film.play().catch(() => {});
    });
  });

  document.querySelectorAll('[data-replay]').forEach(button => {
    button.addEventListener('click', () => {
      const preview = document.querySelector(`#motion-${button.dataset.replay}`);
      preview.classList.remove('is-playing');
      void preview.offsetWidth;
      preview.classList.add('is-playing');
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const preview = entry.target;
        preview.classList.remove('is-playing');
        void preview.offsetWidth;
        preview.classList.add('is-playing');
        observer.unobserve(preview);
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('.motion-preview').forEach(preview => observer.observe(preview));
  }

  const states = {
    idle: ['领取遗物', '↗', '默认 / 明确标出当前主动作。'],
    hover: ['领取遗物', '↗', '悬停 / 亮度变化提示可以操作。'],
    pressed: ['领取遗物', '↗', '按下 / 色阶与底边回应输入。'],
    confirmed: ['已确认', '✓', '确认 / 即时显示动作已被接收。'],
    claimed: ['已入库', '✓', '已领取 / 保留结果，阻止重复领取。']
  };
  const stateButtons = [...document.querySelectorAll('[data-button-state]')];
  const specButton = document.querySelector('#spec-button');
  function setButtonState(state) {
    const [label, icon, description] = states[state];
    specButton.dataset.state = state;
    specButton.disabled = state === 'claimed';
    document.querySelector('#spec-button-label').textContent = label;
    document.querySelector('#spec-button-icon').textContent = icon;
    document.querySelector('#state-description').textContent = description;
    stateButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.buttonState === state)));
  }
  stateButtons.forEach(button => button.addEventListener('click', () => setButtonState(button.dataset.buttonState)));
  specButton.addEventListener('click', () => setButtonState('claimed'));

  const dialog = document.querySelector('#image-dialog');
  const dialogImage = document.querySelector('#dialog-image');
  let previousFocus;
  function closeImage() { dialog.close(); }
  document.querySelectorAll('[data-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      previousFocus = button;
      dialogImage.src = button.dataset.zoom;
      dialogImage.alt = button.dataset.alt;
      document.querySelector('#dialog-caption').textContent = button.dataset.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', closeImage);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeImage(); });
  dialog.addEventListener('close', () => { if (previousFocus) previousFocus.focus(); });
})();
