import { Heart, Users, Award, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/**
 * Design concept: "the club noticeboard"
 * The whole section now sits on top of the club's own photos — tiled,
 * blurred and washed in Rotary colors — instead of a flat paper backdrop.
 * Facts and values stay "pinned up" as bright cards on top of that surface.
 * The top edge is a solid-navy fade that hands off exactly from the Hero,
 * so the two sections read as one continuous piece.
 *
 * The archive section is now a self-scrolling photo carousel: it drifts on
 * its own at a slow, steady pace, but a drag/swipe takes over instantly and
 * hands control right back to autoplay on release.
 */

const facts = [
  { value: '2015', label: 'Anul fondării', rot: 0 },
  { value: 'Sector 5', label: 'București', rot: 0 },
  { value: 'District 2241', label: 'Rotary International', rot: 0 },
  { value: '< 19 ani', label: 'Toți membrii', rot: 0 },
];

const values = [
  {
    icon: Heart,
    title: 'Cauze, nu cifre',
    desc: 'Fiecare proiect pleacă de la o nevoie reală din Sector 5, nu de la un total pe care vrem să-l afișăm.',
    rot: 0,
  },
  {
    icon: Users,
    title: 'Condus de noi',
    desc: 'Elevi sub 19 ani aleg proiectele, fac bugetele și răspund de rezultate. Mentoratul vine din exterior, deciziile nu.',
    rot: 0,
  },
  {
    icon: Award,
    title: 'Parte dintr-o rețea de 1,4M',
    desc: 'District 2241 ne leagă de zeci de cluburi Interact și Rotaract din România și de familia globală Rotary.',
    rot: 0,
  },

];

const clubPhotos = ['itc.webp','itc.webp','itc.webp','itc.webp','itc.webp','itc.webp','IMG_1351.webp', 'IMG_1352.webp', 'IMG_1353.webp', 'IMG_1354.webp','IMG_1334.webp', 'IMG_1328.webp', 'IMG_1344.webp', 'IMG_1332.webp', 'IMG_1342.webp', 'IMG_1333.webp','itc.webp',];
// Tiled several times so the mosaic comfortably covers a tall section.
const bgTiles = [...clubPhotos, ...clubPhotos, ...clubPhotos, ...clubPhotos];

// Archive carousel: the same club shots, now flowing left in an endless strip
// instead of being scattered as a static pinboard.
const carouselPhotos = [
  { src: 'IMG_1334.webp', caption: 'Seară de film' },
  { src: 'IMG_1357.webp', caption: 'Vizită la adăpost' },
  { src: 'IMG_1330.webp', caption: 'Asociația Valentina' },
  { src: 'IMG_1332.webp', caption: 'Cu sponsorii' },
  { src: 'IMG_1342.webp', caption: 'Christmas for Everyone' },
  { src: 'IMG_1331.webp', caption: 'Seară de film' },
  { src: 'IMG_1328.webp', caption: 'Echipa la treabă' },
  { src: 'IMG_1333.webp', caption: 'Voluntariat' },
  { src: 'itc.webp', caption: 'Împreună' },
  { src: 'IMG_1338.webp', caption: 'Pe teren' },
  { src: 'IMG_1356.webp', caption: 'Zâmbete' },
];

function ArchiveCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const setWidthRef = useRef(0);
  const rafRef = useRef<number>();
  const SPEED = 0.45; // px per frame, slow drift

  // duplicated once for a seamless loop
  const items = [...carouselPhotos, ...carouselPhotos];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => { setWidthRef.current = track.scrollWidth / 2; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const tick = () => {
      if (!draggingRef.current) {
        posRef.current -= SPEED;
        const w = setWidthRef.current;
        if (w && posRef.current <= -w) posRef.current += w;
        if (w && posRef.current > 0) posRef.current -= w;
      }
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
    startPosRef.current = posRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    posRef.current = startPosRef.current + (e.clientX - startXRef.current);
  };
  const endDrag = () => { draggingRef.current = false; };

  return (
    <div
      className="ic-carousel"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="ic-carousel-track" ref={trackRef}>
        {items.map((p, i) => (
          <div className="ic-carousel-card" key={i}>
            <img src={p.src} alt={p.caption} loading="lazy" draggable={false} />
            <div className="ic-carousel-caption">{p.caption}</div>
          </div>
        ))}
      </div>
      <div className="ic-carousel-edge ic-carousel-edge--l" />
      <div className="ic-carousel-edge ic-carousel-edge--r" />
    </div>
  );
}

export default function About() {
  const [entered, setEntered] = useState(false);
  const secRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.05 });
    if (secRef.current) obs.observe(secRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');

        .ic { --royal:#17458f; --azure:#0067c8; --gold:#f7a81b; --cranberry:#a0223d;
              --ink:#12233f; --card:#fffdf7; --line:rgba(255,255,255,0.14);
              --txt:#eef3ff; --txt-mute:rgba(226,236,255,0.72); }

        .ic { font-family:'Inter',sans-serif; background:#050a1e; color:var(--txt);
              position:relative; overflow:hidden; padding:0 0 90px; }
        .ic * { box-sizing:border-box; margin:0; padding:0; }
        .ic .wrap { max-width:1180px; margin:0 auto; padding:0 28px; position:relative; z-index:2; }

        /* ── PHOTO BACKGROUND — the club's own photos, tiled + blurred, behind the whole section ── */
        .ic-photo-bg { position:absolute; inset:0; z-index:0; display:flex; flex-wrap:wrap; overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.3); transform:scale(1.08); }
        .ic-photo-bg img { flex:1 1 260px; height:260px; object-fit:cover; display:block; }
        .ic-photo-overlay { position:absolute; inset:0; z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%); }

        /* solid-navy fade at the very top — the literal seam with the Hero below it */
        .ic-continuity { position:absolute; top:0; left:0; right:0; height:260px; z-index:1; pointer-events:none;
          background:linear-gradient(to bottom, #050a1e 0%, rgba(5,10,30,0.6) 60%, rgba(5,10,30,0) 100%); }

        .ic-top-band { position:relative; padding:56px 0 44px; }

        @keyframes icRise { from{opacity:0; transform:translateY(28px)} to{opacity:1; transform:translateY(0)} }
        @keyframes icSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .ic.vis .e0 { animation:icRise .8s .0s cubic-bezier(.16,.8,.2,1) both; }
        .ic.vis .e1 { animation:icRise .9s .1s cubic-bezier(.16,.8,.2,1) both; }
        .ic.vis .e2 { animation:icRise .9s .2s cubic-bezier(.16,.8,.2,1) both; }
        .ic.vis .e3 { animation:icRise .9s .3s cubic-bezier(.16,.8,.2,1) both; }
        .ic.vis .e4 { animation:icRise .9s .4s cubic-bezier(.16,.8,.2,1) both; }
        .ic.vis .e5 { animation:icRise .9s .5s cubic-bezier(.16,.8,.2,1) both; }

        /* ── TOP LABEL ROW ── */
        .ic-top-row { display:flex; align-items:center; gap:14px; margin-bottom:18px; flex-wrap:wrap; }
        .ic-eyebrow { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700;
          letter-spacing:.05em; color:#fff9e4; background:rgba(250,204,21,0.12); border:1.5px solid rgba(250,204,21,0.35);
          backdrop-filter:blur(6px); border-radius:100px; padding:6px 14px; }
        .ic-eyebrow-sub { font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--txt-mute); letter-spacing:.02em; }

        /* ── HERO ROW ── */
        .ic-hero-grid { display:grid; grid-template-columns:1.15fr 0.85fr; gap:40px; align-items:start; margin-bottom:72px; }
        @media(max-width:860px) { .ic-hero-grid { grid-template-columns:1fr; gap:48px; } }

        .ic-headline { font-family:'Space Grotesk',sans-serif; font-weight:700;
          font-size:clamp(34px,5.4vw,64px); line-height:1.04; letter-spacing:-.02em; color:#fff; margin-bottom:22px; }
        .ic-headline em { font-style:normal; color:var(--gold); }

        .ic-lede { font-size:15.5px; line-height:1.8; color:var(--txt-mute); max-width:480px; font-weight:400; }
        .ic-lede strong { color:#fff; font-weight:600; }

        .ic-pin-cluster { display:grid; grid-template-columns:1fr 1fr; gap:18px 16px; padding-top:6px; }

        .ic-pin { --r:0deg; background:var(--card); border:1px solid rgba(18,35,63,0.08); border-radius:10px;
          padding:20px 16px 16px; text-align:center; position:relative;
          box-shadow:0 14px 30px rgba(0,0,0,0.35); transform:rotate(var(--r));
          transition:transform .4s cubic-bezier(.22,.68,0,1.2), box-shadow .4s; cursor:default; }
        .ic-pin:hover { transform:rotate(0deg) translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.42); }
        .ic-pin-dot { position:absolute; top:-7px; left:50%; transform:translateX(-50%);
          width:14px; height:14px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffd873, var(--gold));
          box-shadow:0 3px 6px rgba(0,0,0,0.3); }
        .ic-pin-value { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:19px; color:var(--royal); margin-bottom:4px; }
        .ic-pin-label { font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:#5c6c88; }

        @media(min-width:861px) {
          .ic-pin { padding:30px 22px 24px; border-radius:14px; }
          .ic-pin-dot { width:18px; height:18px; top:-9px; }
          .ic-pin-value { font-size:28px; margin-bottom:6px; }
          .ic-pin-label { font-size:11px; letter-spacing:.1em; }
        }

        /* ── DIVIDER ── */
        .ic-divider-row { display:flex; align-items:center; gap:14px; margin-bottom:30px; }
        .ic-divider-label { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700;
          letter-spacing:.14em; color:var(--gold); white-space:nowrap; }
        .ic-divider-line { flex:1; height:1px; background:repeating-linear-gradient(90deg, var(--line) 0 6px, transparent 6px 12px); }

        /* ── VALUE PATCHES ── */
        .ic-patch-strip { display:flex; flex-wrap:wrap; gap:16px; margin-bottom:80px; }
        .ic-patch { --r:0deg; flex:1 1 250px; background:var(--card); border:1px solid rgba(18,35,63,0.06);
          border-radius:16px; padding:22px 20px; transform:rotate(var(--r)); position:relative;
          transition:transform .45s cubic-bezier(.22,.68,0,1.2), box-shadow .45s, border-color .3s;
          box-shadow:0 12px 26px rgba(0,0,0,0.3); }
        .ic-patch:hover { transform:rotate(0deg) translateY(-5px); box-shadow:0 22px 44px rgba(0,0,0,0.36); border-color:rgba(247,168,27,0.4); }
        .ic-patch-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(135deg, var(--royal), var(--azure)); margin-bottom:14px;
          box-shadow:0 4px 10px rgba(0,103,200,0.25); }
        .ic-patch-title { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; color:var(--ink); margin-bottom:8px; }
        .ic-patch-desc { font-size:12.8px; line-height:1.65; color:#5c6c88; font-weight:400; }

        /* ── MISSION ── */
        .ic-mission { background:rgba(10,20,50,0.55); backdrop-filter:blur(4px);
          border:1px solid rgba(255,255,255,0.1); border-radius:22px; padding:52px; position:relative; overflow:hidden; margin-bottom:64px; }
        .ic-mission::before { content:''; position:absolute; top:-40%; left:-10%; width:360px; height:360px;
          border-radius:50%; background:radial-gradient(circle, rgba(247,168,27,0.16) 0%, transparent 70%); pointer-events:none; }

        .ic-mission-grid { display:grid; grid-template-columns:1.2fr 0.9fr; gap:44px; align-items:center; position:relative; z-index:1; }
        @media(max-width:820px) { .ic-mission-grid { grid-template-columns:1fr; } }

        .ic-mission-eyebrow { display:flex; align-items:center; gap:8px; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:var(--gold); margin-bottom:16px; }
        .ic-mission-quote { font-family:'Space Grotesk',sans-serif; font-weight:700; color:#fff;
          font-size:clamp(28px,4vw,46px); line-height:1.06; letter-spacing:-.02em; margin-bottom:26px; }
        .ic-mission-body { font-size:14px; line-height:1.85; color:var(--txt-mute); font-weight:300; margin-bottom:14px; }

        .ic-mission-cta { display:inline-flex; align-items:center; gap:9px; background:var(--gold); color:#12233f;
          border:none; border-radius:10px; padding:13px 26px; font-family:'Space Grotesk',sans-serif;
          font-weight:700; font-size:13.5px; cursor:pointer; margin-top:12px;
          transition:transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s, background .3s; }
        .ic-mission-cta:hover { transform:translateY(-3px); background:#ffc247; box-shadow:0 14px 30px rgba(247,168,27,0.35); }
        .ic-mission-cta svg { transition:transform .3s; }
        .ic-mission-cta:hover svg { transform:translateX(4px); }

        /* photo cadran + real Rotary emblem */
        .ic-mission-cadran { position:relative; aspect-ratio:1/1; border-radius:26px; overflow:hidden;
          box-shadow:0 24px 54px rgba(5,10,30,0.6); border:1px solid rgba(255,255,255,0.16); }
        .ic-mission-cadran img.photo { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.05); }
        .ic-mission-cadran-shade { position:absolute; inset:0;
          background:linear-gradient(200deg, rgba(14,27,63,0.05) 0%, rgba(14,27,63,0.55) 100%); }

        .ic-gear-wrap { position:absolute; top:-24px; right:-24px; width:104px; height:104px; z-index:3;
          filter:drop-shadow(0 10px 20px rgba(5,10,30,0.55)); background:#fff; border-radius:50%; padding:6px; }
        .ic-gear-spin { width:100%; height:100%; animation:icSpin 30s linear infinite; object-fit:contain; }

        @media(max-width:520px) {
          .ic-mission { padding:36px 24px; }
          .ic-gear-wrap { width:76px; height:76px; top:-16px; right:-16px; }
        }

        /* ── ARCHIVE HEADER ── */
        .ic-archive-note { text-align:center; margin-bottom:36px; }
        .ic-archive-label { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700;
          letter-spacing:.14em; color:var(--gold); margin-bottom:12px; display:block; }
        .ic-archive-title { font-family:'Space Grotesk',sans-serif; font-weight:700; color:#fff;
          font-size:clamp(22px,3vw,32px); line-height:1.15; letter-spacing:-.02em; }

        /* ── ARCHIVE CAROUSEL — drifts on its own, drag/swipe takes over instantly ── */
        .ic-carousel { position:relative; margin-bottom:56px; overflow:hidden; cursor:grab; touch-action:pan-y; }
        .ic-carousel:active { cursor:grabbing; }
        .ic-carousel-track { display:flex; gap:18px; width:max-content; will-change:transform; }
        .ic-carousel-card { flex:0 0 auto; width:220px; background:var(--card); border-radius:6px;
          padding:10px 10px 34px; box-shadow:0 16px 30px rgba(0,0,0,0.45); position:relative;
          user-select:none; transition:transform .3s cubic-bezier(.22,.68,0,1.2), box-shadow .3s; }
        .ic-carousel-card:hover { transform:translateY(-4px); box-shadow:0 22px 42px rgba(0,0,0,0.5); }
        .ic-carousel-card img { width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:3px; display:block; pointer-events:none; }
        .ic-carousel-caption { position:absolute; bottom:10px; left:10px; right:10px; text-align:center;
          font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:500; color:var(--ink); }
        .ic-carousel-edge { position:absolute; top:0; bottom:0; width:90px; z-index:2; pointer-events:none; }
        .ic-carousel-edge--l { left:0; background:linear-gradient(to right, rgba(6,13,35,0.95), transparent); }
        .ic-carousel-edge--r { right:0; background:linear-gradient(to left, rgba(6,13,35,0.95), transparent); }

        @media(max-width:600px) {
          .ic-carousel-card { width:150px; padding:8px 8px 28px; }
          .ic-carousel-edge { width:44px; }
          .ic-carousel-caption { font-size:10px; }
        }

        /* ── FOOTER STRIP ── */
        .ic-footer-strip { display:flex; align-items:center; gap:10px; justify-content:center;
          font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--txt-mute); padding-top:8px; }
        .ic-footer-strip img { width:20px; height:20px; flex-shrink:0; }
      `}</style>

      <section id="despre" className={`ic${entered ? ' vis' : ''}`} ref={secRef}>
        {/* photos as the background for the entire section */}
        <div className="ic-photo-bg">
          {bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}
        </div>
        <div className="ic-photo-overlay" />
        <div className="ic-continuity" />

        <div className="ic-top-band">
          <div className="wrap">
            <div className="ic-top-row e0">
              <span className="ic-eyebrow">// CINE SUNTEM</span>
              <span className="ic-eyebrow-sub">Interact București Cismigiu · afiliat Rotary International</span>
            </div>

            <div className="ic-hero-grid">
              <div className="e1">
                <h2 className="ic-headline">
                  Suntem liceenii<br />care nu așteaptă<br /><em>să crească.</em>
                </h2>
                <p className="ic-lede">
                  Interact București Cismigiu e un club de voluntariat condus integral de elevi sub 19 ani,
                  afiliat Rotary International. <strong>Alegem cauzele</strong>, facem bugetele și batem la uși
                  după sponsori — mentoratul vine din exterior, deciziile rămân ale noastre.
                </p>
              </div>

              <div className="ic-pin-cluster e2">
                {facts.map((f, i) => (
                  <div key={i} className="ic-pin" style={{ '--r': `${f.rot}deg` } as React.CSSProperties}>
                    <div className="ic-pin-dot" />
                    <div className="ic-pin-value">{f.value}</div>
                    <div className="ic-pin-label">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="wrap">

          <div className="ic-divider-row e3">
            <span className="ic-divider-label">CE NE DEFINEȘTE</span>
            <div className="ic-divider-line" />
          </div>

          <div className="ic-patch-strip e3">
            {values.map((v, i) => (
              <div key={i} className="ic-patch" style={{ '--r': `${v.rot}deg` } as React.CSSProperties}>
                <div className="ic-patch-icon">
                  <v.icon style={{ width: 20, height: 20, color: '#fff' }} />
                </div>
                <h3 className="ic-patch-title">{v.title}</h3>
                <p className="ic-patch-desc">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="ic-mission e4">
            <div className="ic-mission-grid">
              <div>
                <div className="ic-mission-eyebrow">Motto Rotary</div>
                <h3 className="ic-mission-quote">"Service Above Self"</h3>
                <p className="ic-mission-body">
                  Pentru noi înseamnă un lucru simplu: pui nevoile comunității înaintea propriului confort.
                  Vizite la adăposturi, strângeri de fonduri, colaborări cu ONG-uri locale — fiecare acțiune
                  pornește de la o nevoie concretă, nu de la o bifă pe un CV.
                </p>
                <p className="ic-mission-body">
                  Suntem sponsorizați de un club Rotary din București, dar rămânem un club de elevi, gestionat
                  de elevi. Aici înveți să conduci un proiect înainte să ai voie să conduci o mașină.
                </p>
                <button className="ic-mission-cta">
                  <span>Devino Voluntar</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <div className="ic-mission-cadran">
                <img className="photo" src="tgms.webp" alt="Interact București Cismigiu în acțiune" />
                <div className="ic-mission-cadran-shade" />
                <div className="ic-gear-wrap">
                  <img className="ic-gear-spin" src="rotary-wheel.webp" alt="Rotary International" />
                </div>
              </div>
            </div>
          </div>

          <div className="ic-archive-note e5">
            <span className="ic-archive-label">DIN ARHIVA CLUBULUI</span>
            <h3 className="ic-archive-title">Sute de ore de voluntariat, o singură echipă.</h3>
          </div>

          <div className="e5">
            <ArchiveCarousel />
          </div>

          <div className="ic-footer-strip e5">
            <img src="rotary-wheel.webp" alt="Rotary International" />
            <span>Afiliat Rotary International · District 2241 România</span>
          </div>

        </div>
      </section>
    </>
  );
}