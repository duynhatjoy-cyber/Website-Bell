import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPage from './AuthPage.jsx';
import CustomerStories from './CustomerStories.jsx';
import { applyLanguage } from './translations.js';
import './style.css';

const pages = {
  '/': 'Main',
  '/pms': 'PMS',
  '/booking-engine': 'BookingEngine',
  '/cms': 'CMS',
  '/website': 'Website',
  '/message': 'Message',
  '/ai-concierge': 'AIConcierge',
  '/payment': 'Payment',
  '/finance': 'Finance',
  '/bang-gia': 'Pricing',
  '/tin-tuc': 'News',
  '/lifrooms': 'About',
  '/ve-bellhop': 'About',
  '/ve-Bellhop': 'About',
};
const paths = {
  ...Object.fromEntries(Object.entries(pages).map(([path, name]) => [name, path])),
  About: '/ve-Bellhop',
};
const loginUrl = 'https://app.bellhop.biz/';

function routeFromLocation() {
  const path = window.location.pathname;
  if (path === '/khach-hang/cau-chuyen') return path;
  if (pages[path]) return path;
  const match = Object.keys(pages).find((p) => p.toLowerCase() === path.toLowerCase());
  if (match) return match;
  return '/';
}

function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [language, setLanguage] = useState(() => localStorage.getItem('bellhop-language') || 'vi');
  const [modalMode, setModalMode] = useState(() => window.location.pathname === '/register' ? 'register' : null);
  const frame = useRef(null);
  const syncing = useRef(false);

  const navigate = useCallback((path, hash = '', replace = false) => {
    const canonicalPath = pages[path] ? path : Object.keys(pages).find((p) => p.toLowerCase() === path.toLowerCase());
    if (!canonicalPath || !pages[canonicalPath]) return;
    const target = canonicalPath + hash;
    if (window.location.pathname + window.location.hash !== target) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', target);
    }
    setRoute(canonicalPath);
    if (frame.current?.contentWindow && pages[canonicalPath] && pages[route] === pages[canonicalPath] && hash) {
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

  useEffect(() => {
    applyLanguage(frame.current?.contentDocument, language);
  }, [language]);

  const onLoad = () => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const current = frame.current.contentWindow;
    applyLanguage(doc, language);
    const name = current.location.pathname.split('/').pop()?.replace(/\.dc\.html$/, '');
    if (paths[name] && !syncing.current && route !== paths[name]) {
      syncing.current = true;
      navigate(paths[name], current.location.hash);
      syncing.current = false;
    }
    doc.addEventListener('click', (event) => {
      const languageButton = event.target.closest?.('[data-language]');
      if (languageButton) {
        const nextLanguage = languageButton.getAttribute('data-language');
        if (['vi', 'en'].includes(nextLanguage)) {
          localStorage.setItem('bellhop-language', nextLanguage);
          setLanguage(nextLanguage);
        }
        const dropdown = languageButton.closest('details.language-dropdown');
        if (dropdown) {
          dropdown.open = false;
          dropdown.removeAttribute('open');
        }
        return;
      }
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
      const matchedPath = Object.keys(pages).find(
        (p) => p === url.pathname || p.toLowerCase() === url.pathname.toLowerCase()
      );
      if (matchedPath) {
        event.preventDefault();
        navigate(matchedPath.toLowerCase() === '/ve-bellhop' ? '/ve-Bellhop' : matchedPath, url.hash);
        return;
      }
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
