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
  const memberTabs = [...document.querySelectorAll('[data-member]')];
  const memberPanels = [...document.querySelectorAll('.member-panel')];
  function activateMember(tab, focus = false) {
    memberTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    memberPanels.forEach(panel => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
  }
  memberTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateMember(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % memberTabs.length;
      if (event.key === 'ArrowLeft') target = (index - 1 + memberTabs.length) % memberTabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = memberTabs.length - 1;
      if (target !== undefined) { event.preventDefault(); activateMember(memberTabs[target], true); }
    });
  });
  const film = document.querySelector('#project-film');
  document.querySelectorAll('[data-play-film]').forEach(link => link.addEventListener('click', () => film.play().catch(() => {})));

  const comparison = document.querySelector('#comparison-frame');
  const compareRange = document.querySelector('#compare-range');
  const compareHandle = document.querySelector('#compare-handle');
  const comparePresets = [...document.querySelectorAll('[data-compare]')];
  function setComparison(value) {
    const amount = Math.max(0, Math.min(100, Math.round(Number(value))));
    comparison.style.setProperty('--split', `${amount}%`);
    compareRange.value = amount;
    compareRange.setAttribute('aria-valuetext', `旧版 ${amount}%，新版 ${100 - amount}%`);
    document.querySelector('#compare-output').textContent = `V1 ${amount}% / V3 ${100 - amount}%`;
    comparison.querySelector('.tag-before').hidden = amount === 0;
    comparison.querySelector('.tag-after').hidden = amount === 100;
    comparePresets.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.compare) === amount)));
  }
  compareRange.addEventListener('input', () => setComparison(compareRange.value));
  comparePresets.forEach(button => button.addEventListener('click', () => setComparison(button.dataset.compare)));
  let dragging = false;
  function dragComparison(event) {
    const bounds = comparison.getBoundingClientRect();
    setComparison((event.clientX - bounds.left) / bounds.width * 100);
  }
  compareHandle.addEventListener('pointerdown', event => {
    dragging = true;
    compareHandle.setPointerCapture(event.pointerId);
    dragComparison(event);
    event.preventDefault();
  });
  compareHandle.addEventListener('pointermove', event => { if (dragging) dragComparison(event); });
  compareHandle.addEventListener('pointerup', () => { dragging = false; });
  compareHandle.addEventListener('pointercancel', () => { dragging = false; });
  compareHandle.addEventListener('lostpointercapture', () => { dragging = false; });

  const characterPreview = document.querySelector('#motion-character');
  let previewPerson = 'lyra';
  document.querySelectorAll('[data-replay]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.replay;
      if (type === 'character') {
        previewPerson = previewPerson === 'lyra' ? 'orion' : 'lyra';
        characterPreview.dataset.person = previewPerson;
        document.querySelector('#preview-character-label').textContent = previewPerson === 'lyra' ? '岑遥 / LYRA' : '赫朔 / ORION';
        return;
      }
      const preview = document.querySelector(`#motion-${type}`);
      preview.classList.remove('is-playing');
      void preview.offsetWidth;
      preview.classList.add('is-playing');
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-playing');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.35 });
    document.querySelectorAll('#motion-transition, #motion-scan').forEach(preview => observer.observe(preview));
  }

  const states = {
    idle: ['领取遗物', '↗', '默认 / 当前主动作。'],
    hover: ['领取遗物', '↗', '悬停 / 提亮，提示可以操作。'],
    pressed: ['领取遗物', '↗', '按下 / 色阶变深与轻移回应输入。'],
    claimed: ['已入库', '✓', '已领取 / 保留完成结果。']
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
  document.querySelectorAll('[data-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      previousFocus = button;
      dialogImage.src = button.dataset.zoom;
      dialogImage.alt = button.dataset.alt;
      document.querySelector('#dialog-caption').textContent = button.dataset.alt;
      dialog.showModal();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (previousFocus) previousFocus.focus(); });
})();
