import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, Users, Heart, Globe, Award, Calendar, MapPin, HandHeart, Sparkles, BookOpen } from 'lucide-react';

// Same club photos used as the tiled background across the rest of the
// site (About, TeamPage, Projects, News, Gallery) — kept identical so every
// section reads as one continuous surface instead of a new backdrop per section.
const bgPhotos = ['itc.webp', 'IMG_1347.webp', 'IMG_1352.webp', 'IMG_1351.webp', 'IMG_1349.webp', 'IMG_1350.webp'];
const bgTiles = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];

const FAQ = ({ language = 'ro' }: { language?: 'ro' | 'en' }) => {
  const [current, setCurrent]       = useState(0);
  const [next, setNext]             = useState<number | null>(null);
  const [phase, setPhase]           = useState<'idle' | 'out' | 'in'>('idle');
  const [dir, setDir]               = useState<'next' | 'prev'>('next');
  const [entered, setEntered]       = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const secRef   = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.04 });
    if (secRef.current) obs.observe(secRef.current);
    return () => obs.disconnect();
  }, []);

  const content = {
    ro: {
      eyebrow: 'Interact București Cismigiu',
      title: 'Întrebări',
      titleAccent: 'Frecvente',
      subtitle: 'Tot ce trebuie să știi despre noi — misiune, voluntariat, proiecte și cum poți face parte din echipa noastră.',
      faqs: [
        { icon: HelpCircle, question: 'Ce este Interact București Cismigiu?', answer: 'Interact București Cismigiu este un club de voluntariat pentru tineri cu vârste între 14 și 18 ani, afiliat Rotary International prin Rotary Club București Cismigiu. Facem parte din rețeaua globală Interact — cea mai mare organizație de tineret a Rotary. Misiunea noastră este să promovăm valorile solidarității, empatiei și serviciului comunitar în rândul tinerilor din Sectorul 5 și din București.' },
        { icon: Users, question: 'Cine poate deveni voluntar în clubul nostru?', answer: 'Orice tânăr cu vârsta cuprinsă între 14 și 18 ani, cu spirit civic și dorință de implicare, poate deveni voluntar. Nu sunt necesare experiență anterioară sau abilități speciale — ne dorim tineri curioși, empatici și dornici să facă diferența. Procesul de aderare constă într-o scurtă întâlnire de cunoaștere cu echipa noastră, urmată de o perioadă de probă de o lună în cadrul unui proiect activ.' },
        { icon: Heart, question: 'Ce tipuri de proiecte derulați?', answer: 'Proiectele noastre acoperă patru domenii principale: ecologie urbană (curățenie în Parcul Cișmigiu, plantare de copaci), social (colecte de alimente, vizite la căminele de bătrâni), educație (ateliere pentru copii, mentorat) și cultural (Ziua Europei, festivaluri interculturale). În fiecare an lansăm minimum 6 proiecte active și suntem mereu deschiși la idei noi din partea membrilor.' },
        { icon: Calendar, question: 'Cât timp trebuie să aloc voluntariatului?', answer: 'Implicarea minimă recomandată este de aproximativ 4–6 ore pe lună, distribuite în întâlniri de club și activități de teren. Totuși, fiecare voluntar decide singur cât timp dorește să aloce — flexibilitatea este una dintre valorile noastre. Membrii cu implicare mai intensă pot prelua roluri de coordonator de proiect sau reprezenta clubul în cadrul evenimentelor Rotary District.' },
        { icon: Globe, question: 'Care este legătura cu Rotary International?', answer: 'Interact este programul oficial de tineret al Rotary International, prezent în peste 140 de țări și cu peste 300.000 de membri tineri la nivel mondial. Clubul nostru este sponsorizat de Rotary Club București Cismigiu și face parte din Rotary District 2241 România. Această afiliere ne oferă acces la proiecte internaționale, schimburi de tineri și resurse educaționale din rețeaua globală Rotary.' },
        { icon: Award, question: 'Ce beneficii aduce voluntariatul în Interact?', answer: 'Pe lângă satisfacția de a ajuta comunitatea, membrii noștri dobândesc abilități valoroase de leadership, comunicare, management de proiect și lucru în echipă. Primești certificat oficial de voluntariat recunoscut la nivel național, scrisori de recomandare pentru admiterea la facultate, oportunități de networking cu lideri din comunitatea de afaceri și acces la programe de formare și conferințe Rotary.' },
        { icon: MapPin, question: 'Unde se desfășoară activitățile clubului?', answer: 'Activitățile noastre au loc în principal în Sectorul 5 al Bucureștiului și în Parcul Cișmigiu, care ne-a dat și numele. Întâlnirile generale ale clubului se organizează săptămânal, de regulă miercuri seara, într-un spațiu pus la dispoziție de partenerii noștri. Proiectele de teren au loc în parcuri, școli, cămine de bătrâni și spații publice din București, în funcție de activitatea desfășurată.' },
        { icon: HandHeart, question: 'Cum pot sprijini clubul dacă nu am vârsta potrivită?', answer: 'Există mai multe modalități de a sprijini Interact București Cismigiu: donații în bunuri (alimente, îmbrăcăminte, rechizite) sau financiare, parteneriate comerciale pentru proiectele noastre, mentorat voluntar pentru membrii clubului, sau participarea ca invitat special la evenimentele noastre. Companiile interesate de responsabilitate socială sunt binevenite să ne contacteze la contact@interactcismigiu.ro.' },
        { icon: Sparkles, question: 'Ce înseamnă să fii membru activ față de voluntar ocazional?', answer: 'Membrii activi participă regulat la ședințele clubului, sunt implicați în cel puțin un proiect curent și contribuie la luarea deciziilor în club. Voluntarii ocazionali participă la acțiuni punctuale fără a-și asuma un angajament pe termen lung. Ambele forme de implicare sunt valorizate — diferența apare în nivelul de responsabilitate și în oportunitățile de dezvoltare personală disponibile.' },
        { icon: BookOpen, question: 'Cum mă pot înscrie sau afla mai multe informații?', answer: 'Ne poți contacta direct prin formularul de pe această pagină, prin email la contact@interactcismigiu.ro sau prin paginile noastre de social media (Instagram și Facebook: @InteractCismigiu). De asemenea, poți veni la una dintre întâlnirile noastre publice lunare — datele sunt anunțate pe rețelele sociale. Răspundem tuturor mesajelor în maximum 24 de ore lucrătoare.' },
      ],
    },
    en: {
      eyebrow: 'Interact București Cismigiu',
      title: 'Frequently',
      titleAccent: 'Asked Questions',
      subtitle: 'Everything you need to know about us — our mission, volunteering, projects and how you can join our team.',
      faqs: [
        { icon: HelpCircle, question: 'What is Interact București Cismigiu?', answer: "Interact București Cismigiu is a volunteering club for young people aged 14–18, affiliated with Rotary International through Rotary Club București Cismigiu. We are part of the global Interact network — Rotary's largest youth organisation. Our mission is to promote the values of solidarity, empathy and community service among young people in Sector 5 and across Bucharest." },
        { icon: Users, question: 'Who can become a volunteer in our club?', answer: 'Any young person aged 14 to 18 with civic spirit and a desire to get involved can become a volunteer. No previous experience or special skills are required — we are looking for curious, empathetic young people who want to make a difference. The joining process consists of a brief meet-and-greet with our team, followed by a one-month trial period working on an active project.' },
        { icon: Heart, question: 'What types of projects do you run?', answer: "Our projects cover four main areas: urban ecology (Cișmigiu Park clean-ups, tree planting), social (food drives, care home visits), education (children's workshops, mentoring) and cultural (Europe Day, intercultural festivals). Each year we launch at least 6 active projects and we are always open to new ideas from our members." },
        { icon: Calendar, question: 'How much time do I need to commit to volunteering?', answer: 'The recommended minimum commitment is around 4–6 hours per month, split between club meetings and field activities. However, each volunteer decides how much time they wish to give — flexibility is one of our values. Members with greater involvement can take on project coordinator roles or represent the club at Rotary District events.' },
        { icon: Globe, question: 'What is the connection with Rotary International?', answer: 'Interact is the official youth programme of Rotary International, present in over 140 countries with more than 300,000 young members worldwide. Our club is sponsored by Rotary Club București Cismigiu and is part of Rotary District 2241 Romania. This affiliation gives us access to international projects, youth exchanges and educational resources from the global Rotary network.' },
        { icon: Award, question: 'What are the benefits of volunteering with Interact?', answer: 'Beyond the satisfaction of helping the community, our members gain valuable skills in leadership, communication, project management and teamwork. You receive an official volunteering certificate recognised nationally, recommendation letters for university admission, networking opportunities with business community leaders, and access to Rotary training programmes and conferences.' },
        { icon: MapPin, question: 'Where do club activities take place?', answer: 'Our activities take place mainly in Sector 5 of Bucharest and in Cișmigiu Park, which gave us our name. General club meetings are held weekly, usually on Wednesday evenings, in a space provided by our partners. Field projects take place in parks, schools, care homes and public spaces across Bucharest, depending on the activity.' },
        { icon: HandHeart, question: "How can I support the club if I'm not the right age?", answer: 'There are several ways to support Interact București Cismigiu: donations in goods (food, clothing, school supplies) or financial contributions, commercial partnerships for our projects, voluntary mentoring for club members, or participating as a special guest at our events. Companies interested in corporate social responsibility are welcome to contact us at contact@interactcismigiu.ro.' },
        { icon: Sparkles, question: 'What is the difference between an active member and an occasional volunteer?', answer: 'Active members attend club meetings regularly, are involved in at least one current project and contribute to club decision-making. Occasional volunteers participate in specific one-off actions without a long-term commitment. Both forms of involvement are valued — the difference lies in the level of responsibility and personal development opportunities available.' },
        { icon: BookOpen, question: 'How can I sign up or find out more?', answer: 'You can contact us directly through the form on this page, by email at contact@interactcismigiu.ro or through our social media pages (Instagram and Facebook: @InteractCismigiu). You can also come to one of our monthly public meetings — dates are announced on social media. We reply to all messages within 24 business hours.' },
      ],
    },
  };

  const t = content[language];
  const total = t.faqs.length;

  const go = useCallback((d: 'next' | 'prev', target?: number) => {
    if (phase !== 'idle') return;
    const nextIdx = target !== undefined
      ? target
      : d === 'next' ? (current + 1) % total : (current - 1 + total) % total;
    if (nextIdx === current) return;
    setDir(d);
    setNext(nextIdx);
    setPhase('out');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(nextIdx);
      setNext(null);
      setPhase('in');
      timerRef.current = setTimeout(() => setPhase('idle'), 220);
    }, 140);
  }, [phase, current, total]);

  const jumpTo = useCallback((i: number) => {
    go(i > current ? 'next' : 'prev', i);
  }, [go, current]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go('next');
      if (e.key === 'ArrowLeft')  go('prev');
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const faq = t.faqs[current];
  const FaqIcon = faq.icon;
  const progressPct = ((current + 1) / total) * 100;

  const outX   = dir === 'next' ? '-28px' : '28px';
  const inX    = dir === 'next' ? '28px'  : '-28px';
  const innerStyle: React.CSSProperties =
    phase === 'out' ? { opacity: 0, transform: `translateX(${outX}) scale(0.985)`, transition: 'opacity 120ms ease-in, transform 120ms ease-in' }
    : phase === 'in'  ? { opacity: 0, transform: `translateX(${inX})  scale(0.985)`, transition: 'none' }
    : { opacity: 1, transform: 'translateX(0) scale(1)', transition: 'opacity 120ms ease-out, transform 120ms cubic-bezier(.22,.68,0,1.2)' };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        .fq{
          --royal:#17458f;--azure:#0067c8;--gold:#f7a81b;--gold-l:#ffcf5c;--cranberry:#a0223d;
          --ink:#f2f5ff;--mute:#b7c3e4;
          --bdr:rgba(255,255,255,0.12);--bdr-s:rgba(255,255,255,0.2);
        }
        .fq{font-family:'Inter',sans-serif;color:#eef3ff;background:#050a1e;
            padding:88px 0 112px;position:relative;overflow:hidden;}
        .fq *{box-sizing:border-box;margin:0;padding:0;}
        button{font-family:inherit;cursor:pointer;}

        /* ══ PHOTO BACKGROUND — same tiled club photos + navy overlay as the rest of the site ══ */
        .fq-photo-bg{position:absolute;inset:0;z-index:0;display:flex;flex-wrap:wrap;overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.48);transform:scale(1.08);}
        .fq-photo-bg img{flex:1 1 260px;height:260px;object-fit:cover;display:block;}
        .fq-photo-overlay{position:absolute;inset:0;z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%);}

        .fq .wrap{max-width:760px;margin:0 auto;padding:0 28px;position:relative;z-index:2;}

        @keyframes fqRise{from{opacity:0;transform:translateY(34px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fqBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
        @keyframes fqShimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes fqGldPls{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 28px 4px rgba(247,168,27,.28)}}

        .fq.vis .e0{animation:fqRise 1.1s .05s cubic-bezier(.16,.8,.2,1) both}
        .fq.vis .e1{animation:fqRise 1.1s .20s cubic-bezier(.16,.8,.2,1) both}
        .fq.vis .e2{animation:fqRise 1.1s .35s cubic-bezier(.16,.8,.2,1) both}
        .fq.vis .e3{animation:fqRise 1.1s .50s cubic-bezier(.16,.8,.2,1) both}
        .fq.vis .e4{animation:fqRise 1.1s .65s cubic-bezier(.16,.8,.2,1) both}

        /* ── HEADER ── */
        .fq .fq-eyebrow{
          display:inline-flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;
          font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#fff9e4;
          padding:6px 16px 6px 12px;border:1.5px solid rgba(250,204,21,.35);border-radius:100px;
          background:rgba(250,204,21,.12);backdrop-filter:blur(8px);}
        .fq .fq-edot{
          width:7px;height:7px;border-radius:50%;
          background:linear-gradient(135deg,var(--gold),var(--gold-l));
          box-shadow:0 0 8px rgba(247,168,27,.5);animation:fqBlink 2.4s ease-in-out infinite;}
        .fq .fq-title{
          font-family:'Space Grotesk',sans-serif;font-weight:700;
          font-size:clamp(32px,4.6vw,58px);color:#fff;
          line-height:1;letter-spacing:-.02em;}
        .fq .fq-title em{font-style:normal;color:var(--gold-l);position:relative;display:inline-block;}
        .fq .fq-title em::after{
          content:'';position:absolute;bottom:-2px;left:2px;right:2px;height:2px;border-radius:2px;
          background:linear-gradient(90deg,transparent,rgba(247,168,27,.7) 25%,rgba(247,168,27,.7) 75%,transparent);
          transform:scaleX(0);transform-origin:left;
          transition:transform 1.4s .8s cubic-bezier(.22,.68,0,1.2);}
        .fq.vis .fq-title em::after{transform:scaleX(1);}
        .fq .fq-divider{
          width:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-l));
          border-radius:3px;margin:0 auto;
          transition:width 1.3s .6s cubic-bezier(.22,.68,0,1.2);}
        .fq.vis .fq-divider{width:56px;}
        .fq .fq-sub{font-size:14.5px;font-weight:300;color:rgba(226,236,255,.72);line-height:1.75;}

        /* ── PROGRESS ── */
        .fq-prog-track{height:3px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-bottom:24px;}
        .fq-prog-bar{
          height:100%;border-radius:3px;
          background:linear-gradient(90deg,var(--royal),var(--azure),var(--gold-l));
          transition:width .55s cubic-bezier(.22,.68,0,1.2);}

        /* ── NAV ROW ── */
        .fq-nav-row{display:flex;align-items:center;gap:12px;margin-bottom:18px;}
        .fq-nav-btn{
          width:40px;height:40px;border-radius:11px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          border:1.5px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);cursor:pointer;
          transition:all .4s cubic-bezier(.34,1.56,.64,1);
          backdrop-filter:blur(6px);}
        .fq-nav-btn:hover{background:var(--gold);border-color:var(--gold);color:#12233f;
          transform:scale(1.08);box-shadow:0 6px 18px rgba(247,168,27,.3);}
        .fq-nav-btn:hover svg{color:#12233f !important;}
        .fq-nav-btn:active{transform:scale(.94);}

        .fq-dots{display:flex;align-items:center;gap:5px;flex:1;justify-content:center;}
        .fq-dot{border-radius:100px;cursor:pointer;border:none;padding:0;
          transition:all .45s cubic-bezier(.34,1.56,.64,1);}
        .fq-dot.active{width:24px;height:7px;background:linear-gradient(90deg,var(--royal),var(--azure));}
        .fq-dot:not(.active){width:7px;height:7px;background:rgba(255,255,255,.18);}
        .fq-dot:not(.active):hover{background:rgba(247,168,27,.5);transform:scale(1.2);}

        .fq-counter{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:rgba(226,236,255,.55);letter-spacing:.08em;white-space:nowrap;}
        .fq-counter strong{color:#fff;font-size:13px;}

        /* ── CARD — smoky frosted glass, tuned to sit on the dark tiled photo backdrop ── */
        .fq-card{
          background:
            linear-gradient(160deg, rgba(30,48,92,0.5) 0%, rgba(13,22,48,0.62) 55%, rgba(8,14,32,0.7) 100%);
          backdrop-filter:blur(26px) saturate(140%);
          -webkit-backdrop-filter:blur(26px) saturate(140%);
          border:1px solid var(--bdr);border-radius:22px;
          padding:36px 36px 32px;position:relative;
          overflow:hidden; /* clips the top accent bar & shimmer so they never poke out past the rounded corners */
          box-shadow:0 24px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07), inset 0 0 40px rgba(23,69,143,.12);
          min-height:260px;}
        .fq-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--royal),var(--azure) 60%,var(--gold-l));}
        .fq-card::after{
          content:'';position:absolute;top:0;left:-100%;right:-100%;height:3px;
          background:linear-gradient(90deg,transparent,rgba(247,168,27,.7),transparent);
          background-size:200% auto;animation:fqShimmer 5s linear infinite;}

        .fq-inner{will-change:opacity,transform;}

        .fq-q-row{display:flex;align-items:flex-start;gap:16px;margin-bottom:20px;}
        .fq-icon{
          width:48px;height:48px;border-radius:13px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          background:linear-gradient(135deg,var(--royal),var(--azure));
          box-shadow:0 6px 18px rgba(0,103,200,.35);}
        .fq-q{
          font-family:'Space Grotesk',sans-serif;
          font-size:clamp(1rem,2.2vw,1.28rem);font-weight:700;color:var(--ink);
          line-height:1.3;padding-top:8px;}
        .fq-a{
          font-size:13.5px;font-weight:300;color:var(--mute);line-height:1.86;
          padding-left:64px;position:relative;}
        .fq-a::before{
          content:'';position:absolute;left:22px;top:4px;bottom:4px;width:3px;
          background:linear-gradient(180deg,rgba(247,168,27,.55),rgba(247,168,27,.15));
          border-radius:2px;}

        /* ── HINT ── */
        .fq-hint{
          display:flex;align-items:center;justify-content:center;gap:6px;
          margin-top:14px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;
          color:rgba(226,236,255,.5);letter-spacing:.05em;}
        .fq-key{
          display:inline-flex;align-items:center;justify-content:center;
          width:22px;height:18px;border-radius:5px;
          border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);
          font-size:9px;font-weight:700;color:rgba(226,236,255,.6);
          backdrop-filter:blur(4px);}

        /* ── CTA — same smoky glass surface as the card, so the two feel like one family ── */
        .fq-cta{
          margin-top:28px;border-radius:16px;overflow:hidden;position:relative;
          background:linear-gradient(150deg, rgba(28,45,88,0.55) 0%, rgba(14,24,54,0.65) 55%, rgba(8,14,32,0.72) 100%);
          backdrop-filter:blur(24px) saturate(140%);
          -webkit-backdrop-filter:blur(24px) saturate(140%);
          border:1px solid var(--bdr);padding:26px 30px;
          box-shadow:0 16px 40px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06);}
        .fq-cta::before{
          content:'';position:absolute;top:0;left:-100%;right:-100%;height:1.5px;
          background:linear-gradient(90deg,transparent,rgba(232,184,32,0.65),rgba(255,229,90,0.85),rgba(232,184,32,0.65),transparent);
          background-size:200% auto;animation:fqShimmer 4s linear infinite;}
        .fq-cta-inner{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
        .fq-cta-title{font-family:'Space Grotesk',sans-serif;font-size:1.15rem;font-weight:700;color:#fff;margin-bottom:3px;}
        .fq-cta-title em{font-style:normal;color:var(--gold-l);}
        .fq-cta-sub{font-size:12px;color:rgba(219,234,254,0.65);font-weight:300;}
        .fq-cta-btn{
          display:inline-flex;align-items:center;gap:6px;padding:10px 20px;
          border-radius:10px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;letter-spacing:.05em;
          cursor:pointer;border:none;white-space:nowrap;text-decoration:none;
          background:var(--gold);color:#12233f;
          animation:fqGldPls 3.5s ease-in-out infinite;
          transition:background .3s,transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;}
        .fq-cta-btn:hover{
          background:var(--gold-l);transform:translateY(-3px) scale(1.04);
          box-shadow:0 10px 28px rgba(247,168,27,.35);animation:none;}

        @media(max-width:520px){
          .fq{padding:64px 0 88px;}
          .fq-card{padding:22px 18px 20px;}
          .fq-a{padding-left:0;}
          .fq-a::before{display:none;}
          .fq-hint{display:none;}
        }
      `}</style>

      <section
        id="faq"
        className={`fq${entered ? ' vis' : ''}`}
        ref={secRef}
        onTouchStart={e => setTouchStart(e.targetTouches[0].clientX)}
        onTouchEnd={e => {
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 55) go(diff > 0 ? 'next' : 'prev');
        }}
      >
        <div className="fq-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="fq-photo-overlay" />

        <div className="wrap">

          <header style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="e0" style={{ marginBottom: 18 }}>
              <div className="fq-eyebrow">
                <span className="fq-edot" />
                {t.eyebrow}
              </div>
            </div>
            <div className="e1">
              <h2 className="fq-title" style={{ marginBottom: 14 }}>
                {t.title} <em>{t.titleAccent}</em>
              </h2>
            </div>
            <div className="e2"><div className="fq-divider" style={{ marginBottom: 18 }} /></div>
            <div className="e2"><p className="fq-sub">{t.subtitle}</p></div>
          </header>

          <div className="fq-prog-track e3">
            <div className="fq-prog-bar" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="fq-nav-row e3">
            <button className="fq-nav-btn" onClick={() => go('prev')} aria-label="Previous">
              <ChevronLeft style={{ width: 17, height: 17, color: 'rgba(226,236,255,.6)' }} />
            </button>

            <div className="fq-dots">
              {t.faqs.map((_, i) => (
                <button
                  key={i}
                  className={`fq-dot${i === current ? ' active' : ''}`}
                  onClick={() => jumpTo(i)}
                  aria-label={`Question ${i + 1}`}
                />
              ))}
            </div>

            <div className="fq-counter">
              <strong>{String(current + 1).padStart(2, '0')}</strong>
              <span style={{ color: 'rgba(255,255,255,.18)', margin: '0 4px' }}>/</span>
              {String(total).padStart(2, '0')}
            </div>

            <button className="fq-nav-btn" onClick={() => go('next')} aria-label="Next">
              <ChevronRight style={{ width: 17, height: 17, color: 'rgba(226,236,255,.6)' }} />
            </button>
          </div>

          <div className="fq-card e4">
            <div className="fq-inner" style={innerStyle}>
              <div className="fq-q-row">
                <div className="fq-icon">
                  <FaqIcon style={{ width: 22, height: 22, color: '#fff' }} />
                </div>
                <p className="fq-q">{faq.question}</p>
              </div>
              <div className="fq-a">
                <p>{faq.answer}</p>
              </div>
            </div>
          </div>

          <div className="fq-hint e4" style={{ animationDelay: '0.75s' }}>
            <span className="fq-key">←</span>
            <span className="fq-key">→</span>
            <span style={{ marginLeft: 5 }}>
              {language === 'ro' ? 'taste sau swipe pentru a naviga' : 'arrow keys or swipe to navigate'}
            </span>
          </div>

          <div className="fq-cta e4" style={{ animationDelay: '0.85s' }}>
            <div className="fq-cta-inner">
              <div>
                <p className="fq-cta-title">
                  {language === 'ro'
                    ? <>Nu ai găsit răspunsul? <em>Scrie-ne direct.</em></>
                    : <>Didn't find your answer? <em>Write to us.</em></>}
                </p>
                <p className="fq-cta-sub">
                  contact@interactcismigiu.ro &nbsp;·&nbsp; {language === 'ro' ? 'Răspundem în 24h' : 'Reply within 24h'}
                </p>
              </div>
              <a href="#contact" className="fq-cta-btn">
                {language === 'ro' ? 'Contactează-ne →' : 'Contact us →'}
              </a>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default FAQ;