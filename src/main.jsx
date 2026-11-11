import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AuthPage from './AuthPage.jsx';
import CustomerStories from './CustomerStories.jsx';
import { applyLanguage } from './translations.js';
import './style.css';

const paths = {
  Main: '/',
  PMS: '/san-pham/bellhop-pms',
  BookingEngine: '/san-pham/bellhop-booking-engine',
  CMS: '/san-pham/bellhop-cms',
  Website: '/san-pham/bellhop-website',
  Message: '/san-pham/bellhop-message',
  AIConcierge: '/san-pham/bellhop-ai-concierge',
  Payment: '/san-pham/bellhop-payment',
  Finance: '/san-pham/bellhop-finance',
  Pricing: '/bang-gia',
  News: '/tin-tuc',
  About: '/ve-Bellhop',
  Privacy: '/chinh-sach-bao-ve-va-xu-ly-du-lieu-ca-nhan',
  Terms: '/dieu-khoan-va-bao-mat',
  PaymentPolicy: '/chinh-sach-thanh-toan',
};

const pages = {
  '/': 'Main',
  '/chinh-sach-bao-ve-va-xu-ly-du-lieu-ca-nhan': 'Privacy',
  '/chinh-sach/bao-ve-va-xu-ly-du-lieu-ca-nhan': 'Privacy',
  '/chinh-sach-bao-mat': 'Privacy',
  '/chinh-sach/bao-mat': 'Privacy',
  '/chinh-sach-du-lieu': 'Privacy',
  '/bao-ve-du-lieu-ca-nhan': 'Privacy',
  '/privacy': 'Privacy',
  '/dieu-khoan-va-bao-mat': 'Terms',
  '/dieu-khoan': 'Terms',
  '/dieu-khoan-su-dung': 'Terms',
  '/terms': 'Terms',
  '/chinh-sach-thanh-toan': 'PaymentPolicy',
  '/quy-dinh-thanh-toan': 'PaymentPolicy',
  '/payment-policy': 'PaymentPolicy',
  '/san-pham/bellhop-pms': 'PMS',
  '/san-pham/bellhop-booking-engine': 'BookingEngine',
  '/san-pham/bellhop-cms': 'CMS',
  '/san-pham/bellhop-website': 'Website',
  '/san-pham/bellhop-message': 'Message',
  '/san-pham/bellhop-ai-concierge': 'AIConcierge',
  '/san-pham/bellhop-payment': 'Payment',
  '/san-pham/bellhop-finance': 'Finance',
  '/bang-gia': 'Pricing',
  '/tin-tuc': 'News',
  '/lifrooms': 'About',
  '/ve-bellhop': 'About',
  '/ve-Bellhop': 'About',
  // Backward compatibility aliases
  '/pms': 'PMS',
  '/booking-engine': 'BookingEngine',
  '/cms': 'CMS',
  '/website': 'Website',
  '/message': 'Message',
  '/ai-concierge': 'AIConcierge',
  '/payment': 'Payment',
  '/finance': 'Finance',
  '/san-pham/pms': 'PMS',
  '/san-pham/booking-engine': 'BookingEngine',
  '/san-pham/cms': 'CMS',
  '/san-pham/website': 'Website',
  '/san-pham/message': 'Message',
  '/san-pham/ai-concierge': 'AIConcierge',
  '/san-pham/payment': 'Payment',
  '/san-pham/finance': 'Finance',
};
const loginUrl = 'https://app.bellhop.biz/';

function routeFromLocation() {
  const path = window.location.pathname;
  if (path === '/khach-hang/cau-chuyen') return path;
  if (pages[path]) return paths[pages[path]] || path;
  const match = Object.keys(pages).find((p) => p.toLowerCase() === path.toLowerCase());
  if (match) return paths[pages[match]] || match;
  return '/';
}

function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [language, setLanguage] = useState(() => localStorage.getItem('bellhop-language') || 'vi');
  const [modalMode, setModalMode] = useState(() => window.location.pathname === '/register' ? 'register' : null);
  const frame = useRef(null);
  const syncing = useRef(false);

  useEffect(() => {
    const canonical = paths[pages[route]];
    if (canonical && window.location.pathname !== canonical && window.location.pathname !== '/khach-hang/cau-chuyen' && window.location.pathname !== '/register') {
      window.history.replaceState({}, '', canonical + window.location.hash);
    }
  }, [route]);

  const navigate = useCallback((path, hash = '', replace = false) => {
    const rawPath = pages[path] ? path : Object.keys(pages).find((p) => p.toLowerCase() === path.toLowerCase());
    if (!rawPath || !pages[rawPath]) return;
    const component = pages[rawPath];
    const canonicalPath = paths[component] || rawPath;
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
        const component = pages[matchedPath];
        navigate(paths[component] || matchedPath, url.hash);
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
