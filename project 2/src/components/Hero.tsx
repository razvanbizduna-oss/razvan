import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface HeroProps {
  language: 'ro' | 'en';
}

const Hero: React.FC<HeroProps> = ({ language }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const content = {
    ro: {
      eyebrow: 'Interact București Cismigiu',
      title: 'Suntem tineri.',
      titleAccent: 'Facem lucruri mari.',
      description:
        'Club de voluntariat condus integral de elevi sub 19 ani, afiliat Rotary International — Sectorul 5, București.',
      stats: [
        { v: '2015', l: 'Fondat' },
        { v: 'S5', l: 'București' },
        { v: '2241', l: 'District Rotary' },
      ],
      cta: 'Vezi Cine Suntem',
      ctaSecondary: 'Găsește-ne pe Hartă',
    },
    en: {
      eyebrow: 'Interact Bucharest Cismigiu',
      title: "We're young.",
      titleAccent: 'We do big things.',
      description:
        'A volunteer club run entirely by students under 19, affiliated with Rotary International — Sector 5, Bucharest.',
      stats: [
        { v: '2015', l: 'Founded' },
        { v: 'S5', l: 'Bucharest' },
        { v: '2241', l: 'Rotary District' },
      ],
      cta: 'See Who We Are',
      ctaSecondary: 'Find Us on Map',
    },
  };

  const text = content[language];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');

        /* FIX: variabilele CSS sunt acum definite direct pe .hr-root,
           care este clasa aplicată efectiv pe <section>. Anterior erau
           definite pe .hr, o clasă care nu exista nicăieri în JSX,
           deci var(--gold) etc. nu se rezolvau niciodată. */
        .hr-root {
          --navy:#060c22; --navy-2:#0c1a3a; --royal:#1c4f9c; --azure:#3d8bdb; --gold:#e8a13a; --paper:#f7f4ea;
          font-family:'Inter',sans-serif;
        }

        @keyframes hrRise { 0%{opacity:0; transform:translateY(20px)} 100%{opacity:1; transform:translateY(0)} }
        @keyframes hrSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .hr-rise { animation:hrRise .8s ease-out forwards; opacity:0; }
        .hr-d1 { animation-delay:.1s; } .hr-d2 { animation-delay:.24s; }
        .hr-d3 { animation-delay:.38s; } .hr-d4 { animation-delay:.52s; } .hr-d5 { animation-delay:.66s; }

        /* signature element: the Interact gear, slowly turning behind the scene */
        .hr-gear-mark {
          position:absolute; top:50%; right:-8%; width:min(52vw,560px); height:min(52vw,560px);
          transform:translateY(-50%); pointer-events:none; user-select:none;
          filter:grayscale(1) brightness(2.4) contrast(0.9); opacity:0.09;
          animation:hrSpin 90s linear infinite; z-index:1;
        }

        .hr-eyebrow { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; letter-spacing:.12em;
          color:var(--gold); text-transform:uppercase; display:inline-flex; align-items:center; gap:10px; }
        .hr-eyebrow:before { content:''; display:inline-block; width:26px; height:1.5px; background:var(--gold); }

        .hr-headline { font-family:'Space Grotesk',sans-serif; font-weight:700; color:#fff;
          line-height:1.04; letter-spacing:-.02em; font-size:clamp(2.3rem,6.4vw,4.6rem); }
        .hr-headline .accent { position:relative; display:inline-block; color:#fff; }
        .hr-headline .accent::after {
          content:''; position:absolute; left:2px; right:2px; bottom:-6px; height:2px; border-radius:2px;
          background:#fff;
        }

        .hr-desc { font-family:'Inter',sans-serif; font-weight:300; font-size:clamp(15px,1.5vw,17.5px);
          color:rgba(226,236,255,0.82); max-width:500px; line-height:1.7; }

        .hr-stat-bar { display:flex; align-items:stretch; gap:0; border-top:1px solid rgba(255,255,255,0.16);
          border-bottom:1px solid rgba(255,255,255,0.16); width:fit-content; }
        .hr-stat { padding:14px 26px 14px 0; margin-right:26px; border-right:1px solid rgba(255,255,255,0.16); }
        .hr-stat:last-child { border-right:none; padding-right:0; margin-right:0; }
        .hr-stat-v { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:20px; color:#fff; line-height:1.3; }
        .hr-stat-l { font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:.09em; text-transform:uppercase; color:#9fb0d4; margin-top:2px; }

        .hr-cta-row { display:flex; gap:14px; flex-wrap:wrap; align-items:center; }
        .hr-cta-primary { display:inline-flex; align-items:center; gap:9px;
          background:linear-gradient(135deg, var(--azure), var(--royal)); color:#fff;
          border:none; border-radius:10px; padding:13px 26px; font-family:'Space Grotesk',sans-serif;
          font-weight:600; font-size:13.5px; cursor:pointer;
          transition:transform .35s cubic-bezier(.34,1.56,.64,1), box-shadow .35s; }
        .hr-cta-primary:hover { transform:translateY(-3px); box-shadow:0 14px 30px rgba(61,139,219,0.35); }

        .hr-cta-secondary { display:inline-flex; align-items:center; gap:8px; color:#fff; font-family:'Space Grotesk',sans-serif;
          font-weight:600; font-size:13px; background:transparent; border:1.5px solid rgba(255,255,255,0.28);
          border-radius:10px; padding:12px 20px; cursor:pointer; transition:border-color .3s, background .3s; }
        .hr-cta-secondary:hover { border-color:rgba(61,139,219,0.6); background:rgba(255,255,255,0.06); }

        @media (max-width:640px) {
          .hr-stat-bar { flex-wrap:wrap; row-gap:10px; }
          .hr-gear-mark { opacity:0.06; }
        }
      `}</style>

      <section
        id="home"
        className="hr-root relative min-h-screen flex items-center overflow-hidden bg-[#060c22]"
      >
        {/* Background photo — now actually visible */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(itc.webp)', filter: 'brightness(0.55) saturate(1.05)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(6,12,34,0.82) 0%, rgba(6,12,34,0.5) 45%, rgba(6,12,34,0.3) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(6,12,34,0.9) 0%, transparent 35%)' }} />

        {/* Signature element: the club's own gear mark, engraved and slowly turning */}
        <img src="rotary-wheel.webp" alt="" aria-hidden="true" className="hr-gear-mark" />

        {/* Main content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-24 pb-28">
          <div className="hr-rise hr-d1" style={{ marginBottom: 22 }}>
            <span className="hr-eyebrow">{text.eyebrow}</span>
          </div>

          <h1 className="hr-rise hr-d2 hr-headline" style={{ marginBottom: 26 }}>
            {text.title}<br />
            <span className="accent">{text.titleAccent}</span>
          </h1>

          <p className="hr-rise hr-d3 hr-desc" style={{ marginBottom: 30 }}>
            {text.description}
          </p>

          <div className="hr-rise hr-d4 hr-stat-bar" style={{ marginBottom: 36 }}>
            {text.stats.map((s, i) => (
              <div key={i} className="hr-stat">
                <div className="hr-stat-v">{s.v}</div>
                <div className="hr-stat-l">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="hr-rise hr-d5 hr-cta-row">
            <button className="hr-cta-primary" onClick={() => document.getElementById('despre')?.scrollIntoView({ behavior: 'smooth' })}>
              <span>{text.cta}</span>
            </button>
            <button className="hr-cta-secondary" onClick={() => window.open('https://maps.google.com', '_blank')}>
              <MapPin style={{ width: 15, height: 15 }} />
              <span>{text.ctaSecondary}</span>
            </button>
          </div>
        </div>

        {/* Bottom shade — continues into the next section */}
        <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none bg-gradient-to-t from-[#060c22] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-[#060c22]" />
      </section>
    </>
  );
};

export default Hero;