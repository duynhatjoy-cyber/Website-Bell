import React, { useEffect, useState } from 'react';
import './customer-stories.css';

const ready = story => story?.approved === true && story?.permissionToPublish === true &&
  story.quote?.trim().split(/\s+/).length <= 40 && story.name && story.role && story.property &&
  story.type && Number.isInteger(story.rooms) && story.rooms > 0 && story.products?.length &&
  /^\.\/assets\/[a-z0-9._-]+\.(?:png|jpe?g|webp|svg)$/i.test(story.image || '') &&
  /^\.\/assets\/[a-z0-9._-]+\.(?:png|jpe?g|webp|svg)$/i.test(story.logo || '');

export default function CustomerStories() {
  const [stories, setStories] = useState([]);
  useEffect(() => {
    fetch('/design/customer-stories.json').then(response => response.json()).then(data => {
      if (Array.isArray(data.stories)) setStories(data.stories.filter(ready));
    }).catch(() => {});
  }, []);
  return <main className="stories-page">
    <header className="stories-page-header"><a href="/" aria-label="Bellhop, về trang chủ">bellhop</a><a href="/#form">Đặt lịch demo</a></header>
    <div className="stories-page-inner"><p className="stories-page-kicker">Khách hàng Bellhop</p><h1>Câu chuyện khách hàng</h1>
      {stories.length < 3 ? <div className="stories-page-empty"><p>Câu chuyện khách hàng đang được cập nhật.</p><a href="/">Về trang chủ →</a></div> : stories.map((story, index) => <article className="stories-page-story" key={index}>
        <div className="stories-page-story-head"><img src={story.image.replace('./', '/design/')} alt={story.property}/><div><p>{story.type} · {story.rooms} phòng · {story.products.join(', ')}</p><h2>{story.property}</h2><p>{story.name} · {story.role}</p></div></div>
        <blockquote>“{story.quote}”</blockquote>
        {story.caseStudy?.before && story.caseStudy?.how && story.caseStudy?.after && story.caseStudy?.metricsConfirmed === true && <div className="stories-page-case"><div><b>Trước</b><p>{story.caseStudy.before}</p></div><div><b>Dùng Bellhop thế nào</b><p>{story.caseStudy.how}</p></div><div><b>Sau</b><p>{story.caseStudy.after}</p></div></div>}
      </article>)}
    </div>
  </main>;
}
