import { useState, useEffect } from 'react';
import { Menu, X, Globe, ChevronRight, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  ro: [
    { label: 'Acasă',      id: 'home' },
    { label: 'Despre Noi', id: 'despre' },
    { label: 'Echipa',     id: 'classroom-mindmap' },
    { label: 'Proiecte',   id: 'projects' },
    { label: 'Album',      id: 'gallery' },
    { label: 'Întrebări',  id: 'faq' },
    { label: 'Știri',      id: 'news' },
    { label: 'Contact',    id: 'contact' },
  ],
  en: [
    { label: 'Home',       id: 'home' },
    { label: 'About Us',   id: 'despre' },
    { label: 'Our Team',   id: 'classroom-mindmap' },
    { label: 'Projects',   id: 'projects' },
    { label: 'Album',      id: 'gallery' },
    { label: 'FAQ',        id: 'faq' },
    { label: 'News',       id: 'news' },
    { label: 'Contact',    id: 'contact' },
  ],
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; }
button { border: none; background: none; cursor: pointer; }
*:focus { outline: none !important; }

/* ── Root ─────────────────────────────────────────────────── */
.h-root {
  position: fixed; top: 0; left: 0; right: 0; z-index: 900;
  height: var(--h-height, 64px);
  background: transparent;
  border-bottom: 1px solid transparent;
  font-family: 'DM Sans', sans-serif;
  transition: height 0.35s ease, background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
}
.h-root.scrolled {
  --h-height: 56px;
  background: #ffffff;
  border-bottom-color: #efefef;
  box-shadow: 0 2px 24px rgba(0,0,0,0.07);
}
@media (max-width: 640px) {
  .h-root        { --h-height: 54px; }
  .h-root.scrolled { --h-height: 50px; }
}

/* Thin navy accent line at top — only visible when scrolled */
.h-root::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: #1a3476;
  opacity: 0;
  transition: opacity 0.35s ease;
}
.h-root.scrolled::before { opacity: 1; }

/* ── Inner ────────────────────────────────────────────────── */
.h-inner {
  max-width: 1320px; margin: 0 auto; height: 100%;
  padding: 0 2.5rem;
  display: flex; align-items: center; gap: 0;
}
@media (max-width: 640px) { .h-inner { padding: 0 1rem; } }

/* ── Brand ────────────────────────────────────────────────── */
.h-brand {
  display: flex; align-items: center; gap: 10px;
  flex-shrink: 0; cursor: pointer; user-select: none;
  text-decoration: none;
}
.h-logo-wrap {
  position: relative; width: 34px; height: 34px; flex-shrink: 0;
}
@media (max-width: 640px) {
  .h-logo-wrap { width: 30px; height: 30px; }
}
.h-logo {
  width: 34px; height: 34px; border-radius: 50%; overflow: hidden;
  border: 2px solid rgba(255,255,255,0.4);
  transition: border-color 0.25s ease, transform 0.25s ease;
}
@media (max-width: 640px) {
  .h-logo { width: 30px; height: 30px; }
}
.h-brand:hover .h-logo {
  border-color: rgba(255,255,255,0.9);
  transform: scale(1.04);
}
.h-root.scrolled .h-logo { border-color: #e8e8e8; }
.h-root.scrolled .h-brand:hover .h-logo { border-color: #1a3476; }
.h-logo.spin { animation: hLogoSpin 0.65s cubic-bezier(0.4,0,0.2,1); }
@keyframes hLogoSpin {
  0%   { transform: perspective(400px) rotateY(0); }
  50%  { transform: perspective(400px) rotateY(180deg) scale(1.08); }
  100% { transform: perspective(400px) rotateY(360deg); }
}
.h-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Vertical divider between logo and text */
.h-brand-divider {
  width: 1px; height: 26px;
  background: rgba(255,255,255,0.25);
  flex-shrink: 0;
  transition: background 0.35s ease;
}
@media (max-width: 640px) { .h-brand-divider { height: 20px; } }
.h-root.scrolled .h-brand-divider { background: #d8d8d8; }

.h-brand-text { display: flex; flex-direction: column; gap: 2px; }
.h-brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem; font-weight: 600; line-height: 1;
  color: #ffffff;
  letter-spacing: 0.01em;
  transition: color 0.35s ease;
}
@media (max-width: 640px) { .h-brand-name { font-size: 0.85rem; } }
.h-root.scrolled .h-brand-name { color: #0a1628; }

.h-brand-sub {
  font-size: 0.58rem; font-weight: 500;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  transition: color 0.35s ease;
}
@media (max-width: 640px) { .h-brand-sub { font-size: 0.52rem; } }
.h-root.scrolled .h-brand-sub { color: #7a8499; }

/* ── Desktop nav ──────────────────────────────────────────── */
.h-nav {
  display: flex; align-items: center; gap: 2px;
  flex: 1; justify-content: center;
}
@media (max-width: 1100px) { .h-nav { display: none; } }

.h-nav-btn {
  position: relative; padding: 7px 11px;
  font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 500;
  color: rgba(255,255,255,0.85);
  border-radius: 6px;
  transition: color 0.18s ease, background 0.18s ease;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.h-nav-btn::after {
  content: '';
  position: absolute; bottom: 4px; left: 50%; right: 50%; height: 1.5px;
  border-radius: 2px;
  background: #fff;
  transition: left 0.22s ease, right 0.22s ease, background 0.35s ease;
}
.h-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
.h-nav-btn:hover::after { left: 16%; right: 16%; }
.h-nav-btn.active { color: #fff; font-weight: 600; }
.h-nav-btn.active::after { left: 16%; right: 16%; }
.h-root.scrolled .h-nav-btn { color: #4a5568; }
.h-root.scrolled .h-nav-btn::after { background: #1a3476; }
.h-root.scrolled .h-nav-btn:hover { color: #0a1628; background: #f5f6f8; }
.h-root.scrolled .h-nav-btn.active { color: #1a3476; }

/* ── Actions ──────────────────────────────────────────────── */
.h-actions {
  display: flex; align-items: center; gap: 6px;
  margin-left: auto; flex-shrink: 0;
}
@media (max-width: 640px) { .h-actions { gap: 5px; } }

/* Lang pill */
.h-lang {
  display: flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border: 1.5px solid rgba(255,255,255,0.35);
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif; font-size: 0.65rem; font-weight: 600;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(255,255,255,0.85);
  transition: all 0.25s ease;
  white-space: nowrap;
}
@media (max-width: 640px) {
  .h-lang { padding: 3px 8px; font-size: 0.62rem; }
}
.h-lang:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.12);
}
.h-root.scrolled .h-lang {
  color: #4a5568;
  border-color: #e2e5ea;
}
.h-root.scrolled .h-lang:hover {
  color: #0a1628;
  border-color: #1a3476;
  background: #f0f3ff;
}

/* Auth button */
.h-auth {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; padding: 0 14px;
  border-radius: 999px;
  background: #1a3476;
  border: 1.5px solid #1a3476;
  color: #ffffff;
  font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 600;
  letter-spacing: 0.04em;
  transition: all 0.22s ease;
  white-space: nowrap;
}
.h-auth:hover {
  background: #22429a;
  border-color: #22429a;
  box-shadow: 0 4px 18px rgba(26,52,118,0.35);
  transform: translateY(-1px);
}
@media (max-width: 640px) {
  .h-auth .h-auth-label { display: none; }
  .h-auth { width: 32px; height: 32px; padding: 0; border-radius: 50%; }
}

/* Account badge */
.h-acc {
  position: relative;
  display: flex; align-items: center; gap: 6px;
  padding: 3px 10px 3px 4px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 999px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.9);
  font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}
.h-acc:hover { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.15); }
.h-root.scrolled .h-acc { border-color: #e2e5ea; background: #fff; color: #0a1628; }
.h-root.scrolled .h-acc:hover { border-color: #1a3476; background: #f0f3ff; }
.h-acc-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  background: #1a3476;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 0.55rem; font-weight: 700;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}
.h-acc-label { display: none; }
@media (min-width: 480px) { .h-acc-label { display: inline; } }

/* Dropdown */
.h-drop {
  position: absolute; top: calc(100% + 10px); right: 0;
  background: #ffffff;
  border: 1.5px solid #e8e8e8;
  border-radius: 14px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
  min-width: 210px; overflow: hidden;
  animation: hDropIn 0.2s cubic-bezier(0.34,1.4,0.64,1);
  z-index: 999;
}
@keyframes hDropIn {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.h-drop-header {
  padding: 12px 16px 10px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fc;
}
.h-drop-name { font-size: 0.84rem; font-weight: 700; color: #0a1628; }
.h-drop-role { font-size: 0.63rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: #7a8499; margin-top: 2px; }
.h-drop-item {
  width: 100%; text-align: left; padding: 10px 16px;
  display: flex; align-items: center; gap: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500;
  color: #2d3748;
  transition: background 0.14s, color 0.14s;
}
.h-drop-item:hover { background: #f5f6f8; color: #0a1628; }
.h-drop-item.danger { color: #e53e3e; }
.h-drop-item.danger:hover { background: #fff5f5; color: #c53030; }
.h-drop-sep { height: 1px; background: #f0f0f0; margin: 2px 0; }

/* ── Burger ───────────────────────────────────────────────── */
.h-burger {
  display: none; width: 34px; height: 34px;
  align-items: center; justify-content: center;
  border: 1.5px solid rgba(255,255,255,0.35);
  border-radius: 8px;
  color: rgba(255,255,255,0.85);
  transition: all 0.2s;
  flex-shrink: 0;
}
@media (max-width: 1100px) { .h-burger { display: flex; } }
@media (max-width: 640px)  { .h-burger { width: 32px; height: 32px; } }
.h-burger:hover { border-color: rgba(255,255,255,0.7); color: #fff; background: rgba(255,255,255,0.1); }
.h-root.scrolled .h-burger { border-color: #e2e5ea; color: #4a5568; }
.h-root.scrolled .h-burger:hover { border-color: #1a3476; color: #1a3476; background: #f0f3ff; }

/* ── Overlay ──────────────────────────────────────────────── */
/*
  FIX: overlay starts below the header so it never covers it.
  top is set dynamically via JS (inline style), but we default
  to the CSS variable so it's correct immediately on open.
*/
.h-overlay {
  position: fixed;
  top: var(--h-height, 64px); /* ← starts below header */
  left: 0; right: 0; bottom: 0;
  z-index: 800;
  background: rgba(10,22,40,0.35);
  backdrop-filter: blur(4px);
  opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
}
.h-overlay.open { opacity: 1; pointer-events: auto; }

/* ── Drawer ───────────────────────────────────────────────── */
/*
  FIX: drawer starts at the bottom edge of the header, not at top:0.
  This prevents the menu content from sliding under/overlapping the header bar.
  border-radius on top corners gives a polished "panel drops down" feel.
*/
.h-drawer {
  position: fixed;
  top: var(--h-height, 64px); /* ← starts below header */
  right: 0; bottom: 0;
  width: min(300px, 85vw); z-index: 850;
  background: #ffffff;
  border-left: 1px solid #e8e8e8;
  border-top: 1px solid #e8e8e8;        /* ← clean separation from header */
  border-top-left-radius: 12px;          /* ← polished top corner */
  box-shadow: -24px 0 64px rgba(0,0,0,0.1);
  transform: translateX(105%);
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  display: flex; flex-direction: column; overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}
.h-drawer.open { transform: translateX(0); }

/* Navy accent now on border-top instead of ::before pseudo-element */
/* (pseudo was covering the border-top-left-radius corner) */

/* ── Drawer header ── removed since header is now the app header above */
/* Instead show a slim section label */
.h-drhd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  background: #f8f9fc;
}
.h-dr-brand { display: flex; align-items: center; gap: 10px; }
.h-dr-logo { width: 28px; height: 28px; border-radius: 50%; overflow: hidden; border: 2px solid #e8e8e8; flex-shrink: 0; }
.h-dr-logo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.h-dr-name { font-family: 'Playfair Display', serif; font-size: 0.85rem; font-weight: 600; color: #0a1628; }
.h-dr-sub  { font-size: 0.52rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #7a8499; margin-top: 2px; }
.h-dr-close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid #e2e5ea; border-radius: 50%;
  color: #7a8499; transition: all 0.2s; flex-shrink: 0;
}
.h-dr-close:hover { border-color: #0f2567; color: #0f2567; background: #f0f3ff; }

/* Drawer nav */
.h-dr-nav { flex: 1; overflow-y: auto; padding: 8px 8px 6px; display: flex; flex-direction: column; gap: 1px; }
.h-dr-btn {
  width: 100%; text-align: left;
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px;
  border: 1.5px solid transparent; border-radius: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 500;
  color: #4a5568;
  transition: all 0.16s ease;
  opacity: 0; transform: translateX(12px);
}
.h-drawer.open .h-dr-btn { animation: hSlideIn 0.32s cubic-bezier(0.4,0,0.2,1) forwards; }
@keyframes hSlideIn { to { opacity: 1; transform: translateX(0); } }
.h-dr-btn:hover { color: #0a1628; background: #f5f6f8; border-color: #eaecf0; }
.h-dr-btn.active { color: #0f2567; background: #f0f3ff; border-color: #ccd6f6; font-weight: 600; }
.h-dr-btn .h-arr { color: #0f2567; opacity: 0; transition: opacity 0.14s, transform 0.14s; flex-shrink: 0; }
.h-dr-btn:hover .h-arr, .h-dr-btn.active .h-arr { opacity: 1; transform: translateX(2px); }
.h-dr-sep { height: 1px; background: #f0f0f0; margin: 3px 4px; }

/* Stagger delays */
.h-drawer.open .h-dr-btn:nth-child(1)  { animation-delay: .03s }
.h-drawer.open .h-dr-btn:nth-child(2)  { animation-delay: .06s }
.h-drawer.open .h-dr-btn:nth-child(3)  { animation-delay: .09s }
.h-drawer.open .h-dr-btn:nth-child(4)  { animation-delay: .12s }
.h-drawer.open .h-dr-btn:nth-child(5)  { animation-delay: .15s }
.h-drawer.open .h-dr-btn:nth-child(6)  { animation-delay: .18s }
.h-drawer.open .h-dr-btn:nth-child(7)  { animation-delay: .21s }
.h-drawer.open .h-dr-btn:nth-child(8)  { animation-delay: .24s }
.h-drawer.open .h-dr-btn:nth-child(9)  { animation-delay: .27s }

/* Drawer footer */
.h-dr-foot {
  padding: 10px 12px 28px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;
}
.h-dr-action {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 9px 14px; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em;
  transition: all 0.2s; border: 1.5px solid;
}
.h-dr-act-primary {
  background: #1a3476;
  color: #ffffff;
  border-color: #1a3476;
}
.h-dr-act-primary:hover {
  background: #22429a;
  border-color: #22429a;
  box-shadow: 0 4px 16px rgba(26,52,118,0.25);
}
.h-dr-act-outline {
  background: #fff;
  color: #4a5568;
  border-color: #e2e5ea;
}
.h-dr-act-outline:hover { background: #f5f6f8; color: #0a1628; border-color: #c8cdd8; }
.h-dr-act-red {
  background: #fff;
  color: #e53e3e;
  border-color: #fed7d7;
}
.h-dr-act-red:hover { background: #fff5f5; border-color: #feb2b2; }
.h-dr-copy {
  text-align: center; font-size: 0.58rem; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: #b0b8c8;
  margin-top: 2px;
}

/* ── Spacer to push content below fixed header ────────────── */
.h-spacer { height: var(--h-height, 64px); }
`;

export default function Header({ currentLanguage = 'ro', onLanguageChange, onOpenAuth, onOpenDashboard }) {
  const { logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const [logoSpin, setLogoSpin] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  // Keep the CSS variable --h-height in sync with scroll state
  // so overlay and drawer always match the real header height
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const h = window.scrollY > 30
        ? window.innerWidth <= 640 ? 50 : 56
        : window.innerWidth <= 640 ? 54 : 64;
      root.style.setProperty('--h-height', `${h}px`);
      setScrolled(window.scrollY > 30);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    if (!dropOpen) return;
    const fn = () => setDropOpen(false);
    document.addEventListener('click', fn);
    return () => document.removeEventListener('click', fn);
  }, [dropOpen]);

  useEffect(() => {
    const links = NAV_LINKS[currentLanguage];
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    links.forEach(l => { const el = document.getElementById(l.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [currentLanguage]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 68, behavior: 'smooth' });
    setActiveId(id);
    setMenuOpen(false);
  };

  const toggleLang = () => onLanguageChange?.(currentLanguage === 'ro' ? 'en' : 'ro');
  const links = NAV_LINKS[currentLanguage];

  return (
    <>
      <style>{CSS}</style>

      <header className={`h-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="h-inner">

          {/* Brand */}
          <div
            className="h-brand"
            onClick={() => { setLogoSpin(true); setTimeout(() => setLogoSpin(false), 700); scrollTo('home'); }}
          >
            <div className="h-logo-wrap">
              <div className={`h-logo${logoSpin ? ' spin' : ''}`}>
                <img src="ceasnou.webp" alt="Interact Cismigiu" />
              </div>
            </div>
            <div className="h-brand-divider" />
            <div className="h-brand-text">
              <span className="h-brand-name">Interact Cismigiu</span>
              <span className="h-brand-sub">București · Sector 5</span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="h-nav">
            {links.map(link => (
              <button
                key={link.id}
                className={`h-nav-btn${activeId === link.id ? ' active' : ''}`}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="h-actions">
            <button className="h-lang" onClick={toggleLang}>
              <Globe size={10} strokeWidth={2.5} />
              {currentLanguage === 'ro' ? 'EN' : 'RO'}
            </button>

            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <div className="h-acc" onClick={e => { e.stopPropagation(); setDropOpen(d => !d); }}>
                  <div className="h-acc-avatar">IC</div>
                  <span className="h-acc-label">Portal</span>
                </div>
                {dropOpen && (
                  <div className="h-drop" onClick={e => e.stopPropagation()}>
                    <div className="h-drop-header">
                      <div className="h-drop-name">Interact Cismigiu</div>
                      <div className="h-drop-role">Membru autentificat</div>
                    </div>
                    <div className="h-drop-sep" />
                    <button className="h-drop-item" onClick={() => { onOpenDashboard?.(); setDropOpen(false); }}>
                      <LayoutDashboard size={14} />
                      {currentLanguage === 'ro' ? 'Portal Membri' : 'Member Portal'}
                    </button>
                    <div className="h-drop-sep" />
                    <button className="h-drop-item danger" onClick={() => { logout(); setDropOpen(false); }}>
                      <LogOut size={14} />
                      {currentLanguage === 'ro' ? 'Deconectare' : 'Logout'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="h-auth" onClick={onOpenAuth}>
                <LogIn size={13} strokeWidth={2.5} />
                <span className="h-auth-label">
                  {currentLanguage === 'ro' ? 'Autentificare' : 'Login'}
                </span>
              </button>
            )}

            <button className="h-burger" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={16} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay — starts below header, never covers it */}
      <div className={`h-overlay${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Drawer — starts below header, slides in from right */}
      <div className={`h-drawer${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <div className="h-drhd">
          <div className="h-dr-brand">
            <div className="h-dr-logo">
              <img src="https://voluntx.com/wp-content/uploads/2025/09/Untitled-design-1.png" alt="Logo" />
            </div>
            <div>
              <div className="h-dr-name">Interact Cismigiu</div>
              <div className="h-dr-sub">{currentLanguage === 'ro' ? 'București · Sector 5' : 'Bucharest · Sector 5'}</div>
            </div>
          </div>
          <button className="h-dr-close" onClick={() => setMenuOpen(false)}>
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="h-dr-nav">
          {links.map((link, i) => (
            <>
              {i === 2 && <div key="sep1" className="h-dr-sep" />}
              {i === 7 && <div key="sep2" className="h-dr-sep" />}
              <button
                key={link.id}
                className={`h-dr-btn${activeId === link.id ? ' active' : ''}`}
                onClick={() => scrollTo(link.id)}
              >
                {link.label}
                <ChevronRight size={12} strokeWidth={2.5} className="h-arr" />
              </button>
            </>
          ))}
        </nav>

        <div className="h-dr-foot">
          {isAuthenticated ? (
            <>
              <button className="h-dr-action h-dr-act-primary" onClick={() => { onOpenDashboard?.(); setMenuOpen(false); }}>
                <LayoutDashboard size={13} />
                {currentLanguage === 'ro' ? 'Portal Membri' : 'Member Portal'}
              </button>
              <button className="h-dr-action h-dr-act-red" onClick={() => { logout(); setMenuOpen(false); }}>
                <LogOut size={13} />
                {currentLanguage === 'ro' ? 'Deconectare' : 'Logout'}
              </button>
            </>
          ) : (
            <button className="h-dr-action h-dr-act-primary" onClick={() => { onOpenAuth?.(); setMenuOpen(false); }}>
              <LogIn size={13} />
              {currentLanguage === 'ro' ? 'Autentificare Membri' : 'Member Login'}
            </button>
          )}
          <button className="h-dr-action h-dr-act-outline" onClick={() => { toggleLang(); setMenuOpen(false); }}>
            <Globe size={13} />
            {currentLanguage === 'ro' ? 'Switch to English' : 'Schimbă în Română'}
          </button>
          <div className="h-dr-copy">© 2025 Interact București Cismigiu</div>
        </div>
      </div>
    </>
  );
}