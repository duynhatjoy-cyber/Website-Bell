import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPage from './AuthPage.jsx';
import CustomerStories from './CustomerStories.jsx';
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
const loginUrl = 'https://app.bellhop.biz/';

function routeFromLocation() {
  const path = window.location.pathname;
  if (path === '/khach-hang/cau-chuyen') return path;
  return pages[path] ? path : '/';
}

function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [modalMode, setModalMode] = useState(() => window.location.pathname === '/register' ? 'register' : null);
  const frame = useRef(null);
  const syncing = useRef(false);

  const navigate = useCallback((path, hash = '', replace = false) => {
    if (!pages[path]) return;
    const target = path + hash;
    if (window.location.pathname + window.location.hash !== target) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', target);
    }
    setRoute(path);
    if (frame.current?.contentWindow && pages[path] && pages[route] === pages[path] && hash) {
      const current = frame.current.contentWindow;
      const targetElement = current.document.getElementById(decodeURIComponent(hash.slice(1)));
      if (targetElement) {
        current.history.replaceState({}, '', hash);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        current.location.hash = hash;
      }
    }
  }, [route]);

  const openAuth = useCallback((mode) => {
    if (mode === 'login') {
      window.location.assign(loginUrl);
      return;
    }
    if (route !== '/') navigate('/');
    else if (window.location.pathname === '/register') window.history.replaceState({}, '', '/');
    setModalMode(mode);
  }, [navigate, route]);

  const closeAuth = useCallback(() => {
    setModalMode(null);
    if (window.location.pathname === '/register') window.history.replaceState({}, '', '/');
  }, []);

  const openDemo = useCallback(() => {
    closeAuth();
    navigate('/', '#form');
  }, [closeAuth, navigate]);

  useEffect(() => {
    const onPop = () => {
      setRoute(routeFromLocation());
      setModalMode(window.location.pathname === '/register' ? 'register' : null);
    };
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
      if (url.pathname === '/khach-hang/cau-chuyen') {
        event.preventDefault();
        window.history.pushState({}, '', url.pathname);
        setRoute(url.pathname);
        return;
      }
      if (['/register', '/login'].includes(url.pathname)) {
        event.preventDefault();
        openAuth(url.pathname.slice(1));
        return;
      }
      const targetName = url.pathname.split('/').pop()?.replace(/\.dc\.html$/, '');
      if (!paths[targetName]) return;
      event.preventDefault();
      navigate(paths[targetName], url.hash);
    });
    if (window.location.hash) {
      const hash = window.location.hash;
      const id = decodeURIComponent(hash.slice(1));
      let attempts = 0;
      const scrollWhenReady = () => {
        const target = doc.getElementById(id);
        if (target) {
          current.history.replaceState({}, '', hash);
          target.scrollIntoView({ block: 'start' });
        } else if (attempts++ < 20) {
          window.setTimeout(scrollWhenReady, 100);
        }
      };
      scrollWhenReady();
    }
  };

  if (route === '/khach-hang/cau-chuyen') return <CustomerStories />;

  return <><iframe
    ref={frame}
    key={pages[route]}
    title="Bellhop"
    src={`/design/${pages[route]}.dc.html${window.location.hash}`}
    onLoad={onLoad}
  />{modalMode && <AuthPage key={modalMode} mode={modalMode} onClose={closeAuth} onModeChange={setModalMode} onDemo={openDemo} />}</>;
}

if (window.location.pathname === '/login') window.location.replace(loginUrl);
else createRoot(document.getElementById('root')).render(<App />);
