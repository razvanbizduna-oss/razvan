import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, User, Bell, Instagram, Facebook, X,
  ArrowRight, Heart, MessageCircle, Share2, ArrowUpRight,
  Megaphone, ChevronLeft, ChevronRight as ChevronRightIcon,
  Sparkles
} from 'lucide-react';

interface NewsProps {
  language: 'ro' | 'en';
}

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
  categoryLabel: string;
  featured: boolean;
  urgent?: boolean;
  fullContent?: string;
}

const INSTAGRAM_URL = 'https://www.instagram.com/interactcismigiu';
const FACEBOOK_URL  = 'https://www.facebook.com/interactcismigiu';

// Same club photos used as the tiled background across the rest of the
// site (About, TeamPage, Projects) — kept identical so every section reads
// as one continuous surface instead of a new backdrop per section.
const bgPhotos = ['itc.webp', 'IMG_1347.webp', 'IMG_1352.webp', 'IMG_1351.webp', 'IMG_1349.webp', 'IMG_1350.webp'];
const bgTiles = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];



const News: React.FC<NewsProps> = ({ language = 'ro' }) => {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [likedPosts, setLikedPosts] = useState(new Set<string>());
  const [igSlide, setIgSlide] = useState(0);
  const [fbSlide, setFbSlide] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const content = {
    ro: {
      eyebrow: '',
      newsTitle: 'Noutăți & Anunțuri',
      newsSubtitle: 'Ultimele știri, rezultate și anunțuri importante ale clubului',
      socialTitle: 'Urmărește-ne',
      socialSubtitle: 'Momente din activitățile noastre pe rețelele sociale',
      readMore: 'Citește mai mult',
      close: 'Închide',
      viewOnInstagram: 'Deschide Instagram',
      followers: 'urmăritori',
      posts: 'postări',
      engagement: 'engagement',
      follow: 'Urmărește',
      latestPosts: 'Postări recente',
      news: [
        {
          id: 0,
          title: 'Recrutările pentru noi membri s-au încheiat!',
          excerpt: 'Perioada de înscrieri pentru sezonul 2025–2026 s-a finalizat. Mulțumim tuturor celor care și-au depus candidatura — urmează etapa de selecție.',
          fullContent: 'Recrutările oficiale ale clubului Interact București Cismigiu pentru sezonul 2025–2026 s-au încheiat. Am primit un număr record de candidaturi — suntem copleșiți de entuziasmul vostru! Procesul de selecție va continua în perioada imediat următoare, iar candidații admiși vor fi contactați individual prin e-mail. Vă rugăm să fiți cu ochii pe conturile noastre de Instagram și Facebook pentru anunțul oficial cu rezultatele. Dacă ai ratat această sesiune de recrutare, nu-ți face griji — vom deschide o nouă rundă în toamnă. Până atunci, poți urmări activitățile noastre și te poți implica voluntar în proiectele în desfășurare.',
          image: 'IMG_1359.webp',
          date: '2026-03-15',
          author: 'Board Interact Cismigiu',
          category: 'anunt',
          categoryLabel: 'Anunț Oficial',
          featured: true,
          urgent: true,
        },
        {
          id: 1,
          title: 'Maze of Fire II — Treasure Hunt pe 27 Aprilie',
          excerpt: 'Un traseu urban misterios prin 8 repere iconice ale Bucureștiului, inspirat din The Shining. 80 de participanți, provocări și indicii la fiecare oprire.',
          fullContent: 'Maze of Fire II este un treasure hunt interactiv inspirat din romanul The Shining de Stephen King, menit să provoace atât mintea cât și spiritul. Evenimentul reunește 80 de participanți care pornesc în grupe printr-o călătorie urbană prin repere emblematice ale Bucureștiului: Piața Romană, ASE, Casa Universitarilor, Ateneul Român, Biserica Kretzulescu, Piața Revoluției, Palatul Telefoanelor și Grădina Cișmigiu. Fiecare oprire conține un indiciu sau o provocare, dar și personaje din poveste. Participarea include o taxă de 30 lei. Toate fondurile colectate sunt direcționate către proiectele clubului Interact Cișmigiu.',
          image: 'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png',
          date: '2026-03-20',
          author: 'Andreea Ciobanu',
          category: 'cultural',
          categoryLabel: 'Cultural',
          featured: false,
        },
        {
          id: 2,
          title: 'Fashion Show X — The Great Unravel pe 4 Aprilie',
          excerpt: 'Un fashion show cu mesaj ecologic puternic: designeri tineri, colecții sustenabile și cauza ONG-ului Micile Bucurii. Vino să dai jos ce ne acoperă ochii.',
          fullContent: '"The Great Unravel" este un fashion show marca Interact Cișmigiu care combină eleganța modei cu un mesaj puternic de responsabilitate socială și ecologică. Evenimentul creează un spațiu în care designerii își pot expune creațiile inovatoare și trezește conștientizarea asupra efectelor overconsumption-ului și fast fashion-ului. Invitații primesc un goodie bag cu produse de la sponsori și au acces la snack bar. Cauza susținută este ONG-ul "Micile Bucurii".',
          image: 'IMG_1356.webp',
          date: '2026-03-10',
          author: 'Ioana Coțofană',
          category: 'cultural',
          categoryLabel: 'Cultural',
          featured: false,
        },
        {
          id: 3,
          title: 'Beneath the Self VII — Înscrie-te la concursul de poezie',
          excerpt: 'Festivalul de artă scenică Beneath the Self deschide înscrierile pentru concursul de poezii și monologuri. Jurați: actori profesioniști. Cauza: HOSPICE Casa Speranței.',
          fullContent: 'Beneath the Self este un proiect marca Interact Cișmigiu care oferă tinerilor artiști un cadru de exprimare prin teatru, muzică, dans și alte forme de creație. Tema ediției a VII-a, "Prin ochii celuilalt", abordează legăturile dintre oameni și modul în care acestea modelează identitatea. Evenimentul include un concurs de poezii și monologuri jurizat de actori și profesioniști. Cauza susținută este HOSPICE Casa Speranței.',
          image: 'IMG_1358.webp',
          date: '2026-02-28',
          author: 'Clara Ștefan',
          category: 'cultural',
          categoryLabel: 'Cultural',
          featured: false,
        },
        {
          id: 4,
          title: 'Movie Night IV — Beyond Burnout pe 16 Mai',
          excerpt: 'The Devil Wears Prada pe ecran în aer liber, un psiholog invitat special despre burnout și fonduri pentru Mental Health for Romania. Locuri limitate!',
          fullContent: 'Movie Night IV este un eveniment caritabil marca Interact Cișmigiu, în colaborare cu Interact București Triumph. Evenimentul constă într-o seară de film în aer liber cu tema "Beyond Burnout". Înainte de proiecție va vorbi un psiholog sau terapeut despre burnout. Invitații se bucură de băuturi și snacks de la sponsori. Scopul este susținerea asociației "Mental Health for Romania".',
          image: 'https://filmfaremiddleeast.com/wp-content/uploads/2025/01/movie-night.jpg',
          date: '2026-03-18',
          author: 'Amalia Merezeanu',
          category: 'educatie',
          categoryLabel: 'Educație',
          featured: false,
        },
      ] as NewsItem[],
      instagramPosts: [
        {
          image: 'IMG_1355.webp',
          caption: 'Christams for Everyone bucura sufletele copiilor! #InteractCismigiu #MerryChristmas',
          likes: 412,
          comments: 58,
        },
        {
          image: 'IMG_1357.webp',
          caption: '✨ Fashion Show X — The Great Unravel | 4 Aprilie | Modă. Conștiință. Schimbare. 🌿 #FashionShow #Sustenabilitate',
          likes: 387,
          comments: 44,
        },
        {
          image: 'https://www.bucurestifm.ro/wp-content/uploads/2026/02/onb-850x479.jpg',
          caption: '🎭 Beneath the Self VII — Prin ochii celuilalt. Concursul de poezii și monologuri e deschis! ✍️ #BeneathTheSelf #ArtaScenica',
          likes: 295,
          comments: 31,
        },
        {
          image: 'https://filmfaremiddleeast.com/wp-content/uploads/2025/01/movie-night.jpg',
          caption: '🎬 Movie Night IV — Beyond Burnout | 16 Mai | The Devil Wears Prada + speaker psiholog + cauza #MentalHealth 🎥',
          likes: 341,
          comments: 39,
        },
      ],
      facebookPosts: [
        {
          image: 'IMG_1354.webp',
          caption: '📢 Recrutările s-au încheiat! Mulțumim tuturor candidaților. Rezultatele vin în curând — stay tuned! 💙 #InteractCismigiu #Recrutare',
          likes: 512,
          comments: 74,
          shares: 94,
        },
        {
          image: 'https://i.natgeofe.com/n/d9ef9444-b546-4312-8b19-093ecde5ede4/GettyImages-515138570.jpg',
          caption: '🎷 Roaring 20s II a fost de neuitat! Mulțumim tuturor celor 120 de participanți! Fonduri strânse pentru Asociația Casa Bună. ❤️ #Roaring20s',
          likes: 467,
          comments: 61,
          shares: 83,
        },
        {
          image: 'https://www.aristotle.com/wp-content/uploads/2022/05/pexels-markus-spiske-2990644.jpg',
          caption: '🤝 Activism for Today continuă! Luna aceasta am vizitat un afterschool din Sectorul 5. Împreună facem diferența. 💛 #ActivismForToday',
          likes: 389,
          comments: 47,
          shares: 56,
        },
        {
          image: 'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png',
          caption: '🔦 27 Aprilie — Maze of Fire II! Biletele se epuizează rapid. Înscrie-te acum și explorează Bucureștiul altfel! 🗺️ #MazeOfFire',
          likes: 298,
          comments: 35,
          shares: 42,
        },
      ],
      socialStats: {
        instagram: { followers: 3940, posts: 218, engagement: 7.2 },
        facebook:  { followers: 2340, posts: 305, engagement: 5.8 },
      },
    },
    en: {
      eyebrow: 'Interact București Cismigiu',
      newsTitle: 'News & Announcements',
      newsSubtitle: 'Latest updates, results and important announcements from our club',
      socialTitle: 'Follow Us',
      socialSubtitle: 'Moments from our activities on social media',
      readMore: 'Read more',
      close: 'Close',
      viewOnInstagram: 'Open Instagram',
      followers: 'followers',
      posts: 'posts',
      engagement: 'engagement',
      follow: 'Follow',
      latestPosts: 'Recent posts',
      news: [
        {
          id: 0,
          title: 'Recruitment for new members has closed!',
          excerpt: 'The registration period for the 2025–2026 season has ended. Thank you to everyone who applied — the selection stage is now underway.',
          fullContent: 'Official recruitment for Interact București Cismigiu for the 2025–2026 season has closed. We received a record number of applications — we are overwhelmed by your enthusiasm! The selection process will continue shortly, and successful candidates will be contacted individually by email. Please keep an eye on our Instagram and Facebook accounts for the official results announcement. If you missed this recruitment session, don\'t worry — we will open a new round in autumn. In the meantime, you can follow our activities and get involved as a volunteer in ongoing projects.',
          image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
          date: '2026-03-15',
          author: 'Interact Cismigiu Board',
          category: 'anunt',
          categoryLabel: 'Official Announcement',
          featured: true,
          urgent: true,
        },
        {
          id: 1,
          title: 'Maze of Fire II — Treasure Hunt on April 27th',
          excerpt: 'A mysterious urban trail through 8 iconic Bucharest landmarks, inspired by The Shining. 80 participants, challenges and clues at every stop.',
          fullContent: 'Maze of Fire II is an interactive treasure hunt inspired by Stephen King\'s novel The Shining, designed to challenge both mind and spirit. The event brings together 80 participants in groups on a mysterious urban journey through iconic Bucharest landmarks. Each stop contains a clue or challenge. Participation costs 30 RON. All funds raised go towards Interact Cișmigiu projects.',
          image: 'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png',
          date: '2026-03-20',
          author: 'Andreea Ciobanu',
          category: 'cultural',
          categoryLabel: 'Cultural',
          featured: false,
        },
        {
          id: 2,
          title: 'Fashion Show X — The Great Unravel on April 4th',
          excerpt: 'A fashion show with a powerful ecological message: young designers, sustainable collections and the cause of NGO Micile Bucurii.',
          fullContent: '"The Great Unravel" is an Interact Cișmigiu fashion show combining the elegance of fashion with a powerful message of social and ecological responsibility. The event creates a space where designers can showcase innovative creations while raising awareness about overconsumption and fast fashion. The supported cause is the NGO "Micile Bucurii".',
          image: 'https://assets.vogue.com/photos/67c9df7ca1f72dd92fd6aee3/master/w_2560%2Cc_limit/holding-rtw.png',
          date: '2026-03-10',
          author: 'Ioana Coțofană',
          category: 'cultural',
          categoryLabel: 'Cultural',
          featured: false,
        },
        {
          id: 3,
          title: 'Beneath the Self VII — Enter the Poetry Competition',
          excerpt: 'The Beneath the Self performing arts festival opens registrations for the poetry and monologue competition. Judges: professional actors. Cause: HOSPICE Casa Speranței.',
          fullContent: 'Beneath the Self is an Interact Cișmigiu project offering young artists a framework for expression through theatre, music, dance and other creative forms. The event includes a poetry and monologue competition judged by actors and arts professionals. The supported cause is HOSPICE Casa Speranței.',
          image: 'https://www.bucurestifm.ro/wp-content/uploads/2026/02/onb-850x479.jpg',
          date: '2026-02-28',
          author: 'Clara Ștefan',
          category: 'cultural',
          categoryLabel: 'Cultural',
          featured: false,
        },
        {
          id: 4,
          title: 'Movie Night IV — Beyond Burnout on May 16th',
          excerpt: 'The Devil Wears Prada on an outdoor screen, a special psychologist guest speaker on burnout and funds for Mental Health for Romania. Limited spots!',
          fullContent: 'Movie Night IV is a charitable event by Interact Cișmigiu, in collaboration with Interact București Triumph. The event features an outdoor film screening under the theme "Beyond Burnout". Before the screening, a psychologist or therapist will speak about burnout. The goal is to support "Mental Health for Romania".',
          image: 'https://filmfaremiddleeast.com/wp-content/uploads/2025/01/movie-night.jpg',
          date: '2026-03-18',
          author: 'Amalia Merezeanu',
          category: 'educatie',
          categoryLabel: 'Education',
          featured: false,
        },
      ] as NewsItem[],
      instagramPosts: [
        {
          image: 'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png',
          caption: '🔦 Maze of Fire II is coming April 27th! Are you ready for a treasure hunt through the heart of Bucharest? 🗺️ #InteractCismigiu #MazeOfFire',
          likes: 412,
          comments: 58,
        },
        {
          image: 'https://assets.vogue.com/photos/67c9df7ca1f72dd92fd6aee3/master/w_2560%2Cc_limit/holding-rtw.png',
          caption: '✨ Fashion Show X — The Great Unravel | April 4th | Fashion. Conscience. Change. 🌿 #FashionShow #Sustainability',
          likes: 387,
          comments: 44,
        },
        {
          image: 'https://www.bucurestifm.ro/wp-content/uploads/2026/02/onb-850x479.jpg',
          caption: '🎭 Beneath the Self VII — Through Another\'s Eyes. The poetry and monologue competition is open! ✍️ #BeneathTheSelf',
          likes: 295,
          comments: 31,
        },
        {
          image: 'https://filmfaremiddleeast.com/wp-content/uploads/2025/01/movie-night.jpg',
          caption: '🎬 Movie Night IV — Beyond Burnout | May 16th | The Devil Wears Prada + psychologist speaker + #MentalHealth cause 🎥',
          likes: 341,
          comments: 39,
        },
      ],
      facebookPosts: [
        {
          image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
          caption: '📢 Recruitment has closed! Thank you to all applicants. Results coming soon — stay tuned! 💙 #InteractCismigiu',
          likes: 512,
          comments: 74,
          shares: 94,
        },
        {
          image: 'https://i.natgeofe.com/n/d9ef9444-b546-4312-8b19-093ecde5ede4/GettyImages-515138570.jpg',
          caption: '🎷 Roaring 20s II was unforgettable! Thank you to all 120 participants! Funds raised for Asociația Casa Bună. ❤️ #Roaring20s',
          likes: 467,
          comments: 61,
          shares: 83,
        },
        {
          image: 'https://www.aristotle.com/wp-content/uploads/2022/05/pexels-markus-spiske-2990644.jpg',
          caption: '🤝 Activism for Today continues! This month we visited an after-school programme in Sector 5. Together we make a difference. 💛 #ActivismForToday',
          likes: 389,
          comments: 47,
          shares: 56,
        },
        {
          image: 'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png',
          caption: '🔦 April 27th — Maze of Fire II! Tickets are selling fast. Register now and explore Bucharest differently! 🗺️ #MazeOfFire',
          likes: 298,
          comments: 35,
          shares: 42,
        },
      ],
      socialStats: {
        instagram: { followers: 3940, posts: 218, engagement: 7.2 },
        facebook:  { followers: 2340, posts: 305, engagement: 5.8 },
      },
    },
  };

  // Rotary-family category colors instead of the generic Tailwind palette
  const catColors: Record<string, { pill: string; dot: string }> = {
    anunt:    { pill: 'bg-[#a0223d]/15 text-[#f2a8bb] border border-[#a0223d]/40',  dot: 'bg-[#e0637f]' },
    cultural: { pill: 'bg-[#f7a81b]/15 text-[#ffcf5c] border border-[#f7a81b]/40',  dot: 'bg-[#f7a81b]' },
    social:   { pill: 'bg-[#0067c8]/15 text-[#8fc0f5] border border-[#0067c8]/40',  dot: 'bg-[#0067c8]' },
    educatie: { pill: 'bg-[#17458f]/20 text-[#9cbdec] border border-[#17458f]/45', dot: 'bg-[#4f7fc9]' },
    ecologie: { pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40', dot: 'bg-emerald-500' },
  };

  const t = content[language];

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const handleLike = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const igLen = t.instagramPosts.length;
  const fbLen = t.facebookPosts.length;

  const prevSlide = (which: 'ig' | 'fb', e: React.MouseEvent) => {
    e.stopPropagation();
    if (which === 'ig') setIgSlide(s => (s - 1 + igLen) % igLen);
    else setFbSlide(s => (s - 1 + fbLen) % fbLen);
  };

  const nextSlide = (which: 'ig' | 'fb', e: React.MouseEvent) => {
    e.stopPropagation();
    if (which === 'ig') setIgSlide(s => (s + 1) % igLen);
    else setFbSlide(s => (s + 1) % fbLen);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        .nw-root { font-family: 'Inter', sans-serif; }
        .nw-font-display { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
        .nw-font-mono { font-family: 'JetBrains Mono', monospace; }

        /* ══ PHOTO BACKGROUND — same tiled club photos + navy overlay as About / TeamPage / Projects ══ */
        .nw-photo-bg { position:absolute; inset:0; z-index:0; display:flex; flex-wrap:wrap; overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.48); transform:scale(1.08); }
        .nw-photo-bg img { flex:1 1 260px; height:260px; object-fit:cover; display:block; }
        .nw-photo-overlay { position:absolute; inset:0; z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%); }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideImg {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .social-img-slide { animation: slideImg .3s ease; }
        .news-side {
          background: #fffdf7;
          border-radius: 22px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          border: 1px solid rgba(23,69,143,0.08);
        }
        .social-side {
          background: linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 22px;
          padding: 32px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.35);
          backdrop-filter: blur(6px);
        }
      `}</style>

      <section
        id="news"
        className="nw-root py-20 lg:py-28 relative overflow-hidden"
        style={{ background: '#050a1e' }}
        ref={sectionRef}
      >
        <div className="nw-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="nw-photo-overlay" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* section eyebrow */}
          <div className="text-center mb-12">
            <div className="nw-eyebrow">
              <div className="nw-edot" />
              <span>{t.eyebrow}</span>
            </div>
          </div>

          {/* two columns */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-start">

            {/* ── LEFT: NEWS (light card) ── */}
            <div className="news-side">
              <div className="mb-7 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg,#17458f,#0067c8)' }}>
                      <Megaphone className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="nw-font-display text-2xl sm:text-3xl text-[#12233f]">
                      {t.newsTitle}
                    </h2>
                  </div>
                  <p className="text-[#5c6c88] text-xs mt-1 ml-11">{t.newsSubtitle}</p>
                </div>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(0,103,200,0.08)', border: '1px solid rgba(0,103,200,0.15)' }}>
                  <Bell className="w-3.5 h-3.5" style={{ color: '#0067c8' }} />
                </div>
              </div>

              <div className="space-y-3">
                {t.news.map(item => {
                  const cc = catColors[item.category] ?? catColors.cultural;

                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedNews(item)}
                      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                      style={{ background: 'rgba(23,69,143,0.035)', border: '1px solid rgba(23,69,143,0.08)' }}
                    >
                      <div className="flex">
                        <div className="w-28 sm:w-32 flex-shrink-0 relative overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            style={{ minHeight: '120px' }}
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 p-3.5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md" style={{ background: 'rgba(247,168,27,0.12)', color: '#c9840f', border: '1px solid rgba(247,168,27,0.3)' }}>
                                <span className="w-1 h-1 rounded-full" style={{ background: '#f7a81b' }} />
                                {item.categoryLabel}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] text-[#5c6c88]">
                                <Calendar className="w-3 h-3" />
                                {fmtDate(item.date)}
                              </span>
                            </div>
                            <h3
                              className="nw-font-display font-bold text-[#12233f] group-hover:text-[#0067c8] transition-colors leading-snug mb-1 line-clamp-2"
                              style={{ fontSize: '0.98rem' }}
                            >
                              {item.title}
                            </h3>
                            <p className="text-xs text-[#5c6c88] leading-relaxed line-clamp-2">
                              {item.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-[11px] text-[#5c6c88]">
                              <User className="w-3 h-3" />
                              {item.author}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#0067c8' }}>
                              {t.readMore}
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* ── RIGHT: SOCIAL (glass dark card) ── */}
            <div className="social-side">
              <div className="mb-7">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-[#ffcf5c]" />
                  </div>
                  <h2 className="nw-font-display text-2xl sm:text-3xl text-white">
                    {t.socialTitle}
                  </h2>
                </div>
                <p className="text-[rgba(226,236,255,.55)] text-xs mt-1 ml-11">{t.socialSubtitle}</p>
              </div>

              <div className="space-y-5">

                {/* ── Instagram ── */}
                <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Instagram</div>
                        <div className="text-xs text-[rgba(226,236,255,.5)]">@interactcismigiu</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-white">{t.socialStats.instagram.followers.toLocaleString()}</div>
                        <div className="nw-font-mono text-[9px] text-[rgba(226,236,255,.45)]">{t.followers}</div>
                      </div>
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-80"
                        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                      >
                        {t.follow}
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="overflow-hidden">
                      <div key={igSlide} className="social-img-slide">
                        <div className="relative">
                          <img
                            src={t.instagramPosts[igSlide].image}
                            alt="Instagram post"
                            className="w-full object-cover"
                            style={{ height: '200px' }}
                          />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.75) 0%, transparent 55%)' }} />
                          <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full nw-font-mono">
                            {igSlide + 1} / {igLen}
                          </div>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {t.instagramPosts.map((_, i) => (
                              <button
                                key={i}
                                onClick={e => { e.stopPropagation(); setIgSlide(i); }}
                                className={`h-1.5 rounded-full transition-all ${i === igSlide ? 'bg-[#f7a81b] w-4' : 'bg-white/50 w-1.5'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="px-4 py-3">
                          <p className="text-xs text-[rgba(226,236,255,.75)] leading-relaxed line-clamp-2 mb-3">
                            {t.instagramPosts[igSlide].caption}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-xs text-[rgba(226,236,255,.5)]">
                              <button
                                onClick={e => handleLike(`ig-${igSlide}`, e)}
                                className="flex items-center gap-1.5 hover:text-[#e05555] transition-colors"
                              >
                                <Heart className={`w-3.5 h-3.5 ${likedPosts.has(`ig-${igSlide}`) ? 'fill-[#e05555] text-[#e05555]' : ''}`} />
                                <span className="font-semibold text-white/70">{t.instagramPosts[igSlide].likes + (likedPosts.has(`ig-${igSlide}`) ? 1 : 0)}</span>
                              </button>
                              <div className="flex items-center gap-1.5">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="font-semibold text-white/70">{t.instagramPosts[igSlide].comments}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={e => prevSlide('ig', e)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#f7a81b]/25 flex items-center justify-center transition-all"
                              >
                                <ChevronLeft className="w-3.5 h-3.5 text-white" />
                              </button>
                              <button
                                onClick={e => nextSlide('ig', e)}
                                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#f7a81b]/25 flex items-center justify-center transition-all"
                              >
                                <ChevronRightIcon className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Facebook ── */}
                <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#17458f,#0067c8)' }}>
                        <Facebook className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Facebook</div>
                        <div className="text-xs text-[rgba(226,236,255,.5)]">@interactcismigiu</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold text-white">{t.socialStats.facebook.followers.toLocaleString()}</div>
                        <div className="nw-font-mono text-[9px] text-[rgba(226,236,255,.45)]">{t.followers}</div>
                      </div>
                      <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg,#17458f,#0067c8)' }}
                      >
                        {t.follow}
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="relative">
                    <div key={fbSlide} className="social-img-slide">
                      <div className="relative">
                        <img
                          src={t.facebookPosts[fbSlide].image}
                          alt="Facebook post"
                          className="w-full object-cover"
                          style={{ height: '200px' }}
                        />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.75) 0%, transparent 55%)' }} />
                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full nw-font-mono">
                          {fbSlide + 1} / {fbLen}
                        </div>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {t.facebookPosts.map((_, i) => (
                            <button
                              key={i}
                              onClick={e => { e.stopPropagation(); setFbSlide(i); }}
                              className={`h-1.5 rounded-full transition-all ${i === fbSlide ? 'bg-[#f7a81b] w-4' : 'bg-white/50 w-1.5'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-xs text-[rgba(226,236,255,.75)] leading-relaxed line-clamp-2 mb-3">
                          {t.facebookPosts[fbSlide].caption}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-[rgba(226,236,255,.5)]">
                            <button
                              onClick={e => handleLike(`fb-${fbSlide}`, e)}
                              className="flex items-center gap-1.5 hover:text-[#e05555] transition-colors"
                            >
                              <Heart className={`w-3.5 h-3.5 ${likedPosts.has(`fb-${fbSlide}`) ? 'fill-[#e05555] text-[#e05555]' : ''}`} />
                              <span className="font-semibold text-white/70">{t.facebookPosts[fbSlide].likes + (likedPosts.has(`fb-${fbSlide}`) ? 1 : 0)}</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="font-semibold text-white/70">{t.facebookPosts[fbSlide].comments}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="font-semibold text-white/70">{(t.facebookPosts[fbSlide] as any).shares}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={e => prevSlide('fb', e)}
                              className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#f7a81b]/25 flex items-center justify-center transition-all"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 text-white" />
                            </button>
                            <button
                              onClick={e => nextSlide('fb', e)}
                              className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#f7a81b]/25 flex items-center justify-center transition-all"
                            >
                              <ChevronRightIcon className="w-3.5 h-3.5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* stats strip */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: `${t.socialStats.instagram.followers.toLocaleString()}`, lbl: t.followers, sub: 'Instagram' },
                    { val: `${t.socialStats.facebook.followers.toLocaleString()}`, lbl: t.followers, sub: 'Facebook' },
                    { val: `${t.socialStats.instagram.engagement}%`, lbl: t.engagement, sub: 'avg.' },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl border border-white/10 px-3 py-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="nw-font-display text-base text-white">{s.val}</div>
                      <div className="nw-font-mono text-[9px] text-[rgba(226,236,255,.5)] uppercase tracking-wide">{s.sub}</div>
                      <div className="nw-font-mono text-[8px] text-[rgba(226,236,255,.35)] uppercase tracking-wider">{s.lbl}</div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Modal ── */}
        {selectedNews && (() => {
          const cc = catColors[selectedNews.category] ?? catColors.cultural;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
              style={{ background: 'rgba(5,10,30,0.8)', backdropFilter: 'blur(8px)' }}
              onClick={() => setSelectedNews(null)}
            >
              <div
                className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl my-4"
                style={{ background: '#fffdf7' }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ animation: 'slideUp .35s ease-out both' }}>
                  <div className="relative">
                    <button
                      onClick={() => setSelectedNews(null)}
                      className="absolute top-4 right-4 z-10 bg-white/90 p-2 rounded-xl shadow-md hover:bg-white transition-all"
                    >
                      <X className="w-4 h-4 text-[#12233f]" />
                    </button>
                    <div className="h-52 sm:h-64 overflow-hidden rounded-t-2xl relative">
                      <img
                        src={selectedNews.image}
                        alt={selectedNews.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,10,30,0.85) 0%, rgba(0,103,200,0.15) 55%, transparent 100%)' }} />
                      <div className="absolute bottom-5 left-5 right-12">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md mb-2 ${cc.pill}`}>
                          <span className={`w-1 h-1 rounded-full ${cc.dot}`} />{selectedNews.categoryLabel}
                        </span>
                        <h2 className="nw-font-display text-xl sm:text-2xl text-white leading-snug">
                          {selectedNews.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">
                    <div className="flex flex-wrap gap-3 mb-5">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#5c6c88]" style={{ background: 'rgba(23,69,143,0.04)', border: '1px solid rgba(23,69,143,0.08)' }}>
                        <Calendar className="w-3.5 h-3.5" style={{ color: '#0067c8' }} />
                        {fmtDate(selectedNews.date)}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#5c6c88]" style={{ background: 'rgba(23,69,143,0.04)', border: '1px solid rgba(23,69,143,0.08)' }}>
                        <User className="w-3.5 h-3.5" style={{ color: '#0067c8' }} />
                        {selectedNews.author}
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-[#334463] leading-relaxed mb-7">
                      {selectedNews.fullContent || selectedNews.excerpt}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
                      >
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </a>
                      <a
                        href={FACEBOOK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg,#17458f,#0067c8)' }}
                      >
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </a>
                      <button
                        onClick={() => setSelectedNews(null)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: 'rgba(23,69,143,0.06)', color: '#12233f' }}
                      >
                        {t.close}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </>
  );
};

export default News;