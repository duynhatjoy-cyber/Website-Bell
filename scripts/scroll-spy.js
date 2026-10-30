(() => {
  function initTableScrollHints() {
    document.querySelectorAll('.tbl-scroll-hint').forEach((hint) => {
      if (hint.dataset.bound) return;
      const box = hint.previousElementSibling;
      if (!box || !box.classList.contains('tbl-box')) return;
      const prevBtn = hint.querySelector('.tbl-scroll-btn--prev');
      const nextBtn = hint.querySelector('.tbl-scroll-btn--next');
      if (!prevBtn && !nextBtn) return;
      hint.dataset.bound = '1';

      const syncState = () => {
        const maxScroll = Math.max(0, box.scrollWidth - box.clientWidth);
        const atStart = box.scrollLeft <= 6;
        const atEnd = box.scrollLeft >= maxScroll - 8;
        if (prevBtn) {
          prevBtn.disabled = atStart;
          prevBtn.classList.toggle('is-disabled', atStart);
        }
        if (nextBtn) {
          nextBtn.disabled = atEnd;
          nextBtn.classList.toggle('is-disabled', atEnd);
        }
      };

      box.addEventListener('scroll', syncState, { passive: true });

      const getStep = () => Math.max(180, Math.round(box.clientWidth * 0.65));

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          box.scrollBy({ left: -getStep(), behavior: 'smooth' });
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          box.scrollBy({ left: getStep(), behavior: 'smooth' });
        });
      }

      syncState();
    });
  }

  if (document.readyState === 'loading') {
    addEventListener('DOMContentLoaded', initTableScrollHints, { once: true });
  } else {
    initTableScrollHints();
  }
  new MutationObserver(initTableScrollHints).observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('details.language-dropdown[open]').forEach((dropdown) => {
      if (!dropdown.contains(e.target)) {
        dropdown.removeAttribute('open');
      }
    });
  });

  // Sticky header scroll listener: adds shadow when user scrolls down
  const syncHeaderSticky = () => {
    const isScrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > 8;
    document.querySelectorAll('.site-header-sticky, header.hdr, .hdr').forEach((el) => {
      el.classList.toggle('is-scrolled', isScrolled);
    });
  };
  window.addEventListener('scroll', syncHeaderSticky, { passive: true });
  syncHeaderSticky();

  // Exclusive Accordion for process steps: click any step, only that step opens, others close
  document.addEventListener('click', (e) => {
    const summary = e.target.closest('.process-step-item summary');
    if (!summary) return;
    const currentDetails = summary.closest('details.process-step-item');
    if (!currentDetails) return;
    const container = currentDetails.closest('.process-steps-col') || currentDetails.closest('.process-split-layout');
    if (!container) return;

    if (currentDetails.open) {
      e.preventDefault();
      return;
    }

    container.querySelectorAll('.process-step-item[open]').forEach((item) => {
      if (item !== currentDetails) {
        item.removeAttribute('open');
      }
    });

    const photoSrc = currentDetails.getAttribute('data-photo');
    const layout = currentDetails.closest('.process-split-layout');
    const photoImg = layout ? layout.querySelector('.process-photo-img') : null;
    if (photoSrc && photoImg && photoImg.getAttribute('src') !== photoSrc) {
      photoImg.style.opacity = '0.4';
      setTimeout(() => {
        photoImg.src = photoSrc;
        photoImg.style.opacity = '1';
      }, 140);
    }
  });

  // Website Hub interactive showcase:
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.hub-item');
    if (!item) return;
    const hub = item.closest('.website-hub-layout');
    if (!hub) return;

    hub.querySelectorAll('.hub-item').forEach(it => it.classList.remove('active'));
    item.classList.add('active');

    const card = hub.querySelector('.hub-center-card');
    if (!card) return;

    const num = item.dataset.num;
    const title = item.dataset.title;
    const desc = item.dataset.desc;

    const numEl = card.querySelector('.hub-card-num');
    const titleEl = card.querySelector('.hub-card-title');
    const descEl = card.querySelector('.hub-card-desc');

    card.style.opacity = '0.5';
    setTimeout(() => {
      if (numEl) numEl.textContent = num;
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
      card.style.opacity = '1';
    }, 120);
  });

  const page = location.pathname.split('/').pop();
  if (page === 'Main.dc.html') return;

  let currentNav = null;
  let cleanup = null;

  function makeSubnav(root) {
    if (root.querySelector('.subnav, .toc') || page === 'Finance.dc.html' || page === 'CMS.dc.html' || page === 'Website.dc.html' || page === 'Message.dc.html') return;
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
