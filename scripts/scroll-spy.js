(() => {
  function initTableScrollHints() {
    document.querySelectorAll('.tbl-scroll-hint').forEach((hint) => {
      if (hint.dataset.bound) return;
      const box = hint.previousElementSibling;
      const btn = hint.querySelector('.tbl-scroll-btn');
      if (!box || !box.classList.contains('tbl-box') || !btn) return;
      hint.dataset.bound = '1';
      const syncState = () => {
        const atEnd = box.scrollLeft + box.clientWidth >= box.scrollWidth - 12;
        btn.classList.toggle('is-end', atEnd);
      };
      box.addEventListener('scroll', syncState, { passive: true });
      btn.addEventListener('click', () => {
        const atEnd = box.scrollLeft + box.clientWidth >= box.scrollWidth - 12;
        box.scrollTo({
          left: atEnd ? 0 : box.scrollLeft + Math.max(220, Math.round(box.clientWidth * 0.65)),
          behavior: 'smooth',
        });
      });
      syncState();
    });
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', initTableScrollHints, { once: true });
  } else {
    initTableScrollHints();
  }
  new MutationObserver(initTableScrollHints).observe(document.documentElement, { childList: true, subtree: true });

  const page = location.pathname.split('/').pop();
  if (page === 'Main.dc.html') return;

  let currentNav = null;
  let cleanup = null;

  function makeSubnav(root) {
    if (root.querySelector('.subnav, .toc') || page === 'Finance.dc.html') return;
    const hero = Array.from(root.children).find((child) => child.tagName === 'SECTION');
    if (!hero) return;
    const sections = Array.from(root.querySelectorAll('section'))
      .filter((section) => section !== hero && !section.parentElement.closest('section'))
      .filter((section) => section.querySelector('h2'));
    if (sections.length < 2) return;

    const nav = document.createElement('nav');
    nav.className = 'subnav';
    nav.setAttribute('aria-label', 'Các phần của trang');
    const inner = document.createElement('div');
    inner.className = 'wrap';
    sections.forEach((section, index) => {
      if (!section.id) section.id = `muc-${index + 1}`;
      const heading = section.querySelector('h2');
      const link = document.createElement('a');
      link.className = 'it';
      link.href = `#${section.id}`;
      link.textContent = heading.textContent.trim().replace(/\s+/g, ' ');
      inner.appendChild(link);
    });
    nav.appendChild(inner);
    hero.after(nav);
  }

  function initialize() {
    const root = document.querySelector('.bh');
    if (!root) return;
    makeSubnav(root);
    const nav = root.querySelector('.subnav, .toc');
    if (!nav || nav === currentNav) return;
    const entries = Array.from(nav.querySelectorAll('a[href^="#"]'))
      .map((link) => ({ link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
      .filter((entry) => entry.section);
    if (!entries.length) return;
    if (cleanup) cleanup();
    currentNav = nav;
    let ticking = false;
    let selected = null;

    const update = () => {
      ticking = false;
      const offset = nav.classList.contains('subnav') ? nav.getBoundingClientRect().bottom + 20 : 90;
      let active = entries[0];
      for (const entry of entries) {
        if (entry.section.getBoundingClientRect().top <= offset) active = entry;
      }
      if (active === selected) return;
      selected = active;
      entries.forEach(({ link }) => {
        const isActive = link === active.link;
        link.classList.toggle('on', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      const scroller = nav.querySelector('.wrap');
      if (scroller && scroller.scrollWidth > scroller.clientWidth) {
        const linkBox = active.link.getBoundingClientRect();
        const navBox = scroller.getBoundingClientRect();
        if (linkBox.left < navBox.left || linkBox.right > navBox.right) {
          scroller.scrollTo({ left: scroller.scrollLeft + linkBox.left - navBox.left - 16, behavior: 'smooth' });
        }
      }
    };
    const schedule = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    nav.addEventListener('click', schedule);
    cleanup = () => {
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      nav.removeEventListener('click', schedule);
    };
    schedule();
  }

  const observer = new MutationObserver(initialize);
  const start = () => {
    observer.observe(document.body, { childList: true, subtree: true });
    initialize();
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
