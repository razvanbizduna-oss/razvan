import { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Globe, ChevronRight, Heart, ExternalLink, ArrowUp } from 'lucide-react';

const CONTENT = {
  ro: {
    eyebrow: '// INTERACT BUCUREȘTI CISMIGIU',
    motto: 'Voluntariat care schimbă vieți',
    description: 'Interact Cișmigiu este o organizație de tineret afiliată Rotary Club Cișmigiu, dedicată voluntariatului, liderismului și impactului pozitiv în comunitate.',
    rotary: 'Afiliat Rotary International · District 2241 România',
    quickLinks: {
      title: 'Navigare',
      links: [
        { label: 'Acasă',        id: 'home' },
        { label: 'Despre Noi',   id: 'despre' },
        { label: 'Echipa',       id: 'classroom-mindmap' },
        { label: 'Proiecte',     id: 'projects' },
        { label: 'Știri',        id: 'news' },
        { label: 'Întrebări',    id: 'faq' },
        { label: 'Contact',      id: 'contact' },
      ],
    },
    contact: {
      title: 'Contact',
      address: 'Piața Cișmigiu, Sector 1, București',
      phone: '+40 21 XXX XXXX',
      email: 'contact@interactcismigiu.ro',
      hours: 'Luni – Vineri: 09:00 – 17:00',
      map: 'Vezi pe Hartă',
    },
    social: {
      title: 'Rețele Sociale',
      follow: 'Urmărește activitatea noastră și fii la curent cu toate proiectele.',
    },
    copyright: '© 2025 Interact Cișmigiu. Toate drepturile rezervate.',
    credits: 'Creat cu',
    creditsEnd: 'pentru voluntariat și comunitate.',
    backTop: 'Înapoi sus',
  },
  en: {
    eyebrow: '// INTERACT BUCUREȘTI CISMIGIU',
    motto: 'Volunteering that changes lives',
    description: 'Interact Cismigiu is a youth organization affiliated with Rotary Club Cismigiu, dedicated to volunteering, leadership and positive community impact.',
    rotary: 'Affiliated with Rotary International · District 2241 Romania',
    quickLinks: {
      title: 'Navigation',
      links: [
        { label: 'Home',         id: 'home' },
        { label: 'About Us',     id: 'despre' },
        { label: 'Our Team',     id: 'classroom-mindmap' },
        { label: 'Projects',     id: 'projects' },
        { label: 'News',         id: 'news' },
        { label: 'FAQ',          id: 'faq' },
        { label: 'Contact',      id: 'contact' },
      ],
    },
    contact: {
      title: 'Contact',
      address: 'Cismigiu Square, Sector 1, Bucharest',
      phone: '+40 21 XXX XXXX',
      email: 'contact@interactcismigiu.ro',
      hours: 'Monday – Friday: 09:00 – 17:00',
      map: 'View on Map',
    },
    social: {
      title: 'Social Media',
      follow: 'Follow our activity and stay up to date with all projects.',
    },
    copyright: '© 2025 Interact Cismigiu. All rights reserved.',
    credits: 'Made with',
    creditsEnd: 'for volunteering and community.',
    backTop: 'Back to top',
  },
};

// Same club photos tiled across the rest of the site (About, TeamPage,
// Projects, News, Gallery, FAQ, ContactForm) — kept identical so the
// footer reads as the last panel of the same continuous surface.
const bgPhotos = ['itc.webp', 'IMG_1347.webp', 'IMG_1352.webp', 'IMG_1351.webp', 'IMG_1349.webp', 'IMG_1350.webp'];
const bgTiles = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const SOCIALS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com',
    icon: Facebook,
    color: '#4fa3e8',
    bg: 'rgba(0,103,200,0.14)',
    border: 'rgba(0,103,200,0.3)',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com',
    icon: Instagram,
    color: '#e07a9a',
    bg: 'rgba(160,34,61,0.14)',
    border: 'rgba(160,34,61,0.3)',
  },
  {
    name: 'Website',
    href: '#',
    icon: Globe,
    color: '#ffcf5c',
    bg: 'rgba(247,168,27,0.14)',
    border: 'rgba(247,168,27,0.3)',
  },
];

export default function Footer({ language = 'ro' }) {
  const t = CONTENT[language];
  const [footRef, footVisible] = useInView(0.05);
  const [hoverSocial, setHoverSocial] = useState(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        .ft-root {
          --royal:#17458f;--royal:#17458f;--royal:#17458f;--royal:#17458f;
          --card:#fffdf7; --txt:#eef3ff; --txt-mute:rgba(226,236,255,0.7);
          font-family:'Inter',sans-serif; color:var(--txt);
          position:relative; overflow:hidden; background:#050a1e;
        }
        .ft-root * { box-sizing:border-box; }
        .ft-root button { border:none; font-family:inherit; }
        .ft-root *:focus { outline:none !important; }

        /* ══ PHOTO BACKGROUND — same tiled club photos + navy overlay as the rest of the site ══ */
        .ft-photo-bg { position:absolute; inset:0; z-index:0; display:flex; flex-wrap:wrap; overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.42); transform:scale(1.08); }
        .ft-photo-bg img { flex:1 1 260px; height:260px; object-fit:cover; display:block; }
        .ft-photo-overlay { position:absolute; inset:0; z-index:1;
          background:linear-gradient(190deg, rgba(6,13,35,0.94) 0%, rgba(12,24,58,0.9) 45%, rgba(17,35,75,0.85) 100%); }

        /* top accent border, same brand gradient used across the site */
        .ft-root::before {
          content:''; position:absolute; top:0; left:0; right:0; height:3px; z-index:2;
          background:linear-gradient(90deg, transparent 0%, var(--royal) 20%, var(--azure) 45%, var(--gold) 70%, var(--gold-l) 85%, transparent 100%);
        }

        .ft-wrap { position:relative; z-index:2; max-width:1380px; margin:0 auto; padding:76px 52px 0; }
        @media (max-width:768px) { .ft-wrap { padding:56px 24px 0; } }
        @media (max-width:480px) { .ft-wrap { padding:44px 16px 0; } }

        @keyframes ftSpin { to { transform:rotate(360deg); } }

        /* ── GRID ── */
        .ft-grid {
          display:grid; grid-template-columns:1.6fr 1fr 1.2fr 1fr; gap:48px;
          opacity:0; transform:translateY(28px); transition:opacity .7s ease, transform .7s ease;
        }
        .ft-grid.visible { opacity:1; transform:translateY(0); }
        @media (max-width:1100px) { .ft-grid { grid-template-columns:1fr 1fr; gap:40px; } }
        @media (max-width:640px)  { .ft-grid { grid-template-columns:1fr; gap:36px; } }

        /* ── EYEBROW ── */
        .ft-eyebrow { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700;
          letter-spacing:.05em; color:#fff9e4; background:rgba(250,204,21,0.12); border:1.5px solid rgba(250,204,21,0.35);
          backdrop-filter:blur(6px); border-radius:100px; padding:6px 14px; display:inline-block; margin-bottom:20px; }

        /* ── BRAND COLUMN ── */
        .ft-brand-logo-wrap { display:flex; align-items:center; gap:14px; margin-bottom:20px; }
        .ft-logo-hex {
          width:60px; height:60px; flex-shrink:0; border-radius:14px;
          background:var(--card); display:flex; align-items:center; justify-content:center; padding:6px;
          border:1px solid rgba(255,255,255,0.14);
          box-shadow:0 8px 24px rgba(0,0,0,0.35);
          transition:transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .4s;
        }
        .ft-logo-hex:hover { transform:scale(1.07) rotate(-2deg); box-shadow:0 12px 30px rgba(0,0,0,0.42); }
        .ft-logo-hex img { width:100%; height:100%; object-fit:contain; display:block; }

        .ft-brand-name {
          font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.32rem; line-height:1.15;
          color:#fff; letter-spacing:-.01em;
        }
        .ft-brand-sub {
          font-family:'JetBrains Mono',monospace; font-size:.62rem; font-weight:700;
          color:var(--gold-l); letter-spacing:.14em; text-transform:uppercase; margin-top:4px;
        }

        .ft-motto { font-family:'Space Grotesk',sans-serif; font-style:normal; font-size:1rem; font-weight:700;
          color:var(--gold-l); margin-bottom:14px; line-height:1.5; }
        .ft-desc { font-size:.85rem; color:var(--txt-mute); line-height:1.85; margin-bottom:22px; font-weight:300; }

        /* rotary badge — real wheel artwork, gently spinning */
        .ft-rotary { display:inline-flex; align-items:center; gap:10px; padding:8px 14px 8px 10px;
          border:1px solid rgba(255,255,255,0.14); border-radius:100px; background:rgba(255,255,255,0.05);
          font-family:'JetBrains Mono',monospace; font-size:.64rem; font-weight:600;
          color:var(--txt-mute); letter-spacing:.03em; backdrop-filter:blur(6px); }
        .ft-wheel-img { width:20px; height:20px; flex-shrink:0; animation:ftSpin 9s linear infinite; display:block; }

        /* ── SECTION HEADINGS ── */
        .ft-col-title {
          font-family:'Space Grotesk',sans-serif; font-size:1.02rem; font-weight:700;
          color:#fff; letter-spacing:.01em; margin-bottom:20px; position:relative; padding-bottom:12px;
        }
        .ft-col-title::after {
          content:''; position:absolute; bottom:0; left:0; width:32px; height:2px; border-radius:2px;
          background:linear-gradient(90deg, var(--gold), var(--gold-l));
        }

        /* ── NAV LINKS ── */
        .ft-links { list-style:none; display:flex; flex-direction:column; gap:4px; padding:0; margin:0; }
        .ft-link-btn {
          display:flex; align-items:center; gap:6px; padding:6px 0; background:none; cursor:pointer;
          font-size:.85rem; font-weight:500; color:var(--txt-mute);
          transition:color .22s, gap .22s; text-align:left;
        }
        .ft-link-btn svg { opacity:0; flex-shrink:0; transition:opacity .22s, transform .22s; color:var(--gold-l); }
        .ft-link-btn:hover { color:#fff; gap:10px; }
        .ft-link-btn:hover svg { opacity:1; transform:translateX(2px); }

        /* ── CONTACT ── */
        .ft-contact-list { display:flex; flex-direction:column; gap:14px; }
        .ft-contact-row { display:flex; align-items:flex-start; gap:11px; }
        .ft-contact-icon {
          width:32px; height:32px; border-radius:9px; flex-shrink:0;
          background:rgba(0,103,200,0.16); border:1px solid rgba(79,163,232,0.28);
          display:flex; align-items:center; justify-content:center;
        }
        .ft-contact-icon svg { color:#4fa3e8; }
        .ft-contact-text { font-size:.83rem; color:var(--txt-mute); line-height:1.55; padding-top:6px; font-weight:300; }

        .ft-map-btn {
          display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; cursor:pointer;
          background:linear-gradient(120deg, var(--azure), var(--royal)); border:none;
          font-family:'Space Grotesk',sans-serif; font-size:.76rem; font-weight:700;
          color:#fff; letter-spacing:.02em; margin-top:6px;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), box-shadow .3s, filter .3s;
        }
        .ft-map-btn:hover { transform:translateY(-3px); filter:brightness(1.08); box-shadow:0 10px 24px rgba(0,103,200,0.35); }

        /* ── SOCIAL ── */
        .ft-social-desc { font-size:.83rem; color:var(--txt-mute); line-height:1.7; margin-bottom:18px; font-weight:300; }
        .ft-social-list { display:flex; flex-direction:column; gap:10px; }
        .ft-social-btn {
          display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; cursor:pointer;
          text-decoration:none; border:1px solid transparent;
          transition:all .28s cubic-bezier(.4,0,.2,1); background:rgba(255,255,255,0.04);
        }
        .ft-social-btn:hover { transform:translateX(5px); }
        .ft-social-icon {
          width:36px; height:36px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; transition:transform .3s;
        }
        .ft-social-btn:hover .ft-social-icon { transform:scale(1.12) rotate(-4deg); }
        .ft-social-name { font-size:.85rem; font-weight:700; color:var(--txt-mute); transition:color .25s; font-family:'Space Grotesk',sans-serif; }
        .ft-social-btn:hover .ft-social-name { color:#fff; }
        .ft-social-arrow { margin-left:auto; opacity:0; transition:opacity .25s, transform .25s; color:rgba(226,236,255,.6); }
        .ft-social-btn:hover .ft-social-arrow { opacity:1; transform:translateX(3px); }

        /* ── DIVIDER ── */
        .ft-divider { height:1px; margin:48px 0 0;
          background:repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 6px, transparent 6px 12px); }

        /* ── BOTTOM BAR ── */
        .ft-bottom { padding:22px 0 32px; display:flex; align-items:center; flex-wrap:wrap; gap:12px; justify-content:space-between; }
        .ft-copy { font-family:'JetBrains Mono',monospace; font-size:.7rem; color:var(--txt-mute); font-weight:500; letter-spacing:.02em; }
        .ft-credits { display:flex; align-items:center; gap:5px; font-size:.75rem; color:var(--txt-mute); }
        .ft-credits .heart { color:#e0637f; animation:heartbeat 1.8s ease infinite; }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.25)} }

        /* ── BACK TO TOP ── */
        .ft-top-btn {
          display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:100px;
          border:1.5px solid rgba(255,255,255,0.16); background:rgba(255,255,255,0.05); cursor:pointer;
          font-family:'JetBrains Mono',monospace; font-size:.68rem; font-weight:700;
          color:var(--txt-mute); letter-spacing:.07em; text-transform:uppercase;
          transition:all .3s cubic-bezier(.34,1.56,.64,1); opacity:0; pointer-events:none; transform:translateY(6px);
        }
        .ft-top-btn.show { opacity:1; pointer-events:auto; transform:translateY(0); }
        .ft-top-btn:hover { background:var(--gold); border-color:var(--gold); color:#12233f; transform:translateY(-3px);
          box-shadow:0 8px 20px rgba(247,168,27,0.32); }
        .ft-top-btn:hover svg { transform:translateY(-2px); }
        .ft-top-btn svg { transition:transform .25s; }
      `}</style>

      <footer className="ft-root">
        <div className="ft-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="ft-photo-overlay" />

        <div className="ft-wrap">
          <div ref={footRef} className={`ft-grid${footVisible ? ' visible' : ''}`}>

            {/* ── BRAND ── */}
            <div>
              <span className="ft-eyebrow">{t.eyebrow}</span>
              <div className="ft-brand-logo-wrap">
                <div className="ft-logo-hex">
                  <img src="ceas.webp" alt="Interact Cismigiu" loading="lazy" decoding="async" />
                </div>
                <div>
                  <div className="ft-brand-name">Interact Cișmigiu</div>
                  <div className="ft-brand-sub">București · Sector 5</div>
                </div>
              </div>

              <p className="ft-motto">"{t.motto}"</p>
              <p className="ft-desc">{t.description}</p>

              <div className="ft-rotary">
                <img className="ft-wheel-img" src="rotary-wheel.webp" alt="Rotary International" loading="lazy" decoding="async" />
                {t.rotary}
              </div>
            </div>

            {/* ── QUICK LINKS ── */}
            <div>
              <h4 className="ft-col-title">{t.quickLinks.title}</h4>
              <ul className="ft-links">
                {t.quickLinks.links.map(l => (
                  <li key={l.id}>
                    <button className="ft-link-btn" onClick={() => scrollTo(l.id)}>
                      <ChevronRight size={12} strokeWidth={3} />
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── CONTACT ── */}
            <div>
              <h4 className="ft-col-title">{t.contact.title}</h4>
              <div className="ft-contact-list">
                {[
                  { Icon: MapPin, text: t.contact.address },
                  { Icon: Phone, text: t.contact.phone },
                  { Icon: Mail, text: t.contact.email },
                  { Icon: Clock, text: t.contact.hours },
                ].map(({ Icon, text }, i) => (
                  <div className="ft-contact-row" key={i}>
                    <div className="ft-contact-icon">
                      <Icon size={14} strokeWidth={2.2} />
                    </div>
                    <span className="ft-contact-text">{text}</span>
                  </div>
                ))}
                <button
                  className="ft-map-btn"
                  onClick={() => window.open('https://maps.google.com/?q=Piața+Cișmigiu,+Sector+1,+București', '_blank')}
                >
                  <MapPin size={13} strokeWidth={2.5} />
                  {t.contact.map}
                  <ExternalLink size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ── SOCIAL ── */}
            <div>
              <h4 className="ft-col-title">{t.social.title}</h4>
              <p className="ft-social-desc">{t.social.follow}</p>
              <div className="ft-social-list">
                {SOCIALS.map(s => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ft-social-btn"
                    style={{
                      background: hoverSocial === s.name ? s.bg : 'rgba(255,255,255,0.04)',
                      borderColor: hoverSocial === s.name ? s.border : 'transparent',
                    }}
                    onMouseEnter={() => setHoverSocial(s.name)}
                    onMouseLeave={() => setHoverSocial(null)}
                  >
                    <div
                      className="ft-social-icon"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      <s.icon size={17} strokeWidth={2} style={{ color: s.color }} />
                    </div>
                    <span className="ft-social-name">{s.name}</span>
                    <ExternalLink size={12} className="ft-social-arrow" strokeWidth={2.5} />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Divider */}
          <div className="ft-divider" />

          {/* Bottom bar */}
          <div className="ft-bottom">
            <span className="ft-copy">{t.copyright}</span>
            <div className="ft-credits">
              {t.credits}
              <Heart size={13} className="heart" fill="#e0637f" strokeWidth={0} />
              {t.creditsEnd}
            </div>
            <button
              className={`ft-top-btn${showTop ? ' show' : ''}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowUp size={13} strokeWidth={2.5} />
              {t.backTop}
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}