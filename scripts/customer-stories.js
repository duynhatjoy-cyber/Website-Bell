(() => {
  const slotId = 'customer-stories-slot';
  let rendered = false;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const safeImage = value => {
    const url = String(value || '');
    return /^\.\/assets\/[a-z0-9._-]+\.(?:png|jpe?g|webp|svg)$/i.test(url) ? url : '';
  };
  const wordCount = value => String(value || '').trim().split(/\s+/).filter(Boolean).length;
  const isApproved = story => story && story.approved === true && story.permissionToPublish === true &&
    story.quote && wordCount(story.quote) <= 40 && story.name && story.role && story.property &&
    story.type && Number.isInteger(story.rooms) && story.rooms > 0 &&
    Array.isArray(story.products) && story.products.length > 0 && safeImage(story.image) && safeImage(story.logo);

  function render(stories) {
    const slot = document.getElementById(slotId);
    if (!slot || rendered || stories.length < 3) return;
    rendered = true;
    const cards = stories.map((story, index) => `<article class="customer-story-card">
      <span class="customer-story-mark" aria-hidden="true">“</span>
      <blockquote>${escape(story.quote)}</blockquote>
      <div class="customer-story-chips"><span>${escape(story.type)}</span><span>${story.rooms} phòng</span>${story.products.map(product => `<span>${escape(product)}</span>`).join('')}</div>
      <div class="customer-story-person"><img src="${safeImage(story.image)}" alt="${escape(story.property)}" loading="lazy"><div><strong>${escape(story.name)}</strong><small>${escape(story.role)} · ${escape(story.property)}</small></div></div>
    </article>`).join('');
    const logos = stories.filter(story => safeImage(story.logo)).map(story => `<img src="${safeImage(story.logo)}" alt="${escape(story.property)}" loading="lazy">`).join('');
    slot.innerHTML = `<section class="sec customer-stories-section" aria-labelledby="customer-stories-title"><div class="wrap">
      <div class="customer-stories-heading"><div><span class="eyebrow">Khách hàng Bellhop</span><h2 class="h2" id="customer-stories-title">Chủ cơ sở lưu trú nói gì về Bellhop</h2></div><div class="customer-stories-controls"><button type="button" data-stories-prev aria-label="Xem phản hồi trước">‹</button><button type="button" data-stories-next aria-label="Xem phản hồi tiếp theo">›</button></div></div>
      <div class="customer-stories-track" tabindex="0" aria-label="Phản hồi khách hàng">${cards}</div>
      ${logos ? `<div class="customer-stories-logos" aria-label="Cơ sở lưu trú đang dùng Bellhop">${logos}</div>` : ''}
      <a class="lnk customer-stories-link" href="/khach-hang/cau-chuyen">Xem câu chuyện khách hàng <span class="arr">→</span></a>
    </div></section>`;
    const track = slot.querySelector('.customer-stories-track');
    const move = direction => track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
    slot.querySelector('[data-stories-prev]').addEventListener('click', () => move(-1));
    slot.querySelector('[data-stories-next]').addEventListener('click', () => move(1));
  }

  fetch('./customer-stories.json').then(response => response.ok ? response.json() : null).then(data => {
    const stories = Array.isArray(data?.stories) ? data.stories.filter(isApproved) : [];
    if (stories.length < 3) return;
    const observer = new MutationObserver(() => {
      render(stories);
      if (rendered) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    render(stories);
  }).catch(() => {});
})();
