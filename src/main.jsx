import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const pages = {
  '/': 'Main',
  '/booking-engine': 'BookingEngine',
  '/cms': 'CMS',
  '/website': 'Website',
  '/message': 'Message',
  '/ai-concierge': 'AIConcierge',
  '/payment': 'Payment',
  '/finance': 'Finance',
};
const paths = Object.fromEntries(Object.entries(pages).map(([path, name]) => [name, path]));

function routeFromLocation() {
  return pages[window.location.pathname] ? window.location.pathname : '/';
}

function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const frame = useRef(null);
  const syncing = useRef(false);

  const navigate = useCallback((path, hash = '', replace = false) => {
    if (!pages[path]) return;
    const target = path + hash;
    if (window.location.pathname + window.location.hash !== target) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', target);
    }
    setRoute(path);
    if (frame.current?.contentWindow && pages[route] === pages[path] && hash) {
      frame.current.contentWindow.location.hash = hash;
    }
  }, [route]);

  useEffect(() => {
    const onPop = () => setRoute(routeFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const onLoad = () => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const current = frame.current.contentWindow;
    const name = current.location.pathname.split('/').pop()?.replace(/\.dc\.html$/, '');
    if (paths[name] && !syncing.current && route !== paths[name]) {
      syncing.current = true;
      navigate(paths[name], current.location.hash);
      syncing.current = false;
    }
    doc.addEventListener('click', (event) => {
      const anchor = event.target.closest?.('a[href]');
      if (!anchor) return;
      const url = new URL(anchor.href, current.location.href);
      if (url.origin !== window.location.origin) return;
      const targetName = url.pathname.split('/').pop()?.replace(/\.dc\.html$/, '');
      if (!paths[targetName]) return;
      event.preventDefault();
      navigate(paths[targetName], url.hash);
    });
    if (window.location.hash) current.location.hash = window.location.hash;
  };

  return <iframe
    ref={frame}
    key={pages[route]}
    title="Bellhop"
    src={`/design/${pages[route]}.dc.html${window.location.hash}`}
    onLoad={onLoad}
  />;
}

createRoot(document.getElementById('root')).render(<App />);
