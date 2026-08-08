import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, set, remove } from 'firebase/database';
import {
  Heart, Users, Calendar, Award, Leaf,
  MapPin, TrendingUp, HandHeart, Music, BookOpen,
  Star, ChevronRight, FileText, CalendarDays, CalendarCheck, Check,
  Mail, Phone, User, X, CalendarPlus
} from 'lucide-react';

interface ProjectsProps {
  language: 'ro' | 'en';
}

// Shared Firebase project — same database the member portal reads from.
// Reservations made here land in `reservations/{id}` and show up live in
// the "Rezervări" tab of the member dashboard.
const db = getDatabase(getApps().length ? getApps()[0] : initializeApp({
  apiKey: "AIzaSyDGTf0McxvjriKWDtbVfnTUgcy1CCobBbA",
  authDomain: "interact-cismigiu.firebaseapp.com",
  databaseURL: "https://interact-cismigiu-default-rtdb.firebaseio.com",
  projectId: "interact-cismigiu",
  storageBucket: "interact-cismigiu.firebasestorage.app",
  messagingSenderId: "26942882237",
  appId: "1:26942882237:web:a26ad58d1289e81c4f12d4",
}));

const PDF_FILES: Record<number, string> = {
  1: '/Fisa_de_Proiect_MOF_II.pdf',
  4: '/Fisa_proiect_Movie_Night_IV.pdf',
  5: '/Fisa_proiect_R20s_II.pdf',
};

// Minimum donation required to attend any event, in RON.
const MIN_DONATION_RON = 30;

// Local-only map of {projectId: reservationId} so this browser knows which
// events *it* has already booked (for the "Reserved" UI state). The actual
// reservation record lives in Firebase, shared with the member dashboard.
const RESERVED_MAP_KEY = 'ic_reserved_map_v2';

// Same club photos used as the tiled background across the rest of the
// site (About, TeamPage) — kept identical here so every section reads as
// one continuous surface instead of a new backdrop per section.
const bgPhotos = ['itc.webp', 'IMG_1347.webp', 'IMG_1352.webp', 'IMG_1351.webp', 'IMG_1349.webp', 'IMG_1350.webp'];
const bgTiles = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];

interface Reservation {
  id: string;
  projectId: number;
  projectTitle: string;
  name: string;
  email: string;
  phone: string;
  minDonation: number;
  timestamp: string;
}

// ── Parallax orb hook ──────────────────────────────────────────────────
function useParallax() {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const h = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setPos({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
    };
    el.addEventListener('mousemove', h);
    return () => el.removeEventListener('mousemove', h);
  }, []);
  return { ref, pos };
}

// ── Intersection observer ──────────────────────────────────────────────
function useVisible(threshold = 0.06) {
  const ref = useRef<HTMLElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

// ── .ics builder(s) ─────────────────────────────────────────────────────
function buildEventBlock(title: string, location: string, description: string, startDate: string, endDate: string) {
  const toICSDate = (d: string) => d.replace(/-/g, '');
  const endObj = new Date(endDate);
  endObj.setDate(endObj.getDate() + 1); // DTEND is exclusive for all-day events
  const endStr = endObj.toISOString().slice(0, 10).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const esc = (s: string) => s.replace(/[,;]/g, ' ').replace(/\n/g, ' ');
  return [
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@interactcismigiu`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${toICSDate(startDate)}`,
    `DTEND;VALUE=DATE:${endStr}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(description)}`,
    'END:VEVENT',
  ].join('\r\n');
}

function buildICS(title: string, location: string, description: string, startDate: string, endDate: string) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Interact Cismigiu//Events//EN',
    buildEventBlock(title, location, description, startDate, endDate),
    'END:VCALENDAR',
  ].join('\r\n');
}

function buildICSMulti(items: { title: string; location: string; description: string; startDate: string; endDate: string }[]) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Interact Cismigiu//Events//EN',
    ...items.map(it => buildEventBlock(it.title, it.location, it.description, it.startDate, it.endDate)),
    'END:VCALENDAR',
  ].join('\r\n');
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const Projects: React.FC<ProjectsProps> = ({ language }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const { ref: secRef } = useParallax();
  const { ref: headerRef, vis: headerVis } = useVisible(0.1) as { ref: React.RefObject<HTMLDivElement>, vis: boolean };
  const gridRef = useRef<HTMLDivElement>(null);

  // ── Reservations ── the record itself is written straight to Firebase
  // (shared with the member dashboard's "Rezervări" tab). This browser
  // additionally keeps a small local map so it can show "Reserved" state
  // and let the same visitor cancel their own booking.
  const [reservedMap, setReservedMap] = useState<Record<number, string>>({});
  const reservedIds = new Set(Object.keys(reservedMap).map(Number));
  const [reserveTarget, setReserveTarget] = useState<number | null>(null);
  const [reserveForm, setReserveForm] = useState({ name: '', email: '', phone: '' });
  const [reserveError, setReserveError] = useState('');
  const [reserveDone, setReserveDone] = useState(false);
  const [reserveSubmitting, setReserveSubmitting] = useState(false);

  // ── Calendar ──
  const [calFilter, setCalFilter] = useState('all');

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RESERVED_MAP_KEY);
      if (raw) setReservedMap(JSON.parse(raw));
    } catch { /* ignore malformed storage */ }
  }, []);

  const persistReservedMap = (map: Record<number, string>) => {
    setReservedMap(map);
    try { window.localStorage.setItem(RESERVED_MAP_KEY, JSON.stringify(map)); } catch { /* storage unavailable */ }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') { setSelectedProject(null); setShowCalendar(false); setReserveTarget(null); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const content = {
    ro: {
      title: 'Proiectele Noastre',
      titleAccent: 'de Voluntariat',
      subtitle: 'Inițiative conduse de tineri pentru comunitate — de la ecologie urbană la ajutor social, cultură și educație.',
      eyebrow: '// PROIECTE · INTERACT CISMIGIU',
      downloadBtn: 'Deschide broșura PDF',
      viewDetails: 'Detalii',
      closeModal: 'Închide',
      projectOverview: 'Prezentare Generală',
      projectDetails: 'Informații Proiect',
      calendarBtn: 'Calendarul proiectelor',
      calendarTitle: 'Calendarul proiectelor',
      calendarSub: 'Toate evenimentele, în ordine cronologică.',
      addToCalendarOne: 'Adaugă în calendar',
      reserve: 'Rezervă',
      reserved: 'Rezervat',
      pdf: 'PDF',
      reserveModalTitle: 'Rezervă-ți locul',
      reserveModalSub: 'Completează formularul pentru a-ți rezerva locul la acest eveniment.',
      minDonationLabel: 'Donație minimă pentru participare',
      minDonationNote: 'Suma se achită la eveniment și susține direct proiectele Interact Cișmigiu.',
      fieldName: 'Nume complet',
      fieldEmail: 'Adresă de email',
      fieldPhone: 'Număr de telefon',
      submitReservation: 'Trimite rezervarea',
      reserveErrorMsg: 'Te rugăm să completezi corect toate câmpurile.',
      reserveNetworkError: 'A apărut o eroare. Te rugăm să încerci din nou.',
      reserveSubmitting: 'Se trimite…',
      calExportAll: 'Exportă tot',
      calFilterEmpty: 'Niciun eveniment pentru acest filtru.',
      reservationDoneTitle: 'Rezervare confirmată!',
      reservationDoneSub: 'Îți mulțumim! Te așteptăm la eveniment.',
      alreadyReservedTitle: 'Ai deja un loc rezervat',
      alreadyReservedSub: 'Locul tău pentru acest eveniment este confirmat.',
      cancelReservation: 'Anulează rezervarea',
      cancel: 'Renunță',
      adminBtn: 'Admin',
      adminTitle: 'Rezervări — panou intern',
      adminSub: 'Vizibil doar pentru organizatori.',
      adminEmpty: 'Nicio rezervare încă.',
      adminExport: 'Exportă în Excel (CSV)',
      adminClose: 'Închide',
      adminPasswordPrompt: 'Introdu parola de organizator:',
      adminWrongPassword: 'Parolă incorectă.',
      colName: 'Nume', colEmail: 'Email', colPhone: 'Telefon', colProject: 'Eveniment', colDonation: 'Donație', colDate: 'Data',
      categories: [
        { id: 'all',      name: 'Toate',    icon: Star },
        { id: 'ecologie', name: 'Ecologie', icon: Leaf },
        { id: 'social',   name: 'Social',   icon: HandHeart },
        { id: 'educatie', name: 'Educație', icon: BookOpen },
        { id: 'cultural', name: 'Cultural', icon: Music },
      ],
      labels: {
        coordinator: 'Coordonator', period: 'Perioadă', team: 'Echipa',
        participants: 'Participanți', location: 'Locație',
        active: 'În desfășurare',
        achievements: 'Realizări', impact: 'Impact',
        volunteers: 'voluntari implicați',
      },
      projects: [
        { id:1, title:'Maze of Fire II', shortDescription:'Treasure hunt interactiv inspirat din romanul The Shining, o călătorie urbană misterioasă prin cele mai emblematice repere ale Bucureștiului.', fullDescription:'Maze of Fire II este un treasure hunt interactiv inspirat din romanul The Shining de Stephen King, menit să provoace atât mintea cât și spiritul. Evenimentul reunește 80 de participanți care pornesc în grupe printr-o călătorie urbană prin repere emblematice ale Bucureștiului: Piața Romană, ASE, Casa Universitarilor, Ateneul Român, Biserica Kretzulescu, Piața Revoluției, Palatul Telefoanelor și Grădina Cișmigiu. Fiecare oprire conține un indiciu sau o provocare, dar și personaje din poveste. Participarea include o taxă de 30 lei, care acoperă accesul și un goodie bag cu surprize. Toate fondurile colectate sunt direcționate către activitățile și proiectele viitoare ale clubului Interact Cișmigiu.', category:'cultural', participants:80, startDate:'2026-04-27', endDate:'2026-04-27', achievements:['80 participanți în grupe','Traseu prin 8 repere istorice ale Bucureștiului','Fonduri pentru proiectele Interact Cișmigiu'], image:'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png', coordinator:'Andreea Ciobanu & Sebastian Scoarță', teamMembers:['Andreea Ciobanu — PM','Sebastian Scoarță — PM','Iris Ionescu','Karina Pantazi','Maria Oneață','Theodora Coțofană'], location:'Piața Romană → Grădina Cișmigiu, București', impact:'Experiență unică de învățare prin teamwork, gândire critică și creativitate pentru 80 de tineri.' },
        { id:2, title:'Fashion Show X — The Great Unravel', shortDescription:'Fashion show cu mesaj ecologic și social, care combină eleganța modei cu responsabilitatea față de planetă și susține ONG-ul Micile Bucurii.', fullDescription:'"The Great Unravel" este un fashion show marca Interact Cișmigiu care combină eleganța modei cu un mesaj puternic de responsabilitate socială și ecologică. Evenimentul creează un spațiu în care designerii își pot expune creațiile inovatoare și trezește conștientizarea asupra efectelor overconsumption-ului și fast fashion-ului. Tema explorează fragilitatea lumii noastre, ilustrând cum alegerile în materie de modă contribuie la schimbările climatice. Invitații primesc un goodie bag cu produse de la sponsori și au acces la snack bar, într-o atmosferă vibrantă. Cauza susținută este ONG-ul "Micile Bucurii", care promovează viața în armonie cu natura prin economia circulară și afaceri locale sustenabile.', category:'cultural', participants:150, startDate:'2026-04-04', endDate:'2026-04-04', achievements:['Designeri tineri cu colecții sustenabile','Cauza: ONG Micile Bucurii','Goodie bags și snack bar pentru invitați'], image:'https://assets.vogue.com/photos/67c9df7ca1f72dd92fd6aee3/master/w_2560%2Cc_limit/holding-rtw.png', coordinator:'Ioana Coțofană & Marian Moroșan', teamMembers:['Ioana Coțofană — PM','Marian Moroșan — PM','Clara Stefan','Luca Horridge','Anne Ionescu','Matei Tulpan','Daria Ghiță'], location:'București', impact:'Conștientizarea publicului față de overconsumption și promovarea modei sustenabile.' },
        { id:3, title:'Beneath the Self VII — Prin ochii celuilalt', shortDescription:'Festival de artă scenică ce oferă tinerilor un cadru de exprimare prin teatru, muzică și dans, susținând cauza HOSPICE Casa Speranței.', fullDescription:'Beneath the Self este un proiect marca Interact Cișmigiu care oferă tinerilor artiști un cadru de exprimare prin teatru, muzică, dans și alte forme de creație. Tema ediției a VII-a, "Prin ochii celuilalt", abordează legăturile dintre oameni și modul în care acestea modelează identitatea. Momentele artistice explorează ideea de apropiere între indivizi prin empatie. Evenimentul include un concurs de poezii și monologuri jurizat de actori și profesioniști. Cauza susținută este HOSPICE Casa Speranței, care oferă servicii gratuite de îngrijire paliativă pentru persoanele cu boli incurabile și familiile lor.', category:'cultural', participants:200, startDate:'2025-09-15', endDate:'2026-05-31', achievements:['Concurs de poezii și monologuri','Cauza: HOSPICE Casa Speranței','6 ediții anterioare de succes'], image:'https://www.bucurestifm.ro/wp-content/uploads/2026/02/onb-850x479.jpg', coordinator:'Clara Ștefan & Iarina Dimoftache', teamMembers:['Clara Ștefan — PM','Iarina Dimoftache — PM','Ana Tudorache','Daria Ghiță','Karina Pantazi','Iris Ioan','Amalia Mărăzeanu','Luca Horridge','Maria Oneață'], location:'București', impact:'Fonduri strânse pentru HOSPICE Casa Speranței și promovarea artei scenice în rândul tinerilor.' },
        { id:4, title:'Movie Night IV — Beyond Burnout', shortDescription:'Seară de film în aer liber cu proiecția filmului The Devil Wears Prada, dedicată echilibrului dintre muncă și viața personală.', fullDescription:'Movie Night IV este un eveniment caritabil marca Interact Cișmigiu, în colaborare cu Interact București Triumph, ce constă într-o seară de film în aer liber cu tema "Beyond burnout". Evenimentul își propune să scoată în evidență importanța echilibrului între muncă și viața personală, transmis prin filmul "The Devil Wears Prada". Înainte de proiecție va vorbi un psiholog sau terapeut despre burnout. Invitații se bucură de băuturi și snacks de la sponsori, dar și de panouri cutout cu personaje din film. Scopul este susținerea asociației "Mental Health for Romania", care promovează sănătatea mintală și accesul la sprijin specializat.', category:'educatie', participants:100, startDate:'2026-05-16', endDate:'2026-05-16', achievements:['Film în aer liber: The Devil Wears Prada','Speaker psiholog despre burnout','Cauza: Mental Health for Romania'], image:'https://filmfaremiddleeast.com/wp-content/uploads/2025/01/movie-night.jpg', coordinator:'Merezeanu Amalia, Stroie Maria, Teodora Petrache & Mara Predescu', teamMembers:['Merezeanu Amalia — PM','Stroie Maria — PM','Teodora Petrache — PM','Mara Predescu — PM','Maria Oneață','Karina Pantazi','Clara Ștefan','Miles Frătăuceanu'], location:'În aer liber, București', impact:'Conștientizarea tinerilor despre burnout și fonduri pentru Mental Health for Romania.' },
        { id:5, title:"Roaring '20s II — 1920s vs. 2020s", shortDescription:"O călătorie muzicală în timp unde eleganța jazz-ului din anii '20 se întâlnește cu beat-urile moderne, susținând Asociația Casa Bună.", fullDescription:"Roaring '20s este un proiect marca Interact Cișmigiu cu scop caritabil, ce reprezintă o călătorie în timp unde eleganța jazzului și swing-ului din anii 1920 se împletește cu beat-urile moderne de hip-hop, pop și EDM. Ajuns la a doua ediție, evenimentul păstrează farmecul original și aduce surprize noi. Atmosfera se animă cu sesiuni de karaoke și o tombolă cu premii neașteptate. Cauza susținută este Asociația Casa Bună, o ONG care lucrează cu copii vulnerabili din România pentru reducerea abandonului școlar și creșterea performanțelor academice, oferind și sprijin material familiilor cu venituri mici.", category:'cultural', participants:120, startDate:'2026-01-17', endDate:'2026-01-17', achievements:['Karaoke și tombolă cu premii','Cauza: Asociația Casa Bună','A doua ediție a evenimentului'], image:'https://i.natgeofe.com/n/d9ef9444-b546-4312-8b19-093ecde5ede4/GettyImages-515138570.jpg', coordinator:'Ioan Iris & Crăciun Sebastian', teamMembers:['Ioan Iris — PM','Crăciun Sebastian — PM'], location:'București', impact:'Fonduri pentru copiii vulnerabili din România prin Asociația Casa Bună și o experiență culturală inedită.' },
        { id:6, title:'Activism for Today', shortDescription:'Proiect continuu de voluntariat prin care vizităm aziluri de bătrâni, adăposturi, afterschooluri, școli și centre pentru copii cu dizabilități.', fullDescription:'Activism for Today este un proiect marca Interact Cișmigiu dedicat implicării directe și constante în comunitate. Pe parcursul anului, membrii clubului vizitează și sprijină o varietate de cauze sociale: aziluri de bătrâni, adăposturi, afterschooluri, școli gimnaziale și primare, dar și centre pentru copii cu dizabilități. Fiecare vizită aduce nu doar donații materiale, ci și prezență umană, activități recreative și suport emoțional pentru cei care au nevoie. Proiectul reflectă valorile fundamentale ale Interact Cișmigiu — empatie, responsabilitate și acțiune concretă — și demonstrează că activismul nu este un eveniment izolat, ci un stil de viață.', category:'social', participants:50, startDate:'2025-09-01', endDate:'2026-06-30', achievements:['Vizite la aziluri de bătrâni','Sprijin pentru adăposturi și afterschooluri','Activități în centre pentru copii cu dizabilități'], image:'https://www.aristotle.com/wp-content/uploads/2022/05/pexels-markus-spiske-2990644.jpg', coordinator:'Interact Cișmigiu', teamMembers:['Membrii și aspiranții clubului','Voluntari activi'], location:'București — multiple locații', impact:'Sprijin continuu pentru categorii vulnerabile din comunitate pe tot parcursul anului școlar.' },
      ],
    },
    en: {
      title: 'Our Volunteering',
      titleAccent: 'Projects',
      subtitle: 'Youth-led initiatives for the community — from urban ecology to social aid, culture and education.',
      eyebrow: '// PROJECTS · INTERACT CISMIGIU',
      downloadBtn: 'Open PDF brochure',
      viewDetails: 'Details',
      closeModal: 'Close',
      projectOverview: 'Overview',
      projectDetails: 'Project Details',
      calendarBtn: 'Project calendar',
      calendarTitle: 'Project calendar',
      calendarSub: 'Every event, in chronological order.',
      addToCalendarOne: 'Add to calendar',
      reserve: 'Reserve',
      reserved: 'Reserved',
      pdf: 'PDF',
      reserveModalTitle: 'Reserve your spot',
      reserveModalSub: 'Fill in the form to reserve your spot at this event.',
      minDonationLabel: 'Minimum donation to attend',
      minDonationNote: 'Paid at the event — it goes directly towards Interact Cișmigiu projects.',
      fieldName: 'Full name',
      fieldEmail: 'Email address',
      fieldPhone: 'Phone number',
      submitReservation: 'Submit reservation',
      reserveErrorMsg: 'Please fill in all fields correctly.',
      reserveNetworkError: 'Something went wrong. Please try again.',
      reserveSubmitting: 'Submitting…',
      calExportAll: 'Export all',
      calFilterEmpty: 'No events for this filter.',
      reservationDoneTitle: 'Reservation confirmed!',
      reservationDoneSub: "Thank you! We'll see you at the event.",
      alreadyReservedTitle: 'You already have a spot',
      alreadyReservedSub: 'Your spot for this event is confirmed.',
      cancelReservation: 'Cancel reservation',
      cancel: 'Cancel',
      adminBtn: 'Admin',
      adminTitle: 'Reservations — internal panel',
      adminSub: 'Visible to organisers only.',
      adminEmpty: 'No reservations yet.',
      adminExport: 'Export to Excel (CSV)',
      adminClose: 'Close',
      adminPasswordPrompt: 'Enter the organiser password:',
      adminWrongPassword: 'Incorrect password.',
      colName: 'Name', colEmail: 'Email', colPhone: 'Phone', colProject: 'Event', colDonation: 'Donation', colDate: 'Date',
      categories: [
        { id: 'all',      name: 'All',       icon: Star },
        { id: 'ecologie', name: 'Ecology',   icon: Leaf },
        { id: 'social',   name: 'Social',    icon: HandHeart },
        { id: 'educatie', name: 'Education', icon: BookOpen },
        { id: 'cultural', name: 'Cultural',  icon: Music },
      ],
      labels: {
        coordinator: 'Coordinator', period: 'Period', team: 'Team',
        participants: 'Participants', location: 'Location',
        active: 'Active',
        achievements: 'Achievements', impact: 'Impact',
        volunteers: 'volunteers involved',
      },
      projects: [
        { id:1, title:'Maze of Fire II', shortDescription:'An interactive treasure hunt inspired by The Shining, a mysterious urban journey through the most iconic landmarks of Bucharest.', fullDescription:'Maze of Fire II is an interactive treasure hunt inspired by Stephen King\'s novel The Shining, designed to challenge both mind and spirit. The event brings together 80 participants who set off in groups on a mysterious urban journey through iconic Bucharest landmarks: Piața Romană, ASE, Casa Universitarilor, the Romanian Athenaeum, Kretzulescu Church, Revolution Square, the Telephone Palace, and Cișmigiu Garden. Each stop contains a clue or challenge, as well as characters from the story. Participation includes a 30 RON fee covering access and a goodie bag full of surprises. All funds collected go towards future Interact Cișmigiu activities and projects.', category:'cultural', participants:80, startDate:'2026-04-27', endDate:'2026-04-27', achievements:['80 participants in groups','Route through 8 historic Bucharest landmarks','Funds for Interact Cișmigiu projects'], image:'https://makingteams.com/wp-content/uploads/2024/10/Treasure-Hunt-Games-for-Team-Building-1.png', coordinator:'Andreea Ciobanu & Sebastian Scoarță', teamMembers:['Andreea Ciobanu — PM','Sebastian Scoarță — PM','Iris Ionescu','Karina Pantazi','Maria Oneață','Theodora Coțofană'], location:'Piața Romană → Cișmigiu Garden, Bucharest', impact:'A unique learning experience through teamwork, critical thinking and creativity for 80 young people.' },
        { id:2, title:'Fashion Show X — The Great Unravel', shortDescription:'A fashion show with an ecological and social message, combining elegance with responsibility for the planet, supporting the NGO Micile Bucurii.', fullDescription:'"The Great Unravel" is an Interact Cișmigiu fashion show combining the elegance of fashion with a powerful message of social and ecological responsibility. The event creates a space where designers can showcase innovative creations while raising awareness about the effects of overconsumption and fast fashion. The theme explores the fragility of our world, illustrating how fashion choices contribute to climate change. Guests receive a goodie bag with sponsor products and access to a snack bar in a vibrant atmosphere. The supported cause is the NGO "Micile Bucurii", which promotes life in harmony with nature through circular economy and sustainable local businesses.', category:'cultural', participants:150, startDate:'2026-04-04', endDate:'2026-04-04', achievements:['Young designers with sustainable collections','Cause: NGO Micile Bucurii','Goodie bags and snack bar for guests'], image:'https://assets.vogue.com/photos/67c9df7ca1f72dd92fd6aee3/master/w_2560%2Cc_limit/holding-rtw.png', coordinator:'Ioana Coțofană & Marian Moroșan', teamMembers:['Ioana Coțofană — PM','Marian Moroșan — PM','Clara Stefan','Luca Horridge','Anne Ionescu','Matei Tulpan','Daria Ghiță'], location:'Bucharest', impact:'Raising public awareness about overconsumption and promoting sustainable fashion.' },
        { id:3, title:'Beneath the Self VII — Through Another\'s Eyes', shortDescription:'A performing arts festival offering young artists a framework for expression through theatre, music and dance, supporting HOSPICE Casa Speranței.', fullDescription:'Beneath the Self is an Interact Cișmigiu project offering young artists a framework for expression through theatre, music, dance and other creative forms. The theme of the 7th edition, "Through Another\'s Eyes", explores the connections between people and how they shape identity. The artistic moments explore the idea of closeness between individuals through empathy. The event includes a poetry and monologue competition judged by actors and arts professionals. The supported cause is HOSPICE Casa Speranței, which provides free palliative care services for people with incurable illnesses and their families.', category:'cultural', participants:200, startDate:'2025-09-15', endDate:'2026-05-31', achievements:['Poetry and monologue competition','Cause: HOSPICE Casa Speranței','6 previous successful editions'], image:'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=600', coordinator:'Clara Ștefan & Iarina Dimoftache', teamMembers:['Clara Ștefan — PM','Iarina Dimoftache — PM','Ana Tudorache','Daria Ghiță','Karina Pantazi','Iris Ioan','Amalia Mărăzeanu','Luca Horridge','Maria Oneață'], location:'Bucharest', impact:'Funds raised for HOSPICE Casa Speranței and promotion of performing arts among young people.' },
        { id:4, title:'Movie Night IV — Beyond Burnout', shortDescription:'An outdoor movie night screening The Devil Wears Prada, dedicated to the balance between work and personal life.', fullDescription:'Movie Night IV is a charitable event by Interact Cișmigiu, in collaboration with Interact București Triumph, consisting of an outdoor movie screening under the theme "Beyond Burnout". The event highlights the importance of work-life balance, conveyed through the film "The Devil Wears Prada". Before the screening, a psychologist or therapist will speak about burnout. Guests enjoy drinks and snacks from sponsors, as well as photo opportunities at character cutout panels. The goal is to support the association "Mental Health for Romania", which promotes mental health and access to specialised support.', category:'educatie', participants:100, startDate:'2026-05-16', endDate:'2026-05-16', achievements:['Outdoor screening: The Devil Wears Prada','Psychologist speaker on burnout','Cause: Mental Health for Romania'], image:'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600', coordinator:'Merezeanu Amalia, Stroie Maria, Teodora Petrache & Mara Predescu', teamMembers:['Merezeanu Amalia — PM','Stroie Maria — PM','Teodora Petrache — PM','Mara Predescu — PM','Maria Oneață','Karina Pantazi','Clara Ștefan','Miles Frătăuceanu'], location:'Outdoor, Bucharest', impact:'Raising youth awareness about burnout and funds for Mental Health for Romania.' },
        { id:5, title:"Roaring '20s II — 1920s vs. 2020s", shortDescription:"A musical time-travel event where the elegance of jazz from the '20s meets modern beats, supporting Asociația Casa Bună.", fullDescription:"Roaring '20s is a charitable Interact Cișmigiu project representing a journey through time where the elegance of 1920s jazz and swing intertwines with modern hip-hop, pop and EDM beats. Now in its second edition, the event retains its original charm while bringing new surprises. The atmosphere comes alive with karaoke sessions and a tombola with unexpected prizes. The supported cause is Asociația Casa Bună, an NGO working with vulnerable children in Romania to reduce school dropout rates and improve academic performance, while also providing material support to low-income families.", category:'cultural', participants:120, startDate:'2026-01-17', endDate:'2026-01-17', achievements:['Karaoke and prize tombola','Cause: Asociația Casa Bună','Second edition of the event'], image:'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600', coordinator:'Ioan Iris & Crăciun Sebastian', teamMembers:['Ioan Iris — PM','Crăciun Sebastian — PM'], location:'Bucharest', impact:'Funds for vulnerable children in Romania through Asociația Casa Bună and a unique cultural experience.' },
        { id:6, title:'Activism for Today', shortDescription:'An ongoing volunteering project through which we visit care homes, shelters, after-school programmes, schools and centres for children with disabilities.', fullDescription:'Activism for Today is an Interact Cișmigiu project dedicated to direct and consistent community involvement. Throughout the year, club members visit and support a variety of social causes: care homes for the elderly, shelters, after-school programmes, primary and middle schools, as well as centres for children with disabilities. Each visit brings not only material donations, but also human presence, recreational activities and emotional support for those in need. The project reflects the core values of Interact Cișmigiu — empathy, responsibility and concrete action — and demonstrates that activism is not an isolated event, but a way of life.', category:'social', participants:50, startDate:'2025-09-01', endDate:'2026-06-30', achievements:['Visits to care homes for the elderly','Support for shelters and after-school programmes','Activities at centres for children with disabilities'], image:'https://images.pexels.com/photos/7551442/pexels-photo-7551442.jpeg?auto=compress&cs=tinysrgb&w=600', coordinator:'Interact Cișmigiu', teamMembers:['Club members and aspirants','Active volunteers'], location:'Bucharest — multiple locations', impact:'Continuous support for vulnerable groups throughout the school year.' },
      ],
    },
  };

  // Category visual config — each category maps to one of the site's four
  // brand hues, so the color itself tells you what kind of project it is.
  const catConfig: Record<string, { hex: string; hexL: string }> = {
    ecologie: { hex: '#0067c8', hexL: '#4fa3e8' }, // azure
    social:   { hex: '#a0223d', hexL: '#c9536e' }, // cranberry
    educatie: { hex: '#17458f', hexL: '#4877bd' }, // royal
    cultural: { hex: '#f7a81b', hexL: '#ffcf5c' }, // gold
  };

  const text = content[language];
  const filteredProjects = selectedCategory === 'all'
    ? text.projects
    : text.projects.filter(p => p.category === selectedCategory);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const fmtMonth = (d: string) =>
    new Date(d).toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-US', { year: 'numeric', month: 'long' });

  const selectedData = selectedProject ? text.projects.find(p => p.id === selectedProject) : null;
  const reserveData = reserveTarget ? text.projects.find(p => p.id === reserveTarget) : null;

  const handleOpenPDF = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (PDF_FILES[projectId]) {
      window.open(PDF_FILES[projectId], '_blank', 'noopener,noreferrer');
    }
  };

  const openReserve = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    setReserveTarget(projectId);
    setReserveForm({ name: '', email: '', phone: '' });
    setReserveError('');
    setReserveDone(false);
  };

  const closeReserve = () => { setReserveTarget(null); setReserveDone(false); setReserveError(''); };

  const submitReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone } = reserveForm;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const phoneOk = phone.trim().replace(/[^0-9+]/g, '').length >= 9;
    if (!name.trim() || !emailOk || !phoneOk || !reserveData) {
      setReserveError(text.reserveErrorMsg);
      return;
    }
    const id = `${reserveData.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const record: Reservation = {
      id,
      projectId: reserveData.id,
      projectTitle: reserveData.title,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      minDonation: MIN_DONATION_RON,
      timestamp: new Date().toISOString(),
    };
    setReserveSubmitting(true);
    try {
      await set(ref(db, `reservations/${id}`), record);
      const nextMap = { ...reservedMap, [record.projectId]: id };
      persistReservedMap(nextMap);
      setReserveError('');
      setReserveDone(true);
    } catch {
      setReserveError(text.reserveNetworkError);
    } finally {
      setReserveSubmitting(false);
    }
  };

  const cancelExistingReservation = async (projectId: number) => {
    const id = reservedMap[projectId];
    if (id) {
      try { await remove(ref(db, `reservations/${id}`)); } catch { /* best-effort */ }
    }
    const nextMap = { ...reservedMap };
    delete nextMap[projectId];
    persistReservedMap(nextMap);
    closeReserve();
  };

  const addProjectToCalendar = (p: typeof text.projects[number]) => {
    const ics = buildICS(p.title, p.location, p.shortDescription, p.startDate, p.endDate);
    downloadFile(`${p.title.replace(/[^a-z0-9]+/gi, '-')}.ics`, ics, 'text/calendar;charset=utf-8');
  };

  const totalVolunteers = text.projects.reduce((s, p) => s + p.participants, 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const relativeLabel = (d: string) => {
    const diffDays = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    if (diffDays < 0) return language === 'ro' ? 'Trecut' : 'Past';
    if (diffDays === 0) return language === 'ro' ? 'Astăzi' : 'Today';
    if (diffDays === 1) return language === 'ro' ? 'Mâine' : 'Tomorrow';
    if (diffDays <= 30) return language === 'ro' ? `+${diffDays} zile` : `+${diffDays}d`;
    return '';
  };

  const calProjects = calFilter === 'all' ? text.projects : text.projects.filter(p => p.category === calFilter);
  const chronological = [...calProjects].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const calendarGroups: { month: string; items: typeof text.projects }[] = [];
  chronological.forEach(p => {
    const m = fmtMonth(p.startDate);
    const g = calendarGroups.find(g => g.month === m);
    if (g) g.items.push(p); else calendarGroups.push({ month: m, items: [p] });
  });

  const exportAllToCalendar = () => {
    const ics = buildICSMulti(chronological.map(p => ({ title: p.title, location: p.location, description: p.shortDescription, startDate: p.startDate, endDate: p.endDate })));
    downloadFile('interact-cismigiu-calendar.ics', ics, 'text/calendar;charset=utf-8');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');

        .pj { --royal:#17458f; --azure:#0067c8; --gold:#f7a81b; --gold-l:#ffcf5c; --cranberry:#a0223d;
              --ink:#12233f; --card:#fffdf7; --slate:#5c6c88;
              --txt:#eef3ff; --txt-mute:rgba(226,236,255,0.7);
              font-family:'Inter',sans-serif; background:#050a1e; color:var(--txt);
              padding:100px 0 110px; position:relative; overflow:hidden; }
        .pj * { box-sizing:border-box; }
        .pj a { text-decoration:none; color:inherit; }

        /* ══ PHOTO BACKGROUND — same tiled club photos + navy overlay as About / TeamPage ══ */
        .pj-photo-bg { position:absolute; inset:0; z-index:0; display:flex; flex-wrap:wrap; overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.48); transform:scale(1.08); }
        .pj-photo-bg img { flex:1 1 260px; height:260px; object-fit:cover; display:block; }
        .pj-photo-overlay { position:absolute; inset:0; z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%); }

        .pj-continuity { position:absolute; top:0; left:0; right:0; height:200px; z-index:1; pointer-events:none;
          background:linear-gradient(to bottom, #050a1e 0%, rgba(5,10,30,0.5) 55%, rgba(5,10,30,0) 100%); }

        .pj .wrap { max-width:1180px; margin:0 auto; padding:0 28px; position:relative; z-index:2; }

        @keyframes pjRise { from{opacity:0; transform:translateY(28px)} to{opacity:1; transform:translateY(0)} }
        @keyframes pjPin { from{opacity:0; transform:translateY(-10px) rotate(var(--r,0deg)) scale(.9)} to{opacity:1; transform:translateY(0) rotate(var(--r,0deg)) scale(1)} }
        @keyframes pjDot { 0%,100%{box-shadow:0 0 5px rgba(255,207,92,.7); transform:scale(1)} 50%{box-shadow:0 0 16px rgba(255,207,92,.9); transform:scale(1.25)} }
        @keyframes pjCardIn { from{opacity:0; transform:translateY(24px)} to{opacity:1; transform:translateY(0)} }
        @keyframes pjMbgIn { from{opacity:0} to{opacity:1} }
        @keyframes pjMboxIn { from{opacity:0; transform:scale(.94) translateY(24px)} to{opacity:1; transform:scale(1) translateY(0)} }
        @keyframes pjPulseGlow { 0%,100%{box-shadow:0 10px 26px rgba(0,103,200,0.38)} 50%{box-shadow:0 10px 34px rgba(0,103,200,0.6)} }
        @keyframes pjCheckPop { from{opacity:0; transform:scale(.6)} to{opacity:1; transform:scale(1)} }

        .pj-header-vis .pj-e0 { animation:pjRise .8s .0s cubic-bezier(.16,.8,.2,1) both; }
        .pj-header-vis .pj-e1 { animation:pjRise .9s .12s cubic-bezier(.16,.8,.2,1) both; }
        .pj-header-vis .pj-e2 { animation:pjRise .9s .24s cubic-bezier(.16,.8,.2,1) both; }
        .pj-header-vis .pj-e3 { animation:pjRise .9s .36s cubic-bezier(.16,.8,.2,1) both; }

        /* ══ HEADER ══ */
        .pj-eyebrow-row { display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; margin-bottom:22px; }
        .pj-eyebrow { font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:700; letter-spacing:.05em;
          color:#fff9e4; background:rgba(247,168,27,0.12); border:1.5px solid rgba(247,168,27,0.32);
          backdrop-filter:blur(6px); border-radius:100px; padding:7px 16px 7px 12px; display:inline-flex; align-items:center; gap:8px; }
        .pj-eyebrow-dot { width:7px; height:7px; border-radius:50%; background:var(--gold); animation:pjDot 2.6s ease-in-out infinite; flex-shrink:0; }

        /* prominent, high-attention calendar CTA */
        .pj-calendar-btn { all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:9px;
          font-family:'Space Grotesk',sans-serif; font-size:13.5px; font-weight:700; letter-spacing:.01em;
          color:#fff; background:linear-gradient(120deg, var(--azure), var(--royal));
          border-radius:100px; padding:12px 22px 12px 18px; cursor:pointer;
          box-shadow:0 10px 26px rgba(0,103,200,0.38);
          animation:pjPulseGlow 3.2s ease-in-out infinite;
          transition:transform .3s cubic-bezier(.34,1.56,.64,1), filter .3s; }
        .pj-calendar-btn:hover { transform:translateY(-3px) scale(1.02); filter:brightness(1.08); }
        .pj-calendar-btn svg { flex-shrink:0; }

        .pj-title { font-family:'Space Grotesk',sans-serif; font-weight:700; color:#fff; line-height:1.03;
          letter-spacing:-.02em; font-size:clamp(2.1rem,5.6vw,4rem); margin-bottom:18px; max-width:760px; }
        .pj-title em { font-style:normal; position:relative; display:inline-block;
          background:linear-gradient(100deg, #f4e2b8 0%, #f0c46e 22%, #f7a81b 48%, #c9861a 72%, #f0c46e 100%);
          background-size:220% auto; -webkit-background-clip:text; background-clip:text; color:transparent;
          animation:pjShimmer 7s linear infinite alternate; }
        @keyframes pjShimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }

        .pj-sub { font-family:'Inter',sans-serif; font-weight:300; font-size:clamp(14.5px,1.5vw,17px);
          color:var(--txt-mute); max-width:560px; line-height:1.75; margin-bottom:38px; }

        .pj-pin-row { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:52px; }
        .pj-pin { --r:0deg; background:var(--card); border-radius:10px; padding:14px 20px; text-align:center;
          transform:rotate(var(--r)); box-shadow:0 14px 28px rgba(0,0,0,0.35); position:relative;
          transition:transform .4s cubic-bezier(.22,.68,0,1.2), box-shadow .4s; min-width:110px;
          animation:pjPin .7s cubic-bezier(.22,.68,0,1.2) both; }
        .pj-pin:hover { transform:rotate(0deg) translateY(-4px); box-shadow:0 20px 38px rgba(0,0,0,0.42); }
        .pj-pin-dot { position:absolute; top:-8px; left:50%; transform:translateX(-50%); width:15px; height:15px; border-radius:50%;
          background:radial-gradient(circle at 35% 30%, #ffd873, var(--gold)); box-shadow:0 3px 6px rgba(0,0,0,0.3); }
        .pj-pin-v { font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:23px; color:var(--royal); }
        .pj-pin-l { font-family:'JetBrains Mono',monospace; font-size:9px; letter-spacing:.07em; text-transform:uppercase; color:var(--slate); margin-top:2px; }

        /* ══ FILTER NAV ══ */
        .pj-nav { display:flex; flex-wrap:wrap; gap:9px; margin-bottom:40px; }
        .pj-navbtn { all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:7px;
          padding:10px 20px; border-radius:100px; font-family:'Space Grotesk',sans-serif; font-size:12.5px; font-weight:700;
          cursor:pointer; border:1.5px solid rgba(255,255,255,0.16); color:var(--txt-mute);
          background:rgba(255,255,255,0.04); backdrop-filter:blur(6px);
          transition:all .3s cubic-bezier(.34,1.56,.64,1); }
        .pj-navbtn:hover { color:#fff; border-color:rgba(0,103,200,0.45); transform:translateY(-2px); }
        .pj-navbtn.active { background:linear-gradient(120deg, var(--azure), var(--royal)); color:#fff; border-color:var(--azure);
          box-shadow:0 10px 24px rgba(0,103,200,0.32); }

        /* ══ GRID — 3 columns × 2 rows, slimmer premium cards ══ */
        .pj-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        @media(max-width:900px) { .pj-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:560px) { .pj-grid { grid-template-columns:1fr; } }

        .pj-card { --accent:#17458f; --accent-l:#4877bd; background:var(--card); border-radius:14px; overflow:hidden;
          position:relative; display:flex; flex-direction:column; cursor:pointer;
          box-shadow:0 12px 24px rgba(0,0,0,0.32); border:1px solid rgba(255,255,255,0.06);
          transition:transform .4s cubic-bezier(.22,.68,0,1.2), box-shadow .4s;
          animation:pjCardIn .7s cubic-bezier(.16,.8,.2,1) both; }
        .pj-card:hover { transform:translateY(-6px); box-shadow:0 22px 42px rgba(0,0,0,0.45); }
        .pj-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg, var(--accent), var(--accent-l)); transform:scaleX(0); transform-origin:left;
          transition:transform .5s cubic-bezier(.22,.68,0,1.2); z-index:3; }
        .pj-card:hover::before { transform:scaleX(1); }

        .pj-img-wrap { position:relative; height:150px; overflow:hidden; flex-shrink:0; }
        .pj-img { width:100%; height:100%; object-fit:cover; transition:transform .8s cubic-bezier(.22,.68,0,1.2); display:block; }
        .pj-card:hover .pj-img { transform:scale(1.08); }
        .pj-img-overlay { position:absolute; inset:0;
          background:linear-gradient(to top, rgba(5,10,26,0.85) 0%, rgba(5,10,26,0.1) 55%, transparent 100%); }

        .pj-status { position:absolute; top:9px; left:9px; z-index:2; display:inline-flex; align-items:center; gap:5px;
          padding:3px 9px; border-radius:100px; font-family:'JetBrains Mono',monospace; font-size:8px; font-weight:700;
          letter-spacing:.05em; text-transform:uppercase; background:rgba(247,168,27,0.92); color:#12233f; }
        .pj-status-dot { width:4px; height:4px; border-radius:50%; background:#12233f; animation:pjDot 1.8s ease-in-out infinite; }

        .pj-cat-tag { position:absolute; bottom:9px; left:9px; z-index:2; display:inline-flex; align-items:center; gap:4px;
          padding:3px 8px; border-radius:7px; font-family:'JetBrains Mono',monospace; font-size:8px; font-weight:700;
          letter-spacing:.05em; text-transform:uppercase; backdrop-filter:blur(8px); }
        .pj-pcount { position:absolute; bottom:9px; right:9px; z-index:2; display:inline-flex; align-items:center; gap:3px;
          padding:2px 7px; border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:600;
          background:rgba(255,255,255,0.16); color:#fff; backdrop-filter:blur(5px); }

        .pj-body { padding:16px 16px 16px; display:flex; flex-direction:column; flex-grow:1; }
        .pj-card-title { font-family:'Space Grotesk',sans-serif; font-size:14.5px; font-weight:700; color:var(--ink);
          line-height:1.28; margin-bottom:6px; transition:color .3s;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; min-height:2.5em; }
        .pj-card:hover .pj-card-title { color:var(--accent); }
        .pj-desc { font-size:11.5px; color:var(--slate); line-height:1.6; margin-bottom:10px; font-weight:400;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }

        .pj-meta-line { display:flex; align-items:center; gap:8px; margin-bottom:12px;
          font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--slate); }
        .pj-meta-line span { display:inline-flex; align-items:center; gap:4px; }
        .pj-meta-line .dot { opacity:.4; }

        /* single, balanced row of exactly three buttons */
        .pj-btn-row { display:flex; gap:7px; margin-top:auto; }
        .pj-b { display:inline-flex; align-items:center; justify-content:center; gap:5px;
          font-family:'Space Grotesk',sans-serif; font-size:11.5px; font-weight:700; letter-spacing:.01em;
          border-radius:9px; padding:10px 10px; cursor:pointer; border:1.5px solid transparent; white-space:nowrap;
          transition:all .3s cubic-bezier(.34,1.56,.64,1); }
        .pj-b-details { flex:1.1; background:rgba(18,35,63,0.055); color:var(--ink); border-color:rgba(18,35,63,0.14); }
        .pj-b-details:hover { background:rgba(18,35,63,0.1); transform:translateY(-2px); }
        .pj-b-reserve { flex:1.1; background:linear-gradient(120deg, var(--azure), var(--royal)); color:#fff;
          box-shadow:0 8px 18px rgba(0,103,200,0.28); }
        .pj-b-reserve:hover { filter:brightness(1.08); transform:translateY(-2px); }
        .pj-b-reserve.is-reserved { background:linear-gradient(120deg,#1c9a55,#0f7a3f); box-shadow:0 8px 18px rgba(20,120,60,0.28); }
        .pj-b-pdf { flex:0 0 auto; width:44px; background:transparent; color:var(--accent); border-color:var(--accent); }
        .pj-b-pdf:hover { background:var(--accent); color:#fff; transform:translateY(-2px); }
        .pj-b-pdf:disabled { opacity:.3; cursor:not-allowed; }
        .pj-b-pdf:disabled:hover { background:transparent; color:var(--accent); transform:none; }

        /* ══ MODAL (project details) ══ */
        .pj-mbg { position:fixed; inset:0; z-index:9999; background:rgba(5,10,26,0.88); backdrop-filter:blur(14px);
          display:flex; align-items:center; justify-content:center; padding:16px; animation:pjMbgIn .35s ease; }
        .pj-mbox { background:var(--card); border-radius:20px; max-width:860px; width:100%; max-height:92vh; overflow-y:auto;
          animation:pjMboxIn .55s cubic-bezier(.22,.68,0,1.2); box-shadow:0 48px 100px rgba(0,0,0,0.5);
          border:1px solid rgba(255,255,255,0.08); }
        .pj-mbox::-webkit-scrollbar { width:4px; }
        .pj-mbox::-webkit-scrollbar-track { background:transparent; }
        .pj-mbox::-webkit-scrollbar-thumb { background:rgba(18,35,63,0.18); border-radius:4px; }

        .pj-mhero { position:relative; height:250px; overflow:hidden; border-radius:20px 20px 0 0; flex-shrink:0; }
        .pj-mhero img { width:100%; height:100%; object-fit:cover; display:block; }
        .pj-mhero-overlay { position:absolute; inset:0;
          background:linear-gradient(to top, rgba(5,10,26,0.92) 0%, rgba(5,10,26,0.25) 55%, transparent 100%); }
        .pj-mhero-close { position:absolute; top:14px; right:14px; z-index:2; width:36px; height:36px; border-radius:10px;
          background:rgba(255,255,255,0.14); backdrop-filter:blur(6px); border:1px solid rgba(255,255,255,0.2); color:#fff;
          cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all .3s; }
        .pj-mhero-close:hover { background:rgba(255,255,255,0.26); transform:rotate(90deg); }
        .pj-mhero-content { position:absolute; bottom:0; left:0; right:0; padding:22px 28px; }
        .pj-mhero-badges { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:11px; }
        .pj-mbadge { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:100px;
          font-family:'JetBrains Mono',monospace; font-size:9.5px; font-weight:700; backdrop-filter:blur(6px); letter-spacing:.05em; }
        .pj-mhero-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(1.4rem,3vw,2rem); font-weight:700; color:#fff;
          line-height:1.15; letter-spacing:-.02em; }

        .pj-mbody { padding:30px 28px 22px; }
        .pj-mbody-grid { display:grid; grid-template-columns:1fr 270px; gap:30px; }
        @media(max-width:720px) { .pj-mbody-grid { grid-template-columns:1fr; } }

        .pj-msection { margin-bottom:24px; }
        .pj-msection-head { display:flex; align-items:center; gap:9px; margin-bottom:12px; }
        .pj-msection-bar { width:3px; height:20px; border-radius:2px; flex-shrink:0; }
        .pj-msection-title { font-family:'Space Grotesk',sans-serif; font-size:15px; font-weight:700; color:var(--ink); }
        .pj-msection p { font-size:13.5px; color:var(--slate); line-height:1.8; font-weight:400; }

        .pj-impact-box { padding:16px 18px; border-radius:12px; border:1px solid rgba(247,168,27,0.28);
          background:rgba(247,168,27,0.07); position:relative; overflow:hidden; }
        .pj-impact-box::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
          background:linear-gradient(180deg, var(--gold), var(--gold-l)); }
        .pj-impact-box p { font-family:'Space Grotesk',sans-serif; font-size:13.5px; font-weight:500; font-style:italic;
          color:#7a4a00; margin-left:8px; line-height:1.55; }

        .pj-mach-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; border-radius:10px; margin-bottom:6px;
          background:rgba(18,35,63,0.03); border:1px solid rgba(18,35,63,0.07); transition:all .3s; }
        .pj-mach-item:hover { border-color:rgba(0,103,200,0.35); background:rgba(0,103,200,0.06); transform:translateX(4px); }
        .pj-mach-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; margin-top:5px; }
        .pj-mach-item span { font-size:13px; color:var(--ink); font-weight:400; }

        .pj-sidebar-card { background:rgba(18,35,63,0.03); border:1px solid rgba(18,35,63,0.08); border-radius:14px;
          padding:20px; position:sticky; top:16px; }
        .pj-sidebar-title { font-family:'Space Grotesk',sans-serif; font-size:14px; font-weight:700; color:var(--ink);
          padding-bottom:12px; margin-bottom:16px; border-bottom:1px solid rgba(18,35,63,0.1); }
        .pj-detail-row { margin-bottom:16px; }
        .pj-detail-label { display:flex; align-items:center; gap:6px; font-family:'JetBrains Mono',monospace; font-size:9px;
          font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--slate); margin-bottom:5px; }
        .pj-detail-val { font-size:13px; color:var(--ink); font-weight:400; line-height:1.5; }
        .pj-team-member { display:flex; align-items:center; gap:8px; font-size:12.5px; color:var(--ink); padding:3px 0; }

        .pj-mfooter { display:flex; justify-content:flex-end; gap:10px; padding:16px 28px;
          border-top:1px solid rgba(18,35,63,0.08); background:var(--card); flex-wrap:wrap; }
        .pj-mfooter button { display:inline-flex; align-items:center; gap:6px; }
        .pj-mfooter .btn-close { padding:11px 20px; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:12.5px;
          font-weight:600; cursor:pointer; border:1.5px solid rgba(18,35,63,0.16); background:transparent; color:var(--slate);
          transition:all .3s; }
        .pj-mfooter .btn-close:hover { background:rgba(18,35,63,0.04); color:var(--ink); }
        .pj-mfooter .btn-dl { padding:11px 22px; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:12.5px;
          font-weight:700; cursor:pointer; border:none; background:linear-gradient(120deg, var(--azure), var(--royal));
          color:#fff; transition:all .35s; }
        .pj-mfooter .btn-dl:hover { filter:brightness(1.08); transform:translateY(-2px); box-shadow:0 10px 22px rgba(0,103,200,0.32); }
        .pj-mfooter .btn-reserve { padding:11px 22px; border-radius:9px; font-family:'Space Grotesk',sans-serif; font-size:12.5px;
          font-weight:700; cursor:pointer; background:transparent; color:var(--azure); border:1.5px solid var(--azure); transition:all .3s; }
        .pj-mfooter .btn-reserve:hover { background:rgba(0,103,200,0.08); transform:translateY(-2px); }
        .pj-mfooter .btn-reserve.is-reserved { background:linear-gradient(120deg,#1c9a55,#0f7a3f); color:#fff; border-color:transparent; }

        /* ══ CALENDAR MODAL ══ */
        .pj-cal-box { background:var(--card); border-radius:20px; max-width:640px; width:100%; max-height:86vh; overflow-y:auto;
          animation:pjMboxIn .55s cubic-bezier(.22,.68,0,1.2); box-shadow:0 48px 100px rgba(0,0,0,0.5);
          border:1px solid rgba(255,255,255,0.08); }
        .pj-cal-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:24px 26px 18px;
          border-bottom:1px solid rgba(18,35,63,0.08); position:sticky; top:0; background:var(--card); z-index:2; }
        .pj-cal-head-title { font-family:'Space Grotesk',sans-serif; font-size:19px; font-weight:700; color:var(--ink); }
        .pj-cal-head-sub { font-size:12px; color:var(--slate); margin-top:3px; }
        .pj-cal-close { width:32px; height:32px; border-radius:9px; background:rgba(18,35,63,0.05); border:1px solid rgba(18,35,63,0.1);
          color:var(--slate); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0;
          transition:all .3s; }
        .pj-cal-close:hover { background:rgba(18,35,63,0.1); color:var(--ink); transform:rotate(90deg); }

        .pj-cal-filters { display:flex; flex-wrap:wrap; gap:6px; padding:14px 26px 4px; align-items:center; }
        .pj-cal-chip { all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:5px;
          padding:6px 12px; border-radius:100px; font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700;
          cursor:pointer; border:1.5px solid rgba(18,35,63,0.12); color:var(--slate); background:rgba(18,35,63,0.03);
          transition:all .25s cubic-bezier(.34,1.56,.64,1); }
        .pj-cal-chip:hover { color:var(--ink); border-color:rgba(0,103,200,0.35); transform:translateY(-1px); }
        .pj-cal-chip.active { background:linear-gradient(120deg, var(--azure), var(--royal)); color:#fff; border-color:var(--azure);
          box-shadow:0 6px 14px rgba(0,103,200,0.28); }
        .pj-cal-export-all { all:unset; box-sizing:border-box; display:inline-flex; align-items:center; gap:5px; margin-left:auto;
          padding:6px 12px; border-radius:100px; font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700;
          cursor:pointer; border:1.5px solid rgba(247,168,27,0.4); color:#7a4a00; background:rgba(247,168,27,0.1);
          transition:all .25s; white-space:nowrap; }
        .pj-cal-export-all:hover { background:rgba(247,168,27,0.2); transform:translateY(-1px); }

        .pj-cal-body { padding:10px 26px 26px; }
        .pj-cal-empty { text-align:center; padding:32px 10px; color:var(--slate); font-size:13px; font-style:italic; }
        .pj-cal-month { font-family:'JetBrains Mono',monospace; font-size:10.5px; font-weight:700; letter-spacing:.12em;
          text-transform:uppercase; color:var(--azure); margin:20px 0 10px; }
        .pj-cal-row { display:flex; align-items:center; gap:10px; padding:11px 12px; border-radius:10px;
          background:rgba(18,35,63,0.025); border:1px solid rgba(18,35,63,0.06); margin-bottom:6px; transition:all .25s; }
        .pj-cal-row:hover { background:rgba(0,103,200,0.06); border-color:rgba(0,103,200,0.3); transform:translateX(3px); }
        .pj-cal-row.is-past { opacity:.5; }
        .pj-cal-row.is-past:hover { opacity:.8; }
        .pj-cal-date { font-family:'Space Grotesk',sans-serif; font-size:12px; font-weight:700; color:var(--ink); min-width:78px; cursor:pointer; }
        .pj-cal-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .pj-cal-title { flex:1; font-size:12.5px; color:var(--ink); font-weight:500; cursor:pointer;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pj-cal-relative { flex-shrink:0; font-family:'JetBrains Mono',monospace; font-size:9px; font-weight:700;
          letter-spacing:.03em; text-transform:uppercase; color:var(--azure); background:rgba(0,103,200,0.08);
          border:1px solid rgba(0,103,200,0.22); border-radius:100px; padding:2px 8px; }
        .pj-cal-relative.is-today { color:#7a4a00; background:rgba(247,168,27,0.14); border-color:rgba(247,168,27,0.4); }
        .pj-cal-count { font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--slate); flex-shrink:0; }
        .pj-cal-ics { flex-shrink:0; width:26px; height:26px; border-radius:7px; border:1.5px solid rgba(0,103,200,0.35);
          background:rgba(0,103,200,0.08); color:var(--azure); display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .25s; }
        .pj-cal-ics:hover { background:var(--azure); color:#fff; transform:scale(1.08); }

        /* ══ RESERVATION MODAL ══ */
        .pj-res-box { background:var(--card); border-radius:20px; max-width:440px; width:100%; max-height:92vh; overflow-y:auto;
          animation:pjMboxIn .5s cubic-bezier(.22,.68,0,1.2); box-shadow:0 48px 100px rgba(0,0,0,0.5);
          border:1px solid rgba(255,255,255,0.08); }
        .pj-res-head { padding:22px 26px 4px; }
        .pj-res-close-row { display:flex; justify-content:flex-end; }
        .pj-res-close { width:30px; height:30px; border-radius:9px; background:rgba(18,35,63,0.05); border:1px solid rgba(18,35,63,0.1);
          color:var(--slate); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .3s; }
        .pj-res-close:hover { background:rgba(18,35,63,0.1); color:var(--ink); transform:rotate(90deg); }
        .pj-res-title { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; color:var(--ink); margin:6px 0 4px; }
        .pj-res-sub { font-size:12.5px; color:var(--slate); line-height:1.6; margin-bottom:6px; }
        .pj-res-project { display:flex; align-items:center; gap:6px; font-family:'JetBrains Mono',monospace; font-size:10.5px;
          font-weight:700; color:var(--azure); letter-spacing:.03em; margin-bottom:16px; }

        .pj-res-body { padding:6px 26px 26px; }

        .pj-donation-box { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:12px; margin-bottom:20px;
          background:rgba(247,168,27,0.09); border:1.5px solid rgba(247,168,27,0.32); }
        .pj-donation-amount { font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; color:#7a4a00; flex-shrink:0; }
        .pj-donation-text p:first-child { font-family:'Space Grotesk',sans-serif; font-size:12.5px; font-weight:700; color:var(--ink); }
        .pj-donation-text p:last-child { font-size:11px; color:var(--slate); margin-top:2px; line-height:1.5; }

        .pj-field { margin-bottom:14px; }
        .pj-field label { display:flex; align-items:center; gap:6px; font-family:'JetBrains Mono',monospace; font-size:9.5px;
          font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--slate); margin-bottom:6px; }
        .pj-field input { width:100%; padding:11px 13px; border-radius:9px; border:1.5px solid rgba(18,35,63,0.15);
          font-family:'Inter',sans-serif; font-size:13.5px; color:var(--ink); background:#fff; outline:none;
          transition:border-color .25s, box-shadow .25s; }
        .pj-field input:focus { border-color:var(--azure); box-shadow:0 0 0 3px rgba(0,103,200,0.12); }
        .pj-field input::placeholder { color:rgba(18,35,63,0.32); }

        .pj-res-error { font-size:11.5px; color:var(--cranberry); font-weight:600; margin:2px 0 12px; }

        .pj-res-submit { width:100%; padding:13px; border-radius:10px; border:none; cursor:pointer;
          font-family:'Space Grotesk',sans-serif; font-size:13.5px; font-weight:700; color:#fff;
          background:linear-gradient(120deg, var(--azure), var(--royal)); box-shadow:0 10px 22px rgba(0,103,200,0.3);
          display:flex; align-items:center; justify-content:center; gap:8px; margin-top:4px;
          transition:all .3s cubic-bezier(.34,1.56,.64,1); }
        .pj-res-submit:hover { filter:brightness(1.08); transform:translateY(-2px); }

        .pj-res-success { text-align:center; padding:16px 8px 8px; }
        .pj-res-check { width:60px; height:60px; border-radius:50%; margin:0 auto 16px; display:flex; align-items:center; justify-content:center;
          background:linear-gradient(120deg,#1c9a55,#0f7a3f); color:#fff; animation:pjCheckPop .4s cubic-bezier(.34,1.56,.64,1) both; }
        .pj-res-success h3 { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:var(--ink); margin-bottom:6px; }
        .pj-res-success p { font-size:13px; color:var(--slate); line-height:1.6; margin-bottom:18px; }

        .pj-already { text-align:center; padding:10px 8px 8px; }
        .pj-already-icon { width:56px; height:56px; border-radius:50%; margin:0 auto 14px; display:flex; align-items:center; justify-content:center;
          background:rgba(0,103,200,0.1); color:var(--azure); }
        .pj-already h3 { font-family:'Space Grotesk',sans-serif; font-size:17px; font-weight:700; color:var(--ink); margin-bottom:6px; }
        .pj-already p { font-size:12.5px; color:var(--slate); line-height:1.6; margin-bottom:18px; }
        .pj-already-cancel { width:100%; padding:12px; border-radius:10px; cursor:pointer; font-family:'Space Grotesk',sans-serif;
          font-size:12.5px; font-weight:700; background:transparent; color:var(--cranberry); border:1.5px solid rgba(160,34,61,0.35);
          transition:all .3s; }
        .pj-already-cancel:hover { background:rgba(160,34,61,0.06); }

        @media(max-width:520px) {
          .pj { padding:70px 0 90px; }
        }
      `}</style>

      <section className="pj" ref={secRef as React.RefObject<HTMLElement>} id="projects">
        <div className="pj-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="pj-photo-overlay" />
        <div className="pj-continuity" />

        <div className="wrap">

          <header className="pj-header-vis" ref={headerRef as React.RefObject<HTMLDivElement>}>
            <div className="pj-eyebrow-row pj-e0">
              <span className="pj-eyebrow">
                <span className="pj-eyebrow-dot" />
                {text.eyebrow}
              </span>
              <button className="pj-calendar-btn" onClick={() => setShowCalendar(true)}>
                <CalendarDays style={{ width: 18, height: 18 }} />
                {text.calendarBtn}
              </button>
            </div>
            <h1 className="pj-title pj-e1">
              {text.title}<br /><em>{text.titleAccent}</em>
            </h1>
            <p className="pj-sub pj-e2">{text.subtitle}</p>

            <div className="pj-pin-row pj-e2">
              {[
                { v: text.projects.length, l: language === 'ro' ? 'Proiecte' : 'Projects' },
                { v: `${totalVolunteers}+`, l: language === 'ro' ? 'Voluntari' : 'Volunteers' },
                { v: 5, l: language === 'ro' ? 'Cauze' : 'Causes' },
                { v: 4, l: language === 'ro' ? 'Domenii' : 'Focus Areas' },
              ].map((s, i) => (
                <div key={i} className="pj-pin" style={{ '--r': `${(i % 2 === 0 ? -1 : 1) * (2 + i)}deg`, animationDelay: `${0.5 + i * 0.1}s` } as React.CSSProperties}>
                  <div className="pj-pin-dot" />
                  <div className="pj-pin-v">{s.v}</div>
                  <div className="pj-pin-l">{s.l}</div>
                </div>
              ))}
            </div>
          </header>

          <nav className="pj-nav pj-e3">
            {text.categories.map(cat => (
              <button
                key={cat.id}
                className={`pj-navbtn${selectedCategory === cat.id ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <cat.icon style={{ width: 14, height: 14 }} />
                {cat.name}
              </button>
            ))}
          </nav>

          <div className="pj-grid" ref={gridRef}>
            {filteredProjects.map((project, idx) => {
              const cfg = catConfig[project.category] ?? catConfig.ecologie;
              const catLabel = text.categories.find(c => c.id === project.category);
              const hasPDF = !!PDF_FILES[project.id];
              const isReserved = reservedIds.has(project.id);

              return (
                <article
                  key={project.id}
                  className="pj-card"
                  style={{ '--accent': cfg.hex, '--accent-l': cfg.hexL, animationDelay: `${idx * 0.06}s` } as React.CSSProperties}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="pj-img-wrap">
                    <img src={project.image} alt={project.title} className="pj-img" loading="lazy" />
                    <div className="pj-img-overlay" />
                    <div className="pj-status"><span className="pj-status-dot" />{text.labels.active}</div>
                    <div className="pj-cat-tag" style={{ background: `${cfg.hex}26`, color: cfg.hexL, border: `1px solid ${cfg.hex}55` }}>
                      {catLabel && <catLabel.icon style={{ width: 10, height: 10 }} />}
                      {catLabel?.name}
                    </div>
                    <div className="pj-pcount"><Users style={{ width: 10, height: 10 }} />{project.participants}</div>
                  </div>

                  <div className="pj-body">
                    <h2 className="pj-card-title">{project.title}</h2>
                    <p className="pj-desc">{project.shortDescription}</p>

                    <div className="pj-meta-line">
                      <span><Users style={{ width: 11, height: 11 }} />{project.participants}</span>
                      <span className="dot">•</span>
                      <span><Calendar style={{ width: 11, height: 11 }} />{fmtDate(project.startDate)}</span>
                    </div>

                    <div className="pj-btn-row">
                      <button className="pj-b pj-b-details" onClick={(e) => { e.stopPropagation(); setSelectedProject(project.id); }}>
                        {text.viewDetails}
                        <ChevronRight style={{ width: 13, height: 13 }} />
                      </button>
                      <button
                        className={`pj-b pj-b-reserve${isReserved ? ' is-reserved' : ''}`}
                        onClick={(e) => openReserve(e, project.id)}
                      >
                        {isReserved ? <Check style={{ width: 13, height: 13 }} /> : <CalendarCheck style={{ width: 13, height: 13 }} />}
                        {isReserved ? text.reserved : text.reserve}
                      </button>
                      <button
                        className="pj-b pj-b-pdf"
                        disabled={!hasPDF}
                        onClick={e => hasPDF && handleOpenPDF(e, project.id)}
                        title={text.pdf}
                      >
                        <FileText style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {selectedProject && selectedData && (() => {
          const cfg = catConfig[selectedData.category] ?? catConfig.ecologie;
          const catLabel = text.categories.find(c => c.id === selectedData.category);
          const hasPDF = !!PDF_FILES[selectedData.id];
          const isReserved = reservedIds.has(selectedData.id);
          return (
            <div className="pj-mbg" onClick={() => setSelectedProject(null)}>
              <div className="pj-mbox" onClick={e => e.stopPropagation()}>

                <div className="pj-mhero">
                  <img src={selectedData.image} alt={selectedData.title} />
                  <div className="pj-mhero-overlay" />
                  <button className="pj-mhero-close" onClick={() => setSelectedProject(null)}>✕</button>
                  <div className="pj-mhero-content">
                    <div className="pj-mhero-badges">
                      <span className="pj-mbadge" style={{ background: 'rgba(247,168,27,0.9)', color: '#12233f' }}>
                        <span className="pj-status-dot" />{text.labels.active}
                      </span>
                      <span className="pj-mbadge" style={{ background: `${cfg.hex}30`, color: '#fff', border: `1px solid ${cfg.hex}70` }}>
                        {catLabel && <catLabel.icon style={{ width: 11, height: 11 }} />}
                        {catLabel?.name}
                      </span>
                      <span className="pj-mbadge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                        <Users style={{ width: 11, height: 11 }} />
                        {selectedData.participants} {text.labels.volunteers}
                      </span>
                    </div>
                    <h2 className="pj-mhero-title">{selectedData.title}</h2>
                  </div>
                </div>

                <div className="pj-mbody">
                  <div className="pj-mbody-grid">

                    <div>
                      <div className="pj-msection">
                        <div className="pj-msection-head">
                          <div className="pj-msection-bar" style={{ background: `linear-gradient(180deg,${cfg.hex},${cfg.hexL})` }} />
                          <span className="pj-msection-title">{text.projectOverview}</span>
                        </div>
                        <p>{selectedData.fullDescription}</p>
                      </div>

                      <div className="pj-msection">
                        <div className="pj-msection-head">
                          <TrendingUp style={{ width: 15, height: 15, color: 'var(--gold)' }} />
                          <span className="pj-msection-title">{text.labels.impact}</span>
                        </div>
                        <div className="pj-impact-box"><p>{selectedData.impact}</p></div>
                      </div>

                      <div className="pj-msection">
                        <div className="pj-msection-head">
                          <Award style={{ width: 15, height: 15, color: 'var(--azure)' }} />
                          <span className="pj-msection-title">{text.labels.achievements}</span>
                        </div>
                        {selectedData.achievements.map((a, i) => (
                          <div key={i} className="pj-mach-item">
                            <span className="pj-mach-dot" style={{ background: cfg.hex }} />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <aside>
                      <div className="pj-sidebar-card">
                        <p className="pj-sidebar-title">{text.projectDetails}</p>
                        {[
                          { icon: Heart, label: text.labels.coordinator, val: selectedData.coordinator },
                          { icon: Calendar, label: text.labels.period, val: `${fmtDate(selectedData.startDate)} – ${fmtDate(selectedData.endDate)}` },
                          { icon: MapPin, label: text.labels.location, val: selectedData.location },
                        ].map((row, i) => (
                          <div key={i} className="pj-detail-row">
                            <div className="pj-detail-label"><row.icon style={{ width: 12, height: 12, color: cfg.hex }} />{row.label}</div>
                            <div className="pj-detail-val">{row.val}</div>
                          </div>
                        ))}
                        <div className="pj-detail-row">
                          <div className="pj-detail-label"><Users style={{ width: 12, height: 12, color: cfg.hex }} />{text.labels.team}</div>
                          <div>
                            {selectedData.teamMembers.map((m, i) => (
                              <div key={i} className="pj-team-member">
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.hex, flexShrink: 0, display: 'inline-block' }} />
                                {m}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </aside>

                  </div>
                </div>

                <div className="pj-mfooter">
                  <button className="btn-close" onClick={() => setSelectedProject(null)}>{text.closeModal}</button>
                  <button className={`btn-reserve${isReserved ? ' is-reserved' : ''}`} onClick={() => { setSelectedProject(null); setReserveTarget(selectedData.id); setReserveForm({ name: '', email: '', phone: '' }); setReserveError(''); setReserveDone(false); }}>
                    {isReserved ? <Check style={{ width: 13, height: 13 }} /> : <CalendarCheck style={{ width: 13, height: 13 }} />}
                    {isReserved ? text.reserved : text.reserve}
                  </button>
                  {hasPDF && (
                    <button className="btn-dl" onClick={e => handleOpenPDF(e as any, selectedData.id)}>
                      <FileText style={{ width: 13, height: 13 }} />
                      {text.downloadBtn} →
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* ══ Project calendar ══ */}
        {showCalendar && (
          <div className="pj-mbg" onClick={() => setShowCalendar(false)}>
            <div className="pj-cal-box" onClick={e => e.stopPropagation()}>
              <div className="pj-cal-head">
                <div>
                  <div className="pj-cal-head-title">{text.calendarTitle}</div>
                  <div className="pj-cal-head-sub">{text.calendarSub}</div>
                </div>
                <button className="pj-cal-close" onClick={() => setShowCalendar(false)}>✕</button>
              </div>

              <div className="pj-cal-filters">
                {text.categories.map(cat => (
                  <button
                    key={cat.id}
                    className={`pj-cal-chip${calFilter === cat.id ? ' active' : ''}`}
                    onClick={() => setCalFilter(cat.id)}
                  >
                    <cat.icon style={{ width: 11, height: 11 }} />
                    {cat.name}
                  </button>
                ))}
                <button className="pj-cal-export-all" onClick={exportAllToCalendar}>
                  <CalendarPlus style={{ width: 12, height: 12 }} />
                  {text.calExportAll}
                </button>
              </div>

              <div className="pj-cal-body">
                {calendarGroups.length === 0 && (
                  <div className="pj-cal-empty">{text.calFilterEmpty}</div>
                )}
                {calendarGroups.map((g, gi) => (
                  <div key={gi}>
                    <div className="pj-cal-month">{g.month}</div>
                    {g.items.map(p => {
                      const cfg = catConfig[p.category] ?? catConfig.ecologie;
                      const isPast = p.startDate < todayStr;
                      const rel = relativeLabel(p.startDate);
                      return (
                        <div key={p.id} className={`pj-cal-row${isPast ? ' is-past' : ''}`}>
                          <span className="pj-cal-date" onClick={() => { setSelectedProject(p.id); setShowCalendar(false); }}>{fmtDate(p.startDate)}</span>
                          <span className="pj-cal-dot" style={{ background: cfg.hex }} />
                          <span className="pj-cal-title" onClick={() => { setSelectedProject(p.id); setShowCalendar(false); }}>{p.title}</span>
                          {rel && (
                            <span className={`pj-cal-relative${rel === (language === 'ro' ? 'Astăzi' : 'Today') ? ' is-today' : ''}`}>{rel}</span>
                          )}
                          <span className="pj-cal-count">{p.participants}p</span>
                          <button className="pj-cal-ics" title={text.addToCalendarOne} onClick={(e) => { e.stopPropagation(); addProjectToCalendar(p); }}>
                            <CalendarPlus style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ Reservation modal ══ */}
        {reserveTarget && reserveData && (
          <div className="pj-mbg" onClick={closeReserve}>
            <div className="pj-res-box" onClick={e => e.stopPropagation()}>
              <div className="pj-res-head">
                <div className="pj-res-close-row">
                  <button className="pj-res-close" onClick={closeReserve}><X style={{ width: 15, height: 15 }} /></button>
                </div>

                {reserveDone ? null : reservedIds.has(reserveData.id) ? null : (
                  <>
                    <h3 className="pj-res-title">{text.reserveModalTitle}</h3>
                    <p className="pj-res-sub">{text.reserveModalSub}</p>
                    <div className="pj-res-project"><CalendarCheck style={{ width: 13, height: 13 }} />{reserveData.title}</div>
                  </>
                )}
              </div>

              <div className="pj-res-body">
                {reserveDone ? (
                  <div className="pj-res-success">
                    <div className="pj-res-check"><Check style={{ width: 28, height: 28 }} /></div>
                    <h3>{text.reservationDoneTitle}</h3>
                    <p>{text.reservationDoneSub}</p>
                    <button className="pj-res-submit" onClick={closeReserve}>{text.closeModal}</button>
                  </div>
                ) : reservedIds.has(reserveData.id) ? (
                  <div className="pj-already">
                    <div className="pj-already-icon"><Check style={{ width: 26, height: 26 }} /></div>
                    <h3>{text.alreadyReservedTitle}</h3>
                    <p>{text.alreadyReservedSub} — {reserveData.title}</p>
                    <button className="pj-already-cancel" onClick={() => cancelExistingReservation(reserveData.id)}>{text.cancelReservation}</button>
                  </div>
                ) : (
                  <>
                    <div className="pj-donation-box">
                      <div className="pj-donation-amount">{MIN_DONATION_RON} RON</div>
                      <div className="pj-donation-text">
                        <p>{text.minDonationLabel}</p>
                        <p>{text.minDonationNote}</p>
                      </div>
                    </div>

                    <form onSubmit={submitReservation}>
                      <div className="pj-field">
                        <label><User style={{ width: 12, height: 12 }} />{text.fieldName}</label>
                        <input
                          type="text" required value={reserveForm.name}
                          onChange={e => setReserveForm({ ...reserveForm, name: e.target.value })}
                          placeholder={text.fieldName}
                        />
                      </div>
                      <div className="pj-field">
                        <label><Mail style={{ width: 12, height: 12 }} />{text.fieldEmail}</label>
                        <input
                          type="email" required value={reserveForm.email}
                          onChange={e => setReserveForm({ ...reserveForm, email: e.target.value })}
                          placeholder="nume@exemplu.com"
                        />
                      </div>
                      <div className="pj-field">
                        <label><Phone style={{ width: 12, height: 12 }} />{text.fieldPhone}</label>
                        <input
                          type="tel" required value={reserveForm.phone}
                          onChange={e => setReserveForm({ ...reserveForm, phone: e.target.value })}
                          placeholder="07xx xxx xxx"
                        />
                      </div>

                      {reserveError && <p className="pj-res-error">{reserveError}</p>}

                      <button type="submit" className="pj-res-submit" disabled={reserveSubmitting} style={reserveSubmitting ? { opacity: 0.7, cursor: 'wait' } : undefined}>
                        <CalendarCheck style={{ width: 15, height: 15 }} />
                        {reserveSubmitting ? text.reserveSubmitting : text.submitReservation}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      </section>
    </>
  );
};

export default Projects;