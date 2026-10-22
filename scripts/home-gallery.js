(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const initialized = new WeakSet();

  function setup(gallery) {
    if (initialized.has(gallery)) return;
    initialized.add(gallery);

    const slides = [...gallery.querySelectorAll('.photo-gallery-slides img')];
    const dots = [...gallery.querySelectorAll('.photo-gallery-dots button')];
    if (slides.length < 2) return;

    let current = 0;
    let timer;
    let visible = true;
    let paused = false;

    function stop() {
      window.clearInterval(timer);
      timer = undefined;
    }

    function start() {
      stop();
      if (!reducedMotion.matches && !document.hidden && visible && !paused) {
        timer = window.setInterval(() => show(current + 1), 5000);
      }
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach((dot, i) => {
        const active = i === current;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    gallery.querySelector('[data-prev]')?.addEventListener('click', () => {
      show(current - 1);
      start();
    });
    gallery.querySelector('[data-next]')?.addEventListener('click', () => {
      show(current + 1);
      start();
    });
    dots.forEach((dot, i) => dot.addEventListener('click', () => {
      show(i);
      start();
    }));
    gallery.addEventListener('pointerenter', () => { paused = true; stop(); });
    gallery.addEventListener('pointerleave', () => { paused = false; start(); });
    gallery.addEventListener('focusin', () => { paused = true; stop(); });
    gallery.addEventListener('focusout', event => {
      if (!gallery.contains(event.relatedTarget)) { paused = false; start(); }
    });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        start();
      }, { threshold: 0.1 });
      observer.observe(gallery);
    } else start();
    show(0);
  }

  function scan() {
    document.querySelectorAll('[data-gallery]').forEach(setup);
  }

  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
