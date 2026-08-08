import { useState, useEffect, useRef } from "react";

/**
 * Design concept: "the noticeboard, continued"
 * About introduced the club's corkboard — photos and facts pinned to a wall
 * of the club's own pictures. TeamPage is the same wall, turned toward the
 * people who run it: member badges pinned up instead of snapshots, a mission
 * card that mirrors "Service Above Self", and the same footer strip that
 * closed the previous section. Same board, same pins, same hand.
 */

const MEMBERS = [
  {
    id: 1, index: "01", rot: 0, lift: 0,
    name: "Theodora Coțofană", role: "Președinte", dept: "Conducere",
   
    image: "miruna.webp",
    desc: "Coordonează toate cele șase departamente și reprezintă clubul în fața Rotary International și a partenerilor instituționali.",
  },
  {
    id: 2, index: "02", rot: 0, lift: 16,
    name: "Sebastian Scoarță", role: "Vicepreședinte", dept: "Conducere",
    phone: "+40 721 000 002", email: "vice@interactcismigiu.ro",
    image: "IMG_1347.webp",
    desc: "Asigură că fiecare voluntar se simte sprijinit și că proiectele nu se blochează în birocrație.",
  },
  {
    id: 3, index: "03", rot: 0, lift: 6,
    name: "Sophia Lăzărescu", role: "Trezorier", dept: "Gestionare Economii",
    phone: "+40 721 000 003", email: "ecologie@interactcismigiu.ro",
    image: "IMG_1352.webp",
    desc: "Responsabilul financiar care gestionează bugetul, încasează cotizațiile și monitorizează cheltuielile pentru a asigura transparența organizației.",
  },
  {
    id: 4, index: "04", rot: 0, lift: 22,
    name: "Iris Ioan", role: "Public Relations", dept: "Media",
    phone: "+40 721 000 004", email: "educatie@interactcismigiu.ro",
    image: "IMG_1351.webp",
    desc: "Gestionează imaginea publică a organizației, menținând legătura cu presa pentru a construi o reputație solidă și pozitivă.",
  },
  {
    id: 5, index: "05", rot: 0, lift: 2,
    name: "Mara Olteanu", role: "IR & Comunicare", dept: "Comunicare",
    phone: "+40 721 000 005", email: "pr@interactcismigiu.ro",
    image: "IMG_1349.webp",
    desc: "Se ocupă cu stabilirea și menținerea parteneriatelor externe, facilitând colaborarea clubului cu entități din alte țări.",
  },
  {
    id: 6, index: "06", rot: 0, lift: 18,
    name: "Diana Țancu", role: "Club Service", dept: "Service",
    phone: "+40 721 000 006", email: "trezorerie@interactcismigiu.ro",
    image: "IMG_1350.webp",
    desc: "Elaborează bugetele, gestionează sponsorii și asigură că fiecare leu donat ajunge exact acolo unde trebuie.",
  },
  {
    id: 7, index: "07", rot: 0, lift: 8,
    name: "Bizdună Răzvan", role: "Secretar", dept: "Secretariat & Fundraising",
    phone: "+40 721 000 007", email: "secretar@interactcismigiu.ro",
    image: "lf.webp",
    desc: "Combină gestionarea documentelor oficiale cu planificarea logistică și coordonarea campaniilor de strângere de fonduri.",
  },
  {
    id: 8, index: "08", rot: 0, lift: 20,
    name: "Miruna Bichir", role: "Past President", dept: "Consultanță",
    phone: "+40 721 000 008", email: "pastprezi@interactcismigiu.ro",
    image: "miruna.webp",
    desc: "Rămâne în structura de conducere pentru a oferi consultanță, a asigura continuitatea strategiei și a ghida actuala conducere.",
  },
];

const FACTS = [
  { value: 8, suffix: "", label: "Membri în bord", rot: 0 },
  { value: 6, suffix: "", label: "Departamente", rot: 0 },
  { value: 5, suffix: "+", label: "Ani de mandat cumulați", rot: 0 },
  { value: 40, suffix: "+", label: "Proiecte coordonate", rot: 0 },
];

const REVIEWS = [
  { text: "Am venit la primul proiect cu emoții și fără să știu pe nimeni. Am plecat cu o familie.", name: "Miruna Bichir", role: "Președinte", tag: "Leadership", rot: 0 },
  { text: "Interact mi-a arătat că a face bine nu trebuie să fie complicat. Uneori e doar să fii prezent pentru cineva.", name: "Luca Gutuman", role: "Vicepreședinte", tag: "Impact", rot: 0 },
  { text: "Cel mai frumos lucru câștigat? Curajul de a vorbi în fața unui public și de a crede că ce spun eu contează.", name: "Anne Ionescu", role: "Treasurer", tag: "Creștere", rot: 0 },
  { text: "Nu veneam pentru CV. Veneam pentru că îmi plăcea să fiu acolo, alături de oameni care contează.", name: "Miles Fratauceanu", role: "PR", tag: "Comunitate", rot: 0 },
  { text: "Fiecare proiect m-a învățat ceva nou. Dar cel mai important lucru l-am învățat de la colegii mei.", name: "Theea Cotofana", role: "IR & Comunicare", tag: "Gratitudine", rot: 0 },
  { text: "Sunt mândră de fiecare leu strâns. Dar sunt și mai mândră de echipa cu care am reușit.", name: "Ioana Cotofana", role: "Club Service", tag: "Mândrie", rot: 0 },
  { text: "Logistica m-a învățat că orice problemă are o soluție dacă ești organizat.", name: "Ana Clara Beciu", role: "Secretar", tag: "Organizare", rot: 0},
  { text: "E o onoare să privesc cum ideile pe care le-am început cresc sub noua conducere.", name: "Daria Duță", role: "Past President", tag: "Mentorat", rot: 0 },
];

// the four brand colors, cycled — never more, never fewer
const ACCENTS = ["var(--royal)", "var(--royal)", "var(--royal)", "var(--royal)"];

const boardPhotos = ["pozica.webp", "IMG_1347.webp", "IMG_1352.webp", "IMG_1351.webp", "IMG_1349.webp", "IMG_1350.webp"];
const bgTiles = [...boardPhotos, ...boardPhotos, ...boardPhotos, ...boardPhotos];

function useReveal() {
  const [entered, setEntered] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.05 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return { entered, ref };
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const [on, setOn] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting && !on) setOn(true); }, { threshold: 0.5 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, [on]);
  useEffect(() => {
    if (!on) return;
    let v = 0; const step = Math.max(1, Math.ceil(target / 40));
    const t = setInterval(() => { v += step; if (v >= target) { setVal(target); clearInterval(t); } else setVal(v); }, 24);
    return () => clearInterval(t);
  }, [on, target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function Badge({ m, i }: { m: typeof MEMBERS[0]; i: number }) {
  const [flipped, setFlipped] = useState(false);
  const accent = ACCENTS[i % ACCENTS.length];
  return (
    <div
      className={`tm-badge${flipped ? " tm-badge--flipped" : ""}`}
      style={{ "--i": i, "--r": `${m.rot}deg`, "--lift": `${m.lift}px`, "--accent": accent } as React.CSSProperties}
    >
      <button
        className="tm-badge-flipbtn"
        type="button"
        onClick={() => setFlipped(f => !f)}
        aria-label={`Detalii ${m.name}`}
        aria-pressed={flipped}
      >
        <div className="tm-badge-flip">
          <div className="tm-flip-inner">

            <div className="tm-face tm-face--front">
              <div className="tm-badge-pin" />
              <div className="tm-badge-photo">
                <img src={m.image} alt={m.name} loading="lazy" />
              </div>
              <div className="tm-badge-info">
                <span className="tm-badge-role">{m.role}</span>
                <h3 className="tm-badge-name">{m.name}</h3>
                <span className="tm-badge-dept">{m.dept}</span>
              </div>
              <div className="tm-badge-stamp">{m.index}</div>
            </div>

            <div className="tm-face tm-face--back">
              <div className="tm-badge-pin" />
              <span className="tm-back-idx">{m.index}</span>
              <h3 className="tm-back-name">{m.name}</h3>
              <p className="tm-back-role">{m.role}</p>
              <div className="tm-back-rule" />
              <p className="tm-back-desc">{m.desc}</p>
              <div className="tm-back-links">
                <a href={`tel:${m.phone}`} className="tm-back-link" onClick={e => e.stopPropagation()}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>
                  {m.phone}
                </a>
                <a href={`mailto:${m.email}`} className="tm-back-link" onClick={e => e.stopPropagation()}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  {m.email}
                </a>
              </div>
              <span className="tm-back-hint">Atinge pentru a întoarce</span>
            </div>

          </div>
        </div>
      </button>
    </div>
  );
}

function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const setWidthRef = useRef(0);
  const rafRef = useRef<number>();
  const SPEED = 0.4; // px per frame, slow drift

  // duplicated once for a seamless loop
  const items = [...REVIEWS, ...REVIEWS];

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

  const pointerTypeRef = useRef<string>('mouse');
  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    pointerTypeRef.current = e.pointerType;
    startXRef.current = e.clientX;
    startPosRef.current = posRef.current;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    // Pe telefon, o glisare cu degetul mișcă banda mai mult decât distanța
    // reală parcursă de deget — se simte mai rapidă. Pe mouse rămâne 1:1.
    const rawDelta = e.clientX - startXRef.current;
    const speedMultiplier = pointerTypeRef.current === 'touch' ? 1.7 : 1;
    posRef.current = startPosRef.current + rawDelta * speedMultiplier;
  };
  const endDrag = () => { draggingRef.current = false; };

  return (
    <div
      className="tm-reviews"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="tm-rv-track" ref={trackRef}>
        {items.map((r, i) => (
          <div
            key={i}
            className="tm-rv-card"
            style={{ "--accent": ACCENTS[i % ACCENTS.length], "--r": `${r.rot}deg` } as React.CSSProperties}
          >
            <span className="tm-rv-tag">{r.tag}</span>
            <div className="tm-rv-quote">"</div>
            <p className="tm-rv-text">{r.text}</p>
            <div className="tm-rv-divider" />
            <div className="tm-rv-author">
              <div className="tm-rv-avatar">{r.name.split(" ").map(w => w[0]).join("")}</div>
              <div>
                <div className="tm-rv-name">{r.name}</div>
                <div className="tm-rv-role">{r.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="tm-rv-edge tm-rv-edge--l" />
      <div className="tm-rv-edge tm-rv-edge--r" />
    </div>
  );
}

export default function TeamPage() {
  const top = useReveal();
  const board = useReveal();
  const mission = useReveal();
  const voices = useReveal();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');

        .tm { --royal:#17458f; --azure:#0067c8; --gold:#f7a81b; --cranberry:#a0223d;
              --ink:#12233f; --card:#fffdf7; --line:rgba(255,255,255,0.14);
              --txt:#eef3ff; --txt-mute:rgba(226,236,255,0.72); }
        .tm { font-family:'Inter',sans-serif; background:#050a1e; color:var(--txt);
              position:relative; overflow:hidden; }
        .tm *,.tm *::before,.tm *::after { box-sizing:border-box; margin:0; padding:0; }
        .tm a { text-decoration:none; color:inherit; }
        .tm .wrap { max-width:1180px; margin:0 auto; padding:0 28px; position:relative; z-index:2; }

        @keyframes tmRise { from{opacity:0; transform:translateY(26px)} to{opacity:1; transform:translateY(0)} }
        @keyframes tmSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        /* ══ PHOTO BOARD BACKGROUND — same device as About, whole section ══ */
        .tm-photo-bg { position:absolute; inset:0; z-index:0; display:flex; flex-wrap:wrap; overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.48); transform:scale(1.08); }
        .tm-photo-bg img { flex:1 1 260px; height:260px; object-fit:cover; display:block; }
        .tm-photo-overlay { position:absolute; inset:0; z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%); }; }
        .tm-continuity { position:absolute; top:0; left:0; right:0; height:220px; z-index:1; pointer-events:none;
          background:linear-gradient(to bottom, #050a1e 0%, rgba(5,10,30,0.55) 55%, rgba(5,10,30,0) 100%); }

        /* ══ TOP BAND — mirrors About's ic-hero-grid exactly ══ */
        .tm-top { position:relative; padding:68px 0 48px; }
        .tm-top-row { display:flex; align-items:center; gap:14px; margin-bottom:18px; flex-wrap:wrap; }
        .tm-eyebrow { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700;
          letter-spacing:.05em; color:#fff9e4; background:rgba(250,204,21,0.12); border:1.5px solid rgba(250,204,21,0.35);
          backdrop-filter:blur(6px); border-radius:100px; padding:6px 14px; }
        .tm-eyebrow-sub { font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--txt-mute); letter-spacing:.02em; }

        .tm-hero-grid { display:grid; grid-template-columns:1.15fr 0.85fr; gap:40px; align-items:start; }
        @media(max-width:860px) { .tm-hero-grid { grid-template-columns:1fr; gap:44px; } }

        .tm-headline { font-family:'Space Grotesk',sans-serif; font-weight:700;
          font-size:clamp(34px,5.4vw,64px); line-height:1.04; letter-spacing:-.02em; color:#fff; margin-bottom:22px; }
        .tm-headline em { font-style:normal; color:var(--gold); }
        .tm-lede { font-size:15.5px; line-height:1.8; color:var(--txt-mute); max-width:480px; font-weight:400; }
        .tm-lede strong { color:#fff; font-weight:600; }

        .tm-fact-cluster { display:grid; grid-template-columns:1fr 1fr; gap:18px 16px; padding-top:6px; }
        .tm-fact { --r:0deg; background:var(--card); border:1px solid rgba(18,35,63,0.08); border-radius:14px;
          padding:24px 18px 18px; text-align:center; position:relative;
          box-shadow:0 14px 30px rgba(0,0,0,0.35); transform:rotate(var(--r));
          transition:transform .4s cubic-bezier(.22,.68,0,1.2), box-shadow .4s; cursor:default; }
        .tm-fact:hover { transform:rotate(0deg) translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.42); }
        .tm-fact-dot { position:absolute; top:-8px; left:50%; transform:translateX(-50%);
          width:16px; height:16px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffd873, var(--gold));
          box-shadow:0 3px 6px rgba(0,0,0,0.3); }
        .tm-fact-num { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:26px; color:var(--royal); margin-bottom:4px; }
        .tm-fact-label { font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:.08em; text-transform:uppercase; color:#5c6c88; }

        /* ══ SECTION DIVIDER ══ */
        .tm-divider-row { display:flex; align-items:center; gap:14px; margin:0 0 34px; }
        .tm-divider-label { font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700;
          letter-spacing:.14em; color:var(--gold); white-space:nowrap; }
        .tm-divider-line { flex:1; height:1px; background:repeating-linear-gradient(90deg, var(--line) 0 6px, transparent 6px 12px); }

        /* ══ THE BOARD — member badges pinned up ══ */
        .tm-board-wrap { padding:8px 0 84px; }
        .tm-board { display:grid; grid-template-columns:repeat(4,1fr); gap:26px 20px; }
        @media(max-width:860px) { .tm-board { grid-template-columns:repeat(3,1fr); gap:22px 16px; } }
        @media(max-width:600px) {
          .tm-board { grid-template-columns:repeat(2,1fr); gap:14px 10px; }
          .tm-badge-flip { aspect-ratio:3/4.6; }
          .wrap { padding:0 16px; }
        }

        .tm-badge { --i:0; --r:0deg; --lift:0px; opacity:0;
          animation:tmRise .6s calc(var(--i)*.07s + .05s) both;
          transform:translateY(var(--lift)); }
        .tm-badge-flipbtn { display:block; width:100%; background:none; border:none; padding:0; cursor:pointer; font:inherit; color:inherit; }
        .tm-badge-flip { perspective:1400px; aspect-ratio:3/4.1; }
        .tm-flip-inner { position:relative; width:100%; height:100%; transform-style:preserve-3d;
          transform:rotate(var(--r)); transition:transform .6s cubic-bezier(.22,.68,0,1.2); }
        /* Hover lift only applies on devices with real hover, and only while the card
           hasn't been flipped — this is what was causing the double-trigger/stuck-flip
           bug on touch screens, where a tap fires both hover and click states. */
        @media (hover:hover) {
          .tm-badge:not(.tm-badge--flipped):hover .tm-flip-inner { transform:rotate(0deg) translateY(-5px); }
        }
        .tm-badge--flipped .tm-flip-inner { transform:rotate(0deg) rotateY(180deg); }

        .tm-face { position:absolute; inset:0; backface-visibility:hidden; border-radius:14px; overflow:hidden;
          box-shadow:0 16px 32px rgba(0,0,0,0.4); }
        .tm-face--front { background:var(--card); display:flex; flex-direction:column; }
        .tm-face--back { background:linear-gradient(165deg, #0e1c3c 0%, #142a52 100%); transform:rotateY(180deg);
          padding:20px 16px 16px; display:flex; flex-direction:column; border:1px solid rgba(255,255,255,0.08); }

        .tm-badge-pin { position:absolute; top:-8px; left:50%; transform:translateX(-50%); z-index:4;
          width:15px; height:15px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ff9a9a, var(--cranberry));
          box-shadow:0 3px 7px rgba(0,0,0,0.4); }

        .tm-badge-photo { position:relative; flex:1; overflow:hidden; }
        .tm-badge-photo img { width:100%; height:100%; object-fit:cover; object-position:center top; display:block;
          filter:grayscale(35%) contrast(1.02); transition:filter .4s, transform .5s cubic-bezier(.22,.68,0,1.2); }
        @media (hover:hover) {
          .tm-badge:not(.tm-badge--flipped):hover .tm-badge-photo img { filter:grayscale(0%); transform:scale(1.04); }
        }
        .tm-badge-photo::after { content:''; position:absolute; inset:0;
          background:linear-gradient(0deg, rgba(18,35,63,0.06) 0%, transparent 30%);
          border-top:3px solid var(--accent); }

        .tm-badge-info { padding:12px 12px 14px; text-align:center; }
        .tm-badge-role { display:block; font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.14em;
          text-transform:uppercase; color:var(--accent); font-weight:700; margin-bottom:3px; }
        .tm-badge-name { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:clamp(12px,1.1vw,14px);
          color:var(--ink); line-height:1.2; margin-bottom:4px; }
        .tm-badge-dept { font-family:'Inter',sans-serif; font-size:9.5px; color:#7a8aa8; font-weight:500; }
        .tm-badge-stamp { position:absolute; top:10px; right:10px; z-index:3;
          width:22px; height:22px; border-radius:50%; background:rgba(5,10,30,0.55); backdrop-filter:blur(4px);
          border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center;
          font-family:'JetBrains Mono',monospace; font-size:8px; font-weight:700; color:#fff; }

        .tm-back-idx { font-family:'Space Grotesk',sans-serif; font-size:11px; color:rgba(255,255,255,0.22); letter-spacing:.08em; margin-bottom:8px; }
        .tm-back-name { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; color:#fff; margin-bottom:2px; }
        .tm-back-role { font-family:'JetBrains Mono',monospace; font-size:8px; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; font-weight:700; }
        .tm-back-rule { width:20px; height:1.5px; background:var(--gold); opacity:.5; margin-bottom:10px; }
        .tm-back-desc { font-size:10.5px; line-height:1.6; color:rgba(255,255,255,0.65); font-weight:300; margin-bottom:12px; flex:1;
          display:-webkit-box; -webkit-line-clamp:5; -webkit-box-orient:vertical; overflow:hidden; }
        .tm-back-links { display:flex; flex-direction:column; gap:5px; border-top:1px solid rgba(255,255,255,0.08); padding-top:9px; }
        .tm-back-link { display:flex; align-items:center; gap:6px; font-size:8.5px; color:rgba(255,255,255,0.5); font-weight:500;
          word-break:break-all; line-height:1.3; transition:color .18s; }
        .tm-back-link:hover { color:var(--gold); }
        .tm-back-link svg { flex-shrink:0; }
        .tm-back-hint { display:block; text-align:center; font-family:'JetBrains Mono',monospace; font-size:7px;
          letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-top:10px; }

        /* ══ MISSION — mirrors About's ic-mission ══ */
        .tm-mission { background:rgba(10,20,50,0.55); backdrop-filter:blur(4px);
          border:1px solid rgba(255,255,255,0.1); border-radius:22px; padding:52px; position:relative; overflow:hidden; margin-bottom:80px; }
        .tm-mission::before { content:''; position:absolute; top:-40%; right:-10%; width:360px; height:360px;
          border-radius:50%; background:radial-gradient(circle, rgba(23,69,143,0.22) 0%, transparent 70%); pointer-events:none; }
        .tm-mission-grid { display:grid; grid-template-columns:0.9fr 1.2fr; gap:44px; align-items:center; position:relative; z-index:1; }
        @media(max-width:820px) { .tm-mission-grid { grid-template-columns:1fr; } }
        @media(max-width:820px) { .tm-mission-cadran { order:-1; } }

        .tm-mission-eyebrow { display:flex; align-items:center; gap:8px; font-family:'JetBrains Mono',monospace; font-size:11px; font-weight:700; letter-spacing:.14em;
          text-transform:uppercase; color:var(--gold); margin-bottom:16px; }
        .tm-mission-quote { font-family:'Space Grotesk',sans-serif; font-weight:700; color:#fff;
          font-size:clamp(26px,3.6vw,42px); line-height:1.1; letter-spacing:-.02em; margin-bottom:22px; }
        .tm-mission-body { font-size:14px; line-height:1.85; color:var(--txt-mute); font-weight:300; margin-bottom:14px; }
        .tm-mission-cta { display:inline-flex; align-items:center; gap:9px; background:var(--gold); color:#12233f;
          border:none; border-radius:10px; padding:13px 26px; font-family:'Space Grotesk',sans-serif;
          font-weight:700; font-size:13.5px; cursor:pointer; margin-top:8px;
          transition:transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s, background .3s; }
        .tm-mission-cta:hover { transform:translateY(-3px); background:#ffc247; box-shadow:0 14px 30px rgba(247,168,27,0.35); }
        .tm-mission-cta svg { transition:transform .3s; }
        .tm-mission-cta:hover svg { transform:translateX(4px); }

        .tm-mission-cadran { position:relative; aspect-ratio:1/1; border-radius:26px; overflow:hidden;
          box-shadow:0 24px 54px rgba(5,10,30,0.6); border:1px solid rgba(255,255,255,0.16); }
        .tm-mission-cadran img.photo { width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.05); }
        .tm-mission-cadran-shade { position:absolute; inset:0;
          background:linear-gradient(200deg, rgba(14,27,63,0.05) 0%, rgba(14,27,63,0.55) 100%); }
        .tm-gear-wrap { position:absolute; top:-24px; left:-24px; width:104px; height:104px; z-index:3;
          filter:drop-shadow(0 10px 20px rgba(5,10,30,0.55)); background:#fff; border-radius:50%; padding:6px; }
        .tm-gear-spin { width:100%; height:100%; animation:tmSpin 30s linear infinite; object-fit:contain; }
        @media(max-width:520px) {
          .tm-mission { padding:36px 24px; }
          .tm-gear-wrap { width:76px; height:76px; top:-16px; left:-16px; }
        }

        /* ══ VOICES — reviews as an auto-scrolling carousel, drag/swipe takes over instantly ══ */
        .tm-voices { margin-bottom:56px; }
        .tm-reviews { position:relative; overflow:hidden; cursor:grab; touch-action:none; padding:10px 0 6px; }
        .tm-reviews:active { cursor:grabbing; }
        .tm-rv-track { display:flex; gap:16px; width:max-content; will-change:transform; }

        .tm-rv-card { --r:0deg; flex:0 0 auto; width:272px; background:var(--card);
          border:1px solid rgba(18,35,63,0.06); border-radius:16px; padding:22px 20px; position:relative;
          transform:rotate(var(--r)); transition:transform .3s cubic-bezier(.22,.68,0,1.2), box-shadow .3s;
          box-shadow:0 12px 26px rgba(0,0,0,0.32); overflow:hidden; user-select:none; }
        .tm-rv-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:var(--accent); }
        .tm-rv-card:hover { transform:rotate(0deg) translateY(-5px); box-shadow:0 22px 44px rgba(0,0,0,0.4); }
        .tm-rv-tag { position:absolute; top:14px; right:14px; font-family:'JetBrains Mono',monospace;
          font-size:7.5px; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); font-weight:700;
          border:1px solid var(--accent); border-radius:100px; padding:3px 8px; opacity:.85; }
        .tm-rv-quote { font-family:'Space Grotesk',sans-serif; font-size:34px; line-height:.7; color:var(--accent); opacity:.35; margin-bottom:8px; }
        .tm-rv-text { font-size:12.5px; color:#3a4a68; line-height:1.7; font-style:italic; margin-bottom:16px; font-family:'Inter',sans-serif; }
        .tm-rv-divider { width:22px; height:2px; background:var(--accent); opacity:.5; margin-bottom:12px; transition:width .4s cubic-bezier(.22,.68,0,1.2); }
        .tm-rv-card:hover .tm-rv-divider { width:44px; }
        .tm-rv-author { display:flex; align-items:center; gap:10px; }
        .tm-rv-avatar { width:32px; height:32px; border-radius:50%; background:var(--accent); color:#fff;
          display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif;
          font-size:10px; font-weight:700; flex-shrink:0; }
        .tm-rv-name { font-family:'Space Grotesk',sans-serif; font-size:11.5px; font-weight:700; color:var(--ink); }
        .tm-rv-role { font-size:10px; color:#7a8aa8; margin-top:1px; }

        .tm-rv-edge { position:absolute; top:0; bottom:0; width:90px; z-index:2; pointer-events:none; }
        .tm-rv-edge--l { left:0; background:linear-gradient(to right, rgba(6,13,35,0.95), transparent); }
        .tm-rv-edge--r { right:0; background:linear-gradient(to left, rgba(6,13,35,0.95), transparent); }

        @media(max-width:600px) {
          .tm-rv-track { gap:10px; }
          .tm-rv-card { width:188px; padding:14px 13px; border-radius:12px; }
          .tm-rv-quote { font-size:26px; margin-bottom:6px; }
          .tm-rv-text { font-size:11px; margin-bottom:12px; }
          .tm-rv-avatar { width:26px; height:26px; font-size:9px; }
          .tm-rv-name { font-size:10.5px; }
          .tm-rv-role { font-size:9px; }
          .tm-rv-edge { width:32px; }
        }

        /* ══ FOOTER STRIP — same bookend as About ══ */
        .tm-footer-strip { display:flex; align-items:center; gap:10px; justify-content:center;
          font-family:'JetBrains Mono',monospace; font-size:11.5px; color:var(--txt-mute); padding:8px 0 90px; }
        .tm-footer-strip img { width:20px; height:20px; flex-shrink:0; }

        /* entrance stagger */
        .tm-e0 { opacity:0; } .tm.tv0 .tm-e0 { animation:tmRise .8s .0s cubic-bezier(.16,.8,.2,1) both; }
        .tm-e1 { opacity:0; } .tm.tv0 .tm-e1 { animation:tmRise .9s .12s cubic-bezier(.16,.8,.2,1) both; }
        .tm-e2 { opacity:0; } .tm.tv1 .tm-e2 { animation:tmRise .8s .0s cubic-bezier(.16,.8,.2,1) both; }
        .tm-e3 { opacity:0; } .tm.tv2 .tm-e3 { animation:tmRise .8s .0s cubic-bezier(.16,.8,.2,1) both; }
        .tm-e4 { opacity:0; } .tm.tv3 .tm-e4 { animation:tmRise .8s .0s cubic-bezier(.16,.8,.2,1) both; }
      `}</style>

      <section id="echipa" className={`tm${top.entered ? " tv0" : ""}${board.entered ? " tv1" : ""}${mission.entered ? " tv2" : ""}${voices.entered ? " tv3" : ""}`}>
        <div className="tm-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="tm-photo-overlay" />
        <div className="tm-continuity" />

        <div className="tm-top" ref={top.ref as React.RefObject<HTMLDivElement>}>
          <div className="wrap">
            <div className="tm-top-row tm-e0">
              <span className="tm-eyebrow">// CINE CONDUCE</span>
              <span className="tm-eyebrow-sub">Bordul 2025–2026 · Interact București Cismigiu</span>
            </div>

            <div className="tm-hero-grid">
              <div className="tm-e1">
                <h2 className="tm-headline">
                  Fețele din spatele<br />tablei de <em>anunțuri.</em>
                </h2>
                <p className="tm-lede">
                  Opt oameni, șase departamente, un singur avizier. <strong>Fiecare ecuson de mai jos</strong> se
                  întoarce — atinge-l pentru rol, contact și partea din club de care răspunde.
                </p>
              </div>
              <div className="tm-fact-cluster tm-e1">
                {FACTS.map((f, i) => (
                  <div key={i} className="tm-fact" style={{ "--r": `${f.rot}deg` } as React.CSSProperties}>
                    <div className="tm-fact-dot" />
                    <div className="tm-fact-num"><Counter target={f.value} suffix={f.suffix} /></div>
                    <div className="tm-fact-label">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="wrap">
          <div className="tm-divider-row tm-e2">
            <span className="tm-divider-label">ECHIPA · PINUITĂ PE AVIZIER</span>
            <div className="tm-divider-line" />
          </div>

          <div className="tm-board-wrap" ref={board.ref as React.RefObject<HTMLDivElement>}>
            <div className="tm-board">
              {MEMBERS.map((m, i) => <Badge key={m.id} m={m} i={i} />)}
            </div>
          </div>

          <div className="tm-mission tm-e3" ref={mission.ref as React.RefObject<HTMLDivElement>}>
            <div className="tm-mission-grid">
              <div className="tm-mission-cadran">
                <img className="photo" src="pozica.webp" alt="Bordul Interact Cismigiu în acțiune" loading="lazy" decoding="async" />
                <div className="tm-mission-cadran-shade" />
                <div className="tm-gear-wrap">
                  <img className="tm-gear-spin" src="rotary-wheel.webp" alt="Rotary International" loading="lazy" decoding="async" />
                </div>
              </div>
              <div>
                <div className="tm-mission-eyebrow">Cum a ajuns fiecare aici</div>
                <h3 className="tm-mission-quote">Niciun ecuson<br />nu a fost mereu ocupat.</h3>
                <p className="tm-mission-body">
                  Fiecare nume de pe avizier a început la fel: la primul proiect, fără rol, doar cu chef
                  de implicare. Departamentul a venit după — din prezență, nu din CV.
                </p>
                <p className="tm-mission-body">
                  Dacă vii des la proiecte și îți place o anumită parte din ce facem, e doar o
                  chestiune de timp până apare un loc liber pe tabla asta.
                </p>
                <button className="tm-mission-cta">
                  <span>Vezi cum te implici</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="tm-divider-row tm-e4">
            <span className="tm-divider-label">CE SPUN EI</span>
            <div className="tm-divider-line" />
          </div>

          <div className="tm-voices tm-e4" ref={voices.ref as React.RefObject<HTMLDivElement>}>
            <Reviews />
          </div>

          <div className="tm-footer-strip tm-e4">
            <img src="rotary-wheel.webp" alt="Rotary International" loading="lazy" decoding="async" />
            <span>Afiliat Rotary International · District 2241 România</span>
          </div>
        </div>
      </section>
    </>
  );
}