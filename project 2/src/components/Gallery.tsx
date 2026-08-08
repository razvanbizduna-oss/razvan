import React, { useState, useEffect, useRef, useCallback } from 'react';

interface GalleryProps {
  language: 'ro' | 'en';
}

/*
  Each image has a natural aspect ratio defined by `aspect`.
  The CSS columns layout stacks items naturally — no holes, no fixed row heights.
  wide  = landscape (wider card)
  tall  = portrait  (taller card)
  sq    = square-ish
*/
const ALL_IMAGES = [
  { id:  1, aspect:'wide', url:'IMG_1323.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  2, aspect:'tall', url:'IMG_1327.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  3, aspect:'sq', url:'IMG_1328.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  4, aspect:'wide', url:'IMG_1329.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  5, aspect:'sq', url:'IMG_1332.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  6, aspect:'tall', url:'IMG_1335.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  7, aspect:'wide', url:'IMG_1337.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  8, aspect:'sq', url:'IMG_1339.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  9, aspect:'sq', url:'IMG_1341.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  10, aspect:'tall', url:'IMG_1338.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  11, aspect:'wide', url:'IMG_1339.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  12, aspect:'sq', url:'IMG_1341.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  13, aspect:'sq', url:'IMG_1342.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  14, aspect:'wide', url:'IMG_1341.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  15, aspect:'sq', url:'IMG_1344.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  16, aspect:'tall', url:'IMG_1345.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  17, aspect:'sq', url:'IMG_1331.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  18, aspect:'wide', url:'IMG_1333.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  19, aspect:'sq', url:'IMG_1334.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
  { id:  20, aspect:'tall', url:'IMG_1323.webp', tag:'activities', ro:'Activități în Comunitate',  en:'Community Activities' },
];

/* Aspect ratio per type — drives padding-bottom trick for natural heights */
const ASPECT_RATIO: Record<string, string> = {
  wide: '56.25%',   /* 16:9  */
  sq:   '75%',      /* 4:3   */
  tall: '133.33%',  /* 3:4   */
};

const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP  = 8;

type Tag = 'all' | 'events' | 'team' | 'activities';

const FILTERS = [
  { id: 'all'        as Tag, ro: 'Toate',      en: 'All' },
  { id: 'events'     as Tag, ro: 'Evenimente', en: 'Events' },
  { id: 'team'       as Tag, ro: 'Echipă',     en: 'Team' },
  { id: 'activities' as Tag, ro: 'Activități', en: 'Activities' },
];

// Rotary-family tag colors instead of an unrelated blue/gold/green mix
const TAG_BG: Record<string, string> = {
  events:     'rgba(23,69,143,.82)',
  team:       'rgba(247,168,27,.85)',
  activities: 'rgba(0,103,200,.8)',
};

// Same club photos used as the tiled background across the rest of the
// site (About, TeamPage, Projects, News) — kept identical so every section
// reads as one continuous surface instead of a new backdrop per section.
const bgPhotos = ['itc.webp', 'IMG_1347.webp', 'IMG_1352.webp', 'IMG_1351.webp', 'IMG_1349.webp', 'IMG_1350.webp'];
const bgTiles = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];

const Gallery: React.FC<GalleryProps> = ({ language }) => {
  const [filter,   setFilter]   = useState<Tag>('all');
  const [visible,  setVisible]  = useState(INITIAL_VISIBLE);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [lbFading, setLbFading] = useState(false);
  const [entered,  setEntered]  = useState(false);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.04 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const filtered = filter === 'all' ? ALL_IMAGES : ALL_IMAGES.filter(i => i.tag === filter);
  const shown    = filtered.slice(0, visible);
  const hasMore  = visible < filtered.length;

  useEffect(() => { setVisible(INITIAL_VISIBLE); }, [filter]);

  const lbIdx = lightbox !== null ? filtered.findIndex(i => i.id === lightbox) : -1;

  const navigateLb = useCallback((dir: 1 | -1) => {
    if (lbFading || lbIdx < 0) return;
    setLbFading(true);
    setTimeout(() => {
      setLightbox(filtered[(lbIdx + dir + filtered.length) % filtered.length].id);
      setLbFading(false);
    }, 160);
  }, [lbFading, lbIdx, filtered]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === 'Escape')     setLightbox(null);
      if (e.key === 'ArrowRight') navigateLb(1);
      if (e.key === 'ArrowLeft')  navigateLb(-1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lightbox, navigateLb]);

  const lbImage = lightbox !== null ? filtered.find(i => i.id === lightbox) ?? null : null;
  const t = (ro: string, en: string) => language === 'ro' ? ro : en;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        .gl{
          --royal:#17458f;--azure:#0067c8;--gold:#f7a81b;--gold-l:#ffcf5c;--cranberry:#a0223d;
          --ink:#050a1e;--mute:#5c6c88;--bdr:rgba(23,69,143,.1);--bdr-s:rgba(23,69,143,.16);
        }
        .gl{font-family:'Inter',sans-serif;background:#050a1e;color:#eef3ff;
            padding:88px 0 100px;position:relative;overflow:hidden;}
        .gl *{box-sizing:border-box;margin:0;padding:0;}
        button{font-family:inherit;cursor:pointer;}

        /* ══ PHOTO BACKGROUND — same tiled club photos + navy overlay as About / TeamPage / Projects / News ══ */
        .gl-photo-bg{position:absolute;inset:0;z-index:0;display:flex;flex-wrap:wrap;overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.48);transform:scale(1.08);}
        .gl-photo-bg img{flex:1 1 260px;height:260px;object-fit:cover;display:block;}
        .gl-photo-overlay{position:absolute;inset:0;z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%);}

        .gl-wrap{max-width:1280px;margin:0 auto;padding:0 28px;position:relative;z-index:2;}

        @keyframes rise {from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.28;transform:scale(.6)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}

        .gl.vis .a0{animation:rise 1s .04s cubic-bezier(.16,.8,.2,1) both}
        .gl.vis .a1{animation:rise 1s .16s cubic-bezier(.16,.8,.2,1) both}
        .gl.vis .a2{animation:rise 1s .28s cubic-bezier(.16,.8,.2,1) both}
        .gl.vis .a3{animation:rise 1s .40s cubic-bezier(.16,.8,.2,1) both}

        /* ── HEADER ── */
        .gl-ey{display:inline-flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;
          font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#fff9e4;
          padding:6px 16px 6px 12px;border:1.5px solid rgba(250,204,21,.35);border-radius:100px;
          background:rgba(250,204,21,.12);backdrop-filter:blur(8px);}
        .gl-edot{width:7px;height:7px;border-radius:50%;
          background:linear-gradient(135deg,var(--gold),var(--gold-l));
          box-shadow:0 0 8px rgba(247,168,27,.5);animation:blink 2.4s ease-in-out infinite;}
        .gl-title{font-family:'Space Grotesk',sans-serif;font-weight:700;
          font-size:clamp(32px,4.6vw,58px);color:#fff;
          line-height:1;letter-spacing:-.02em;}
        .gl-title em{font-style:normal;color:var(--gold-l);position:relative;display:inline-block;}
        .gl-div{width:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-l));
          border-radius:3px;margin:16px auto 16px;
          transition:width 1.2s .55s cubic-bezier(.22,.68,0,1.2);}
        .gl.vis .gl-div{width:50px;}
        .gl-sub{font-size:14px;font-weight:300;color:rgba(226,236,255,.72);line-height:1.75;}

        /* ── FILTERS ── */
        .gl-filters{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:32px;}
        .gl-fp{padding:8px 18px;border-radius:100px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;
          border:1.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:rgba(226,236,255,.65);
          transition:all .32s cubic-bezier(.34,1.56,.64,1);letter-spacing:.04em;
          backdrop-filter:blur(6px);}
        .gl-fp:hover{color:#fff;border-color:rgba(247,168,27,.4);transform:translateY(-2px);}
        .gl-fp.on{background:var(--gold);color:#12233f;border-color:var(--gold);
          box-shadow:0 6px 20px rgba(247,168,27,.3);}

        /* ── MASONRY — CSS columns ── */
        .gl-masonry{column-count:3;column-gap:10px;}

        .gi{
          display:inline-block;width:100%;break-inside:avoid;margin-bottom:10px;
          position:relative;overflow:hidden;border-radius:13px;cursor:zoom-in;
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);
          animation:scaleIn .5s cubic-bezier(.16,.8,.2,1) both;
        }
        .gi-ratio{position:relative;width:100%;overflow:hidden;border-radius:13px;}
        .gi-ratio img{
          position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block;
          transition:transform .55s cubic-bezier(.22,.68,0,1.2), filter .35s;filter:saturate(1.02);
        }
        .gi:hover .gi-ratio img{transform:scale(1.065);filter:saturate(1.12);}

        .gi-ov{
          position:absolute;inset:0;border-radius:13px;
          background:linear-gradient(to top,rgba(5,10,30,.9) 0%,rgba(5,10,30,.18) 55%,transparent 100%);
          opacity:0;transition:opacity .28s;display:flex;align-items:flex-end;padding:14px 13px;
        }
        .gi:hover .gi-ov{opacity:1;}
        .gi-ov-row{width:100%;display:flex;align-items:flex-end;justify-content:space-between;gap:8px;}
        .gi-ov-title{font-family:'Inter',sans-serif;font-size:11.5px;font-weight:600;color:#fff;line-height:1.32;flex:1;}
        .gi-ov-icon{
          width:28px;height:28px;border-radius:8px;flex-shrink:0;
          background:var(--gold);color:#12233f;
          display:flex;align-items:center;justify-content:center;font-size:12px;
          transition:transform .28s cubic-bezier(.34,1.56,.64,1);}
        .gi:hover .gi-ov-icon{transform:scale(1.12) rotate(6deg);}

        .gi-tag{
          position:absolute;top:10px;left:10px;font-family:'JetBrains Mono',monospace;
          font-size:7px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;
          padding:3px 8px;border-radius:4px;color:#fff;
          backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,.18);
          opacity:0;transition:opacity .28s;pointer-events:none;}
        .gi:hover .gi-tag{opacity:1;}

        /* ── LOAD MORE ── */
        .gl-more-wrap{display:flex;flex-direction:column;align-items:center;gap:12px;margin-top:32px;}
        .gl-count{font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(226,236,255,.55);font-weight:500;letter-spacing:.04em;}
        .gl-count strong{color:#fff;}
        .gl-more{
          display:inline-flex;align-items:center;gap:9px;
          padding:12px 30px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;
          border:none;background:var(--gold);color:#12233f;
          letter-spacing:.03em;box-shadow:0 8px 22px rgba(247,168,27,.28);
          transition:all .35s cubic-bezier(.34,1.56,.64,1);}
        .gl-more:hover{background:var(--gold-l);transform:translateY(-3px) scale(1.03);box-shadow:0 14px 32px rgba(247,168,27,.4);}
        .gl-more:active{transform:scale(.97);}
        .gl-arr{display:inline-flex;width:20px;height:20px;border-radius:5px;
          background:rgba(18,35,63,.15);color:#12233f;
          align-items:center;justify-content:center;font-size:11px;
          transition:transform .32s cubic-bezier(.34,1.56,.64,1);}
        .gl-more:hover .gl-arr{transform:translateY(3px);}
        .gl-done{display:flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(226,236,255,.5);font-weight:500;letter-spacing:.04em;}
        .gl-done::before,.gl-done::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.12);}

        /* ── LIGHTBOX ── */
        .lb{position:fixed;inset:0;z-index:9999;
          background:rgba(4,8,24,.96);backdrop-filter:blur(22px);
          display:flex;align-items:center;justify-content:center;padding:20px;
          animation:fadeIn .22s ease;}
        .lb-img{max-width:min(92vw,1100px);max-height:88vh;border-radius:13px;display:block;object-fit:contain;
          box-shadow:0 48px 100px rgba(0,0,0,.58);transition:opacity .16s ease;}
        .lb-img.fade{opacity:0;}
        .lb-close{position:fixed;top:18px;right:18px;z-index:10001;width:42px;height:42px;border-radius:11px;
          background:rgba(255,255,255,.11);backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.18);color:#fff;font-size:18px;
          display:flex;align-items:center;justify-content:center;transition:all .24s;}
        .lb-close:hover{background:var(--gold);color:#12233f;transform:rotate(90deg);}
        .lb-nav{position:fixed;top:50%;transform:translateY(-50%);z-index:10001;width:46px;height:46px;border-radius:12px;
          background:rgba(255,255,255,.09);backdrop-filter:blur(6px);border:1.5px solid rgba(255,255,255,.16);color:#fff;font-size:20px;
          display:flex;align-items:center;justify-content:center;transition:all .28s cubic-bezier(.34,1.56,.64,1);}
        .lb-nav:hover{background:var(--gold);border-color:var(--gold);color:#12233f;}
        .lb-nav.p{left:14px;} .lb-nav.n{right:14px;}
        .lb-ctr{position:fixed;top:20px;left:50%;transform:translateX(-50%);
          font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:rgba(255,255,255,.55);letter-spacing:.08em;
          background:rgba(8,16,42,.5);padding:5px 14px;border-radius:100px;backdrop-filter:blur(6px);border:1px solid rgba(255,255,255,.1);}
        .lb-cap{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);
          font-family:'Space Grotesk',sans-serif;font-size:14px;color:rgba(255,255,255,.8);
          background:rgba(8,16,42,.58);backdrop-filter:blur(6px);padding:7px 20px;border-radius:100px;
          border:1px solid rgba(255,255,255,.12);white-space:nowrap;max-width:88vw;overflow:hidden;text-overflow:ellipsis;}

        /* ── RESPONSIVE ── */
        @media(max-width:1024px){.gl-masonry{column-count:3;}}
        @media(max-width:700px){
          .gl-masonry{column-count:2;column-gap:7px;}
          .gi{margin-bottom:7px;}
          .gl-wrap{padding:0 14px;}
          .gl{padding:64px 0 76px;}
          .lb-nav.p{left:6px;} .lb-nav.n{right:6px;}
          .lb-cap{display:none;}
        }
        @media(max-width:420px){.gl-masonry{column-count:2;}}
      `}</style>

      <section className={`gl${entered ? ' vis' : ''}`} ref={sectionRef} id="gallery">
        <div className="gl-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="gl-photo-overlay" />

        <div className="gl-wrap">

          {/* HEADER */}
          <header style={{ textAlign:'center', marginBottom:36 }}>
            <div className="a0" style={{ marginBottom:16 }}>
              <div className="gl-ey">
                <span className="gl-edot" />
                {t('Album fotografic','Photo Album')}
              </div>
            </div>
            <div className="a1">
              <h2 className="gl-title">
                {t('Galeria Noastră','Our Gallery')} <em>{t('de Momente','of Moments')}</em>
              </h2>
            </div>
            <div className="a2"><div className="gl-div" /></div>
            <div className="a2">
              <p className="gl-sub">
                {t(
                  'Explorează clipe speciale din viața clubului — evenimente, echipă și acțiuni în comunitate.',
                  'Explore special moments from club life — events, team and community actions.',
                )}
              </p>
            </div>
          </header>

          {/* FILTERS */}
          <div className="gl-filters a3">
            {FILTERS.map(f => (
              <button
                key={f.id}
                className={`gl-fp${filter === f.id ? ' on' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {language === 'ro' ? f.ro : f.en}
              </button>
            ))}
          </div>

          {/* MASONRY */}
          <div className="gl-masonry a3">
            {shown.map((img, idx) => (
              <div
                key={img.id}
                className="gi"
                style={{ animationDelay:`${0.04 + (idx % INITIAL_VISIBLE) * 0.04}s` }}
                onClick={() => setLightbox(img.id)}
              >
                <div className="gi-ratio" style={{ paddingBottom: ASPECT_RATIO[img.aspect] }}>
                  <img src={img.url} alt={language === 'ro' ? img.ro : img.en} loading="lazy" />
                </div>

                <div className="gi-tag" style={{ background: TAG_BG[img.tag] }}>
                  {language === 'ro'
                    ? FILTERS.find(f => f.id === img.tag)?.ro
                    : FILTERS.find(f => f.id === img.tag)?.en}
                </div>

                <div className="gi-ov">
                  <div className="gi-ov-row">
                    <span className="gi-ov-title">{language === 'ro' ? img.ro : img.en}</span>
                    <span className="gi-ov-icon">⤢</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* LOAD MORE */}
          <div className="gl-more-wrap a3" style={{ animationDelay:'0.55s' }}>
            <p className="gl-count">
              {t('Se afișează','Showing')} <strong>{shown.length}</strong> {t('din','of')} <strong>{filtered.length}</strong> {t('fotografii','photos')}
            </p>
            {hasMore ? (
              <button
                className="gl-more"
                onClick={() => setVisible(v => Math.min(v + LOAD_MORE_STEP, filtered.length))}
              >
                {t('Vezi mai multe fotografii','Load more photos')}
                <span className="gl-arr">↓</span>
              </button>
            ) : (
              <div className="gl-done">
                {t('Toate fotografiile sunt afișate','All photos displayed')}
              </div>
            )}
          </div>

        </div>

        {/* LIGHTBOX */}
        {lightbox !== null && lbImage && (
          <div className="lb" onClick={() => setLightbox(null)}>
            <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
            <button className="lb-nav p" onClick={e => { e.stopPropagation(); navigateLb(-1); }}>←</button>
            <img
              src={lbImage.url}
              alt={language === 'ro' ? lbImage.ro : lbImage.en}
              className={`lb-img${lbFading ? ' fade' : ''}`}
              onClick={e => e.stopPropagation()}
              loading="eager"
            />
            <button className="lb-nav n" onClick={e => { e.stopPropagation(); navigateLb(1); }}>→</button>
            <div className="lb-ctr">{lbIdx + 1} / {filtered.length}</div>
            <div className="lb-cap">{language === 'ro' ? lbImage.ro : lbImage.en}</div>
          </div>
        )}
      </section>
    </>
  );
};

export default Gallery;