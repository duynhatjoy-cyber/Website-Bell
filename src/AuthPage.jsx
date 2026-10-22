import React, { useEffect, useRef, useState } from 'react';

const initialForm = { name: '', property: '', email: '', phone: '', password: '', confirm: '' };

export default function AuthPage({ mode, onClose, onModeChange, onDemo }) {
  const registering = mode === 'register';
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialog = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.current?.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])') || []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    dialog.current?.querySelector('.auth-close')?.focus();
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus?.(); };
  }, [onClose]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    if (error) setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (registering && form.password !== form.confirm) {
      setError('Mật khẩu nhập lại chưa khớp.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const fields = registering
        ? { name: form.name.trim(), property: form.property.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const response = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const result = await response.json().catch(() => ({}));
      if (response.status === 404) throw new TypeError('Auth service unavailable');
      if (!response.ok) throw new Error(result.message || 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.');
      const fallback = registering ? '/login' : '/';
      const redirect = typeof result.redirect === 'string' && result.redirect.startsWith('/') && !result.redirect.startsWith('//')
        ? result.redirect : fallback;
      window.location.assign(redirect);
    } catch (cause) {
      setError(cause instanceof TypeError ? 'Chưa kết nối được dịch vụ tài khoản. Vui lòng thử lại sau.' : cause.message);
    } finally {
      setBusy(false);
    }
  };

  return <div className="auth-page auth-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="auth-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="auth-close" type="button" aria-label="Đóng" onClick={onClose}>×</button>
      <div className="auth-panel">
        <div className="auth-intro">
          <span className="auth-eyebrow">Bắt đầu cùng Bellhop</span>
          <h1>{registering ? 'Vận hành gọn hơn, bắt đầu miễn phí.' : 'Chào mừng bạn quay lại.'}</h1>
          <p>{registering ? 'Tạo tài khoản để quản lý cơ sở lưu trú trên một nền tảng. Bellhop đồng hành cùng bạn từ những bước đầu tiên.' : 'Đăng nhập để tiếp tục quản lý đặt phòng, vận hành và chăm sóc khách trên Bellhop.'}</p>
          <ul className="auth-benefits">
            <li>Lễ tân và vận hành trên một nền tảng</li>
            <li>Thiết lập phù hợp với cơ sở của bạn</li>
            <li>Hỗ trợ khi bạn cần</li>
          </ul>
          <a className="auth-demo" href="/#form" onClick={(event) => { event.preventDefault(); onDemo(); }}>Muốn xem trước? Đặt lịch demo <span aria-hidden="true">→</span></a>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <span className="auth-card-kicker">{registering ? 'TÀI KHOẢN MỚI' : 'TÀI KHOẢN BELLHOP'}</span>
          <h2 id="auth-title">{registering ? 'Đăng ký miễn phí' : 'Đăng nhập'}</h2>
          <p className="auth-card-desc">{registering ? 'Điền thông tin để bắt đầu cùng Bellhop.' : 'Nhập thông tin tài khoản của bạn để tiếp tục.'}</p>
          {registering && <div className="auth-grid">
            <label>Họ và tên <span>*</span><input value={form.name} onChange={update('name')} autoComplete="name" required placeholder="Nguyễn Văn A" /></label>
            <label>Tên cơ sở <span>*</span><input value={form.property} onChange={update('property')} autoComplete="organization" required placeholder="Tên khách sạn / homestay" /></label>
          </div>}
          <div className={registering ? 'auth-grid' : 'auth-stack'}>
            <label>Email <span>*</span><input type="email" value={form.email} onChange={update('email')} autoComplete="email" required placeholder="ban@khachsan.vn" /></label>
            {registering && <label>Số điện thoại <span>*</span><input type="tel" value={form.phone} onChange={update('phone')} autoComplete="tel" required pattern="[0-9+ .()-]{9,16}" title="Nhập số điện thoại hợp lệ" placeholder="09xx xxx xxx" /></label>}
          </div>
          <div className={registering ? 'auth-grid' : 'auth-stack'}>
            <label>Mật khẩu <span>*</span><div className="auth-password"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} autoComplete={registering ? 'new-password' : 'current-password'} required minLength={registering ? 8 : undefined} placeholder={registering ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu'} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{showPassword ? 'Ẩn' : 'Hiện'}</button></div></label>
            {registering && <label>Nhập lại mật khẩu <span>*</span><input type={showPassword ? 'text' : 'password'} value={form.confirm} onChange={update('confirm')} autoComplete="new-password" required minLength={8} placeholder="Nhập lại mật khẩu" /></label>}
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Đang xử lý...' : registering ? 'Tạo tài khoản miễn phí →' : 'Đăng nhập →'}</button>
          <p className="auth-switch">{registering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'} <a href={registering ? 'https://app.bellhop.biz/' : '/register'} onClick={registering ? undefined : (event) => { event.preventDefault(); onModeChange('register'); }}>{registering ? 'Đăng nhập' : 'Đăng ký miễn phí'}</a></p>
        </form>
      </div>
    </section>
  </div>;
}
