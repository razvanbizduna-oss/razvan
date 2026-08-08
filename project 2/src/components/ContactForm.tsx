import React, { useState, useEffect, useRef } from 'react';
import {
  Mail, User, MessageSquare, Send, CheckCircle, AlertCircle,
  Phone, MapPin, Clock, Building2, Shield
} from 'lucide-react';

// Same club photos used as the tiled background across the rest of the
// site (About, TeamPage, Projects, News, Gallery, FAQ) — kept identical so
// every section reads as one continuous surface instead of a new backdrop
// per section.
const bgPhotos = ['itc.webp', 'IMG_1347.webp', 'IMG_1352.webp', 'IMG_1351.webp', 'IMG_1349.webp', 'IMG_1350.webp'];
const bgTiles = [...bgPhotos, ...bgPhotos, ...bgPhotos, ...bgPhotos];

const ContactForm = ({ language = 'ro' }: { language?: 'ro' | 'en' }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const secRef = useRef<HTMLElement>(null);

  const MAPS_URL = 'https://maps.google.com/?q=Parcul+Cismigiu,+Intrarea+Brezoianu,+București';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setEntered(true); }, { threshold: 0.04 });
    if (secRef.current) obs.observe(secRef.current);
    return () => obs.disconnect();
  }, []);

  const content = {
    ro: {
      eyebrow: 'Interact București Cismigiu',
      title: 'Contactează-ne,',
      titleAccent: 'suntem aproape',
      subtitle: 'Completează formularul și te vom contacta în cel mai scurt timp. Îți răspundem în maxim 24 de ore.',
      form: {
        personalInfo: 'Informații personale',
        name: 'Nume și Prenume', namePlaceholder: 'Introduceți numele complet',
        email: 'Adresă de Email', emailPlaceholder: 'nume.prenume@email.ro',
        phone: 'Număr de Telefon', phonePlaceholder: '+40 7XX XXX XXX',
        messageDetails: 'Mesajul tău',
        subject: 'Subiect',
        subjectOptions: [
          { value: '', label: 'Selectează subiectul' },
          { value: 'voluntariat', label: '🤝 Vreau să devin voluntar' },
          { value: 'proiecte', label: '🌿 Informații despre proiecte' },
          { value: 'parteneriat', label: '🏢 Parteneriate și sponsorizări' },
          { value: 'donatie', label: '❤️ Donații și sprijin' },
          { value: 'eveniment', label: '🎉 Evenimente și activități' },
          { value: 'presa', label: '📰 Presă și comunicare' },
          { value: 'rotary', label: '🌍 Rotary International' },
          { value: 'altele', label: '💬 Altele' },
        ],
        message: 'Mesajul tău',
        messagePlaceholder: 'Spune-ne cum te putem ajuta sau cum poți contribui la proiectele noastre. Cu cât mai multe detalii, cu atât mai bine!',
        submit: 'Trimite mesajul', submitting: 'Se trimite...', optional: '(opțional)',
      },
      validation: {
        nameRequired: 'Numele complet este obligatoriu',
        nameMinLength: 'Te rugăm să introduci prenumele și numele',
        emailRequired: 'Adresa de email este obligatorie',
        emailInvalid: 'Formatul adresei de email nu este valid',
        phoneInvalid: 'Numărul de telefon nu este valid',
        subjectRequired: 'Te rugăm să selectezi un subiect',
        messageRequired: 'Mesajul este obligatoriu',
        messageMinLength: 'Mesajul trebuie să conțină minimum 30 de caractere',
      },
      success: {
        title: 'Mesaj trimis!',
        message: 'Mulțumim că ne-ai contactat. Echipa Interact te va răspunde în maximum 24 de ore lucrătoare.',
        button: 'Trimite un nou mesaj',
      },
      contactInfo: {
        title: 'Date de contact',
        phone: '+40 721 000 001', email: 'contact@interactcismigiu.ro',
        address: 'Parcul Cișmigiu, Intrarea Brezoianu, Sector 1, București',
        addressShort: 'Parcul Cișmigiu, București',
        hours: 'Program', schedule: 'Luni – Vineri: 09:00 – 18:00',
        mapLabel: 'Deschide în Google Maps',
        phoneLabel: 'Telefon', emailLabel: 'Email', addressLabel: 'Adresă',
      },
      features: [
        { icon: Clock,     title: 'Răspuns rapid',     desc: 'Sub 24 de ore lucrătoare' },
        { icon: Shield,    title: 'Confidențialitate', desc: 'Date protejate GDPR' },
        { icon: Building2, title: 'Suport dedicat',    desc: 'Echipă de voluntari' },
      ],
    },
    en: {
      eyebrow: 'Interact București Cismigiu',
      title: 'Contact us,',
      titleAccent: "we're here",
      subtitle: "Fill out the form and we'll get back to you as soon as possible — within 24 hours.",
      form: {
        personalInfo: 'Personal information',
        name: 'Full Name', namePlaceholder: 'Enter your full name',
        email: 'Email Address', emailPlaceholder: 'name.surname@email.com',
        phone: 'Phone Number', phonePlaceholder: '+40 7XX XXX XXX',
        messageDetails: 'Your message',
        subject: 'Subject',
        subjectOptions: [
          { value: '', label: 'Select a subject' },
          { value: 'voluntariat', label: '🤝 I want to volunteer' },
          { value: 'proiecte', label: '🌿 Information about projects' },
          { value: 'parteneriat', label: '🏢 Partnerships & sponsorships' },
          { value: 'donatie', label: '❤️ Donations & support' },
          { value: 'eveniment', label: '🎉 Events & activities' },
          { value: 'presa', label: '📰 Press & communications' },
          { value: 'rotary', label: '🌍 Rotary International' },
          { value: 'altele', label: '💬 Other' },
        ],
        message: 'Your message',
        messagePlaceholder: 'Tell us how we can help, or how you can contribute to our projects. The more details, the better!',
        submit: 'Send message', submitting: 'Sending...', optional: '(optional)',
      },
      validation: {
        nameRequired: 'Full name is required',
        nameMinLength: 'Please enter your first and last name',
        emailRequired: 'Email address is required',
        emailInvalid: 'Email format is not valid',
        phoneInvalid: 'Phone number is not valid',
        subjectRequired: 'Please select a subject',
        messageRequired: 'Message is required',
        messageMinLength: 'Message must contain at least 30 characters',
      },
      success: {
        title: 'Message sent!',
        message: 'Thank you for reaching out. The Interact team will reply within 24 business hours.',
        button: 'Send another message',
      },
      contactInfo: {
        title: 'Contact details',
        phone: '+40 721 000 001', email: 'contact@interactcismigiu.ro',
        address: 'Cișmigiu Park, Brezoianu Entrance, Sector 1, Bucharest',
        addressShort: 'Cișmigiu Park, Bucharest',
        hours: 'Hours', schedule: 'Mon – Fri: 09:00 – 18:00',
        mapLabel: 'Open in Google Maps',
        phoneLabel: 'Phone', emailLabel: 'Email', addressLabel: 'Address',
      },
      features: [
        { icon: Clock,     title: 'Quick response',    desc: 'Within 24 business hours' },
        { icon: Shield,    title: 'Confidentiality',   desc: 'GDPR data protection' },
        { icon: Building2, title: 'Dedicated support', desc: 'Volunteer team' },
      ],
    },
  };

  const t = content[language];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = t.validation.nameRequired;
    else if (formData.name.trim().split(' ').length < 2) e.name = t.validation.nameMinLength;
    if (!formData.email.trim()) e.email = t.validation.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = t.validation.emailInvalid;
    if (formData.phone && !/^[\d\s+\-()]+$/.test(formData.phone)) e.phone = t.validation.phoneInvalid;
    if (!formData.subject) e.subject = t.validation.subjectRequired;
    if (!formData.message.trim()) e.message = t.validation.messageRequired;
    else if (formData.message.trim().length < 30) e.message = t.validation.messageMinLength;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'message') setCharCount(value.length);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const subj = t.form.subjectOptions.find(o => o.value === formData.subject)?.label ?? formData.subject;
    const emailSubject = `${subj} — ${formData.name}`;
    const emailBody = `Nume: ${formData.name}\nEmail: ${formData.email}${formData.phone ? `\nTelefon: ${formData.phone}` : ''}\nSubiect: ${subj}\n\n${formData.message}`;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: '07a5d822-2d5b-44fa-8222-a2cb4787d350',
          name: formData.name, email: formData.email,
          subject: emailSubject, message: emailBody,
          to: 'contact@interactcismigiu.ro',
        }),
      });
      const result = await res.json();
      if (result.success) { setIsSubmitting(false); setIsSubmitted(true); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); return; }
    } catch (_) {}
    window.open(`mailto:contact@interactcismigiu.ro?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
    setTimeout(() => { setIsSubmitting(false); setIsSubmitted(true); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }); }, 800);
  };

  // ── Success screen ────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
          @keyframes ctSuccessIn { from{opacity:0;transform:scale(0.9) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
          @keyframes ctCheckPop { 0%{transform:scale(0.5)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }
        `}</style>
        <section id="contact" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: '#050a1e', position: 'relative', overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, display: 'flex', flexWrap: 'wrap', overflow: 'hidden', filter: 'blur(13px) saturate(1.15) brightness(0.48)', transform: 'scale(1.08)' }}>
            {bgTiles.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" decoding="async" style={{ flex: '1 1 260px', height: 260, objectFit: 'cover', display: 'block' }} />
            ))}
          </div>
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%)' }} />
          <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'ctSuccessIn 0.65s cubic-bezier(.22,.68,0,1.2) both', position: 'relative', zIndex: 2 }}>
            <div style={{
              background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)',
              backdropFilter: 'blur(14px)', borderRadius: 22, padding: '52px 44px',
              border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f7a81b,#ffcf5c,#f7a81b)' }} />
              <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#17458f,#0067c8)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', boxShadow: '0 8px 24px rgba(0,103,200,0.3)', animation: 'ctCheckPop .6s .2s cubic-bezier(.34,1.56,.64,1) both' }}>
                <CheckCircle style={{ width: 36, height: 36, color: '#ffcf5c' }} />
              </div>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '2rem', color: '#fff', marginBottom: 12 }}>{t.success.title}</h2>
              <p style={{ fontSize: 14, color: 'rgba(226,236,255,.72)', lineHeight: 1.75, marginBottom: 28, fontWeight: 300 }}>{t.success.message}</p>
              <button onClick={() => setIsSubmitted(false)} style={{ background: '#f7a81b', color: '#12233f', border: 'none', borderRadius: 10, padding: '12px 28px', fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '.03em', boxShadow: '0 10px 26px rgba(247,168,27,0.35)', transition: 'all .3s' }}>
                {t.success.button}
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const progressPct = Math.min(100, (charCount / 30) * 100);
  const isDone = charCount >= 30;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

        .ct { --royal:#17458f;
              --ink:#eef3ff;--mute:rgba(226,236,255,0.6);--bdr:rgba(255,255,255,0.14);--bdr-s:rgba(255,255,255,0.22); }
        .ct { font-family:'Inter',sans-serif;color:#eef3ff;
              padding:88px 0 112px;position:relative;overflow:hidden; }
        .ct * { box-sizing:border-box;margin:0;padding:0; }

        /* ══ PHOTO BACKGROUND — same tiled club photos + navy overlay as the rest of the site ══ */
        .ct-photo-bg{position:absolute;inset:0;z-index:0;display:flex;flex-wrap:wrap;overflow:hidden;
          filter:blur(13px) saturate(1.15) brightness(0.48);transform:scale(1.08);}
        .ct-photo-bg img{flex:1 1 260px;height:260px;object-fit:cover;display:block;}
        .ct-photo-overlay{position:absolute;inset:0;z-index:1;
          background:linear-gradient(200deg, rgba(6,13,35,0.9) 0%, rgba(12,24,58,0.85) 40%, rgba(17,35,75,0.7) 78%, rgba(6,13,35,0.9) 100%);}

        .ct .wrap { max-width:1180px;margin:0 auto;padding:0 28px;position:relative;z-index:2; }

        @keyframes ctRise  { from{opacity:0;transform:translateY(34px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ctBlink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.6)} }
        @keyframes ctShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ctSpin { to{transform:rotate(360deg)} }

        .ct.vis .e0 { animation:ctRise 1.1s 0.05s cubic-bezier(.16,.8,.2,1) both }
        .ct.vis .e1 { animation:ctRise 1.1s 0.20s cubic-bezier(.16,.8,.2,1) both }
        .ct.vis .e2 { animation:ctRise 1.1s 0.35s cubic-bezier(.16,.8,.2,1) both }
        .ct.vis .e3 { animation:ctRise 1.1s 0.50s cubic-bezier(.16,.8,.2,1) both }
        .ct.vis .e4 { animation:ctRise 1.1s 0.65s cubic-bezier(.16,.8,.2,1) both }

        /* ── HEADER ── */
        .ct .ct-eyebrow {
          display:inline-flex;align-items:center;gap:9px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
          letter-spacing:.16em;text-transform:uppercase;color:#fff9e4;
          padding:6px 16px 6px 12px;border:1.5px solid rgba(250,204,21,0.35);border-radius:100px;
          background:rgba(250,204,21,0.12);backdrop-filter:blur(8px); }
        .ct .ct-edot {
          width:7px;height:7px;border-radius:50%;
          background:linear-gradient(135deg,var(--gold),var(--gold-l));
          box-shadow:0 0 8px rgba(247,168,27,.5);animation:ctBlink 2.4s ease-in-out infinite; }
        .ct .ct-title {
          font-family:'Space Grotesk',sans-serif;font-weight:700;
          font-size:clamp(30px,4.5vw,58px);color:#fff;
          line-height:1;letter-spacing:-.02em; }
        .ct .ct-title em { font-style:normal;color:var(--gold-l); }
        .ct .ct-divider {
          width:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--gold-l));
          border-radius:3px;transition:width 1.3s .6s cubic-bezier(.22,.68,0,1.2); }
        .ct.vis .ct-divider { width:56px; }
        .ct .ct-sub { font-size:14.5px;font-weight:300;color:rgba(226,236,255,.72);letter-spacing:.01em;line-height:1.75; }

        /* ── LAYOUT GRID ── */
        .ct .ct-grid { display:grid;grid-template-columns:1fr 340px;gap:14px; }
        @media(max-width:960px) { .ct .ct-grid { grid-template-columns:1fr; } }

        /* ── FORM CARD — smoky glass instead of white ── */
        .ct .ct-form-card {
          background:linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter:blur(14px);
          border:1px solid var(--bdr);border-radius:22px;
          padding:36px 36px 32px;position:relative;overflow:hidden;
          box-shadow:0 20px 50px rgba(0,0,0,0.4);
          transition:box-shadow .5s,border-color .5s; }
        .ct .ct-form-card::before {
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,var(--royal),var(--azure),var(--gold-l)); }
        .ct .ct-form-card::after {
          content:'';position:absolute;top:0;left:-100%;right:-100%;height:3px;
          background:linear-gradient(90deg,transparent,rgba(247,168,27,0.8),transparent);
          background-size:200% auto;animation:ctShimmer 5s linear infinite; }
        .ct .ct-form-card:hover { box-shadow:0 26px 60px rgba(0,0,0,0.5);border-color:rgba(247,168,27,0.3); }

        .ct .ct-fieldset { border:none;margin-bottom:26px; }
        .ct .ct-legend {
          display:flex;align-items:center;gap:8px;width:100%;font-family:'JetBrains Mono',monospace;
          font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;
          color:var(--mute);margin-bottom:16px; }
        .ct .ct-legend-bar { width:20px;height:2px;background:linear-gradient(90deg,var(--azure),var(--gold-l));border-radius:2px; }

        .ct .ct-input-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
        @media(max-width:600px) { .ct .ct-input-grid { grid-template-columns:1fr; } }

        .ct .ct-field { display:flex;flex-direction:column;gap:5px; }
        .ct .ct-label { font-size:11px;font-weight:600;color:var(--ink);letter-spacing:.03em; }
        .ct .ct-label-req { color:var(--cranberry-l);margin-left:3px; }
        .ct .ct-label-opt { color:var(--mute);font-weight:300;margin-left:4px;font-size:10px; }

        .ct .ct-input-wrap { position:relative; }
        .ct .ct-input-icon { position:absolute;left:13px;top:50%;transform:translateY(-50%);width:15px;height:15px;transition:color .3s;pointer-events:none; }
        .ct .ct-textarea-icon { position:absolute;left:13px;top:14px;width:15px;height:15px;transition:color .3s;pointer-events:none; }

        .ct .ct-input, .ct .ct-select, .ct .ct-textarea {
          width:100%;font-family:'Inter',sans-serif;
          font-size:13px;font-weight:400;color:var(--ink);
          background:rgba(255,255,255,0.05);
          border:1.5px solid var(--bdr-s);border-radius:12px;
          padding:11px 14px 11px 40px;outline:none;
          transition:border-color .3s,background .3s,box-shadow .3s; }
        .ct .ct-select { padding-left:14px;cursor:pointer; }
        .ct .ct-select option { color:#12233f; }
        .ct .ct-textarea { padding:12px 14px 12px 40px;resize:none;min-height:130px;line-height:1.65; }
        .ct .ct-input::placeholder, .ct .ct-textarea::placeholder { color:rgba(226,236,255,0.32); }
        .ct .ct-input:focus, .ct .ct-select:focus, .ct .ct-textarea:focus {
          border-color:var(--azure);background:rgba(255,255,255,0.09);
          box-shadow:0 0 0 3px rgba(0,103,200,0.18); }
        .ct .ct-input.has-error, .ct .ct-select.has-error, .ct .ct-textarea.has-error {
          border-color:var(--cranberry-l);background:rgba(160,34,61,0.12);
          box-shadow:0 0 0 3px rgba(160,34,61,0.14); }
        .ct .ct-input:focus.has-error, .ct .ct-textarea:focus.has-error {
          border-color:var(--cranberry-l);box-shadow:0 0 0 3px rgba(160,34,61,0.18); }

        .ct .ct-input.is-filled:not(.has-error),
        .ct .ct-select.is-filled:not(.has-error),
        .ct .ct-textarea.is-filled:not(.has-error) {
          border-color:rgba(247,168,27,0.5);background:rgba(247,168,27,0.08); }

        .ct .ct-err { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--cranberry-l);animation:ctRise .3s cubic-bezier(.16,.8,.2,1) both; }

        .ct .ct-counter-row { display:flex;justify-content:space-between;align-items:center;margin-top:6px; }
        .ct .ct-counter-track { flex:1;height:3px;background:rgba(255,255,255,0.12);border-radius:3px;overflow:hidden;margin-right:10px; }
        .ct .ct-counter-bar { height:100%;border-radius:3px;transition:width .4s ease,background .4s ease; }
        .ct .ct-counter-num { font-size:11px;font-weight:600;transition:color .3s; }

        /* ── SUBMIT BUTTON ── */
        .ct .ct-submit {
          width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
          padding:13px 20px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:700;
          letter-spacing:.04em;cursor:pointer;border:none;
          background:var(--royal);color:#fff;
          position:relative;overflow:hidden;
          transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .4s,background .3s; }
        .ct .ct-submit::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,var(--azure),var(--gold-l));
          opacity:0;transition:opacity .4s; }
        .ct .ct-submit span, .ct .ct-submit svg { position:relative;z-index:1; }
        .ct .ct-submit:not(:disabled):hover { transform:translateY(-3px) scale(1.01);box-shadow:0 16px 38px rgba(0,103,200,0.35); }
        .ct .ct-submit:not(:disabled):hover::before { opacity:1; }
        .ct .ct-submit:disabled { opacity:.6;cursor:not-allowed;transform:none; }
        .ct .ct-spin { animation:ctSpin .8s linear infinite; }

        /* ── SIDEBAR — same smoky glass treatment ── */
        .ct .ct-sidebar { display:flex;flex-direction:column;gap:12px; }

        .ct .ct-info-card {
          background:linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter:blur(14px);
          border:1px solid var(--bdr);border-radius:18px;
          padding:24px;position:relative;overflow:hidden;
          box-shadow:0 16px 40px rgba(0,0,0,0.4); }
        .ct .ct-info-card::before {
          content:'';position:absolute;top:0;left:0;right:0;height:2.5px;
          background:linear-gradient(90deg,var(--royal),var(--azure)); }

        .ct .ct-info-title {
          font-family:'Space Grotesk',sans-serif;font-weight:700;
          font-size:1rem;color:#fff;
          margin-bottom:16px;display:flex;align-items:center;gap:8px; }
        .ct .ct-info-icon-wrap {
          width:28px;height:28px;border-radius:8px;
          background:linear-gradient(135deg,var(--royal),var(--azure));
          display:flex;align-items:center;justify-content:center;flex-shrink:0; }

        .ct .ct-contact-row {
          display:flex;align-items:center;gap:12px;padding:11px 12px;
          border-radius:12px;border:1px solid transparent;
          text-decoration:none;color:inherit;
          transition:all .35s cubic-bezier(.22,.68,0,1.2);
          cursor:pointer;margin-bottom:6px; }
        .ct .ct-contact-row:hover { background:rgba(0,103,200,0.14);border-color:rgba(0,103,200,0.25);transform:translateX(4px); }
        .ct .ct-contact-row:hover .ct-row-icon { background:linear-gradient(135deg,var(--royal),var(--azure));border-color:transparent; }
        .ct .ct-contact-row:hover .ct-row-icon svg { color:#fff !important; }

        .ct .ct-row-icon {
          width:36px;height:36px;border-radius:10px;
          background:rgba(0,103,200,0.14);border:1px solid rgba(0,103,200,0.28);
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          transition:all .35s; }
        .ct .ct-row-icon svg { color:#8fc0f5 !important; }
        .ct .ct-row-label { font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--mute);margin-bottom:2px; }
        .ct .ct-row-val { font-size:13px;font-weight:600;color:var(--ink); }

        .ct .ct-static-row {
          display:flex;align-items:flex-start;gap:12px;padding:11px 12px;
          border-radius:12px;background:rgba(255,255,255,0.04);border:1px solid var(--bdr);margin-bottom:6px; }

        /* ── MAP CARD ── */
        .ct .ct-map {
          border-radius:16px;overflow:hidden;border:1px solid var(--bdr);
          cursor:pointer;position:relative;
          box-shadow:0 16px 36px rgba(0,0,0,0.35);
          transition:box-shadow .45s,transform .45s cubic-bezier(.22,.68,0,1.2); }
        .ct .ct-map:hover { box-shadow:0 24px 50px rgba(0,0,0,0.45);transform:translateY(-4px); }
        .ct .ct-map img { width:100%;height:170px;object-fit:cover;display:block;transition:transform .7s cubic-bezier(.22,.68,0,1.2); }
        .ct .ct-map:hover img { transform:scale(1.07); }
        .ct .ct-map-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(5,10,30,0.8) 0%,rgba(10,25,75,0.2) 50%,transparent 100%); }
        .ct .ct-map::after { content:'';position:absolute;inset:0;border-radius:16px;border:2px solid transparent;transition:border-color .35s; }
        .ct .ct-map:hover::after { border-color:rgba(247,168,27,0.5); }
        .ct .ct-map-content { position:absolute;bottom:0;left:0;right:0;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-end; }
        .ct .ct-map-label { font-size:10px;color:rgba(255,255,255,0.7);margin-bottom:2px; }
        .ct .ct-map-name { font-size:13px;font-weight:700;color:#fff; }
        .ct .ct-map-btn {
          display:flex;align-items:center;gap:5px;
          background:var(--gold);color:#12233f;font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;
          padding:6px 12px;border-radius:8px;letter-spacing:.05em;
          opacity:0;transition:opacity .35s,transform .35s;transform:translateY(4px); }
        .ct .ct-map:hover .ct-map-btn { opacity:1;transform:translateY(0); }

        /* ── FEATURE BADGES ── */
        .ct .ct-badges { display:grid;grid-template-columns:repeat(3,1fr);gap:8px; }
        .ct .ct-badge {
          background:linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%);
          backdrop-filter:blur(10px);
          border:1px solid var(--bdr);border-radius:14px;
          padding:14px 10px;text-align:center;position:relative;overflow:hidden;
          transition:all .35s cubic-bezier(.22,.68,0,1.2);box-shadow:0 10px 24px rgba(0,0,0,0.3); }
        .ct .ct-badge::after {
          content:'';position:absolute;bottom:0;left:20%;right:20%;height:2px;
          background:var(--gold);border-radius:2px;
          transform:scaleX(0);transition:transform .35s cubic-bezier(.34,1.56,.64,1); }
        .ct .ct-badge:hover { transform:translateY(-4px);box-shadow:0 16px 34px rgba(0,0,0,0.36);border-color:rgba(247,168,27,0.4); }
        .ct .ct-badge:hover::after { transform:scaleX(1); }
        .ct .ct-badge-icon {
          width:30px;height:30px;background:linear-gradient(135deg,rgba(0,103,200,0.22),rgba(0,103,200,0.08));
          border:1px solid rgba(0,103,200,0.3);border-radius:9px;
          display:flex;align-items:center;justify-content:center;margin:0 auto 8px;
          transition:all .35s; }
        .ct .ct-badge-icon svg { color:#8fc0f5 !important; }
        .ct .ct-badge:hover .ct-badge-icon { background:linear-gradient(135deg,var(--royal),var(--azure));border-color:transparent; }
        .ct .ct-badge:hover .ct-badge-icon svg { color:#fff !important; }
        .ct .ct-badge-title { font-size:10px;font-weight:700;color:var(--ink);margin-bottom:2px;line-height:1.3; }
        .ct .ct-badge-desc { font-size:9px;color:var(--mute);line-height:1.4; }

        @media(max-width:520px) {
          .ct { padding:64px 0 88px; }
          .ct .ct-form-card { padding:24px 20px; }
          .ct .ct-input-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <section
        id="contact"
        className={`ct${entered ? ' vis' : ''}`}
        ref={secRef}
      >
        <div className="ct-photo-bg">{bgTiles.map((src, i) => <img key={i} src={src} alt="" loading="lazy" decoding="async" />)}</div>
        <div className="ct-photo-overlay" />

        <div className="ct wrap">

          {/* ── HEADER ── */}
          <header style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="e0" style={{ marginBottom: 18 }}>
              <div className="ct-eyebrow">
                <span className="ct-edot" />
                {t.eyebrow}
              </div>
            </div>
            <div className="e1">
              <h1 className="ct-title" style={{ marginBottom: 14 }}>
                {t.title} <em>{t.titleAccent}</em>
              </h1>
            </div>
            <div className="e2">
              <div className="ct-divider" style={{ margin: '0 auto 18px' }} />
            </div>
            <div className="e2">
              <p className="ct-sub" style={{ maxWidth: 560, margin: '0 auto' }}>{t.subtitle}</p>
            </div>
          </header>

          {/* ── GRID ── */}
          <div className="ct-grid e3">

            {/* ── FORM ── */}
            <div className="ct-form-card">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

                <fieldset className="ct-fieldset">
                  <legend className="ct-legend">
                    <span className="ct-legend-bar" />
                    {t.form.personalInfo}
                  </legend>
                  <div className="ct-input-grid">

                    <div className="ct-field">
                      <label className="ct-label">{t.form.name}<span className="ct-label-req">*</span></label>
                      <div className="ct-input-wrap">
                        <User className="ct-input-icon" style={{ color: focusedField === 'name' ? '#4fa3e8' : 'rgba(226,236,255,0.4)' }} />
                        <input
                          type="text" name="name" value={formData.name} onChange={handleChange}
                          onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                          placeholder={t.form.namePlaceholder}
                          className={`ct-input${errors.name ? ' has-error' : ''}${formData.name && !errors.name ? ' is-filled' : ''}`}
                        />
                      </div>
                      {errors.name && <ErrMsg msg={errors.name} />}
                    </div>

                    <div className="ct-field">
                      <label className="ct-label">{t.form.email}<span className="ct-label-req">*</span></label>
                      <div className="ct-input-wrap">
                        <Mail className="ct-input-icon" style={{ color: focusedField === 'email' ? '#4fa3e8' : 'rgba(226,236,255,0.4)' }} />
                        <input
                          type="email" name="email" value={formData.email} onChange={handleChange}
                          onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                          placeholder={t.form.emailPlaceholder}
                          className={`ct-input${errors.email ? ' has-error' : ''}${formData.email && !errors.email ? ' is-filled' : ''}`}
                        />
                      </div>
                      {errors.email && <ErrMsg msg={errors.email} />}
                    </div>

                    <div className="ct-field" style={{ gridColumn: '1 / -1', maxWidth: 320 }}>
                      <label className="ct-label">{t.form.phone}<span className="ct-label-opt">{t.form.optional}</span></label>
                      <div className="ct-input-wrap">
                        <Phone className="ct-input-icon" style={{ color: focusedField === 'phone' ? '#4fa3e8' : 'rgba(226,236,255,0.4)' }} />
                        <input
                          type="tel" name="phone" value={formData.phone} onChange={handleChange}
                          onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                          placeholder={t.form.phonePlaceholder}
                          className={`ct-input${errors.phone ? ' has-error' : ''}${formData.phone && !errors.phone ? ' is-filled' : ''}`}
                        />
                      </div>
                      {errors.phone && <ErrMsg msg={errors.phone} />}
                    </div>
                  </div>
                </fieldset>

                <fieldset className="ct-fieldset" style={{ marginBottom: 24 }}>
                  <legend className="ct-legend">
                    <span className="ct-legend-bar" />
                    {t.form.messageDetails}
                  </legend>

                  <div className="ct-field" style={{ marginBottom: 12 }}>
                    <label className="ct-label">{t.form.subject}<span className="ct-label-req">*</span></label>
                    <select
                      name="subject" value={formData.subject} onChange={handleChange}
                      className={`ct-select${errors.subject ? ' has-error' : ''}${formData.subject ? ' is-filled' : ''}`}
                    >
                      {t.form.subjectOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {errors.subject && <ErrMsg msg={errors.subject} />}
                  </div>

                  <div className="ct-field">
                    <label className="ct-label">{t.form.message}<span className="ct-label-req">*</span></label>
                    <div className="ct-input-wrap">
                      <MessageSquare className="ct-textarea-icon" style={{ color: focusedField === 'message' ? '#4fa3e8' : 'rgba(226,236,255,0.4)' }} />
                      <textarea
                        name="message" value={formData.message} onChange={handleChange}
                        onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                        placeholder={t.form.messagePlaceholder}
                        rows={5}
                        className={`ct-textarea${errors.message ? ' has-error' : ''}${formData.message && !errors.message ? ' is-filled' : ''}`}
                      />
                    </div>
                    <div className="ct-counter-row">
                      {errors.message ? <ErrMsg msg={errors.message} /> : <span />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                        <div className="ct-counter-track" style={{ width: 60 }}>
                          <div className="ct-counter-bar" style={{ width: `${progressPct}%`, background: isDone ? 'linear-gradient(90deg,#f7a81b,#ffcf5c)' : 'linear-gradient(90deg,#17458f,#0067c8)' }} />
                        </div>
                        <span className="ct-counter-num" style={{ color: isDone ? '#ffcf5c' : charCount > 0 ? '#8fc0f5' : 'rgba(226,236,255,0.4)' }}>
                          {charCount}/30
                        </span>
                      </div>
                    </div>
                  </div>
                </fieldset>

                <button type="submit" disabled={isSubmitting} className="ct-submit">
                  {isSubmitting ? (
                    <>
                      <svg className="ct-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                      <span>{t.form.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send style={{ width: 16, height: 16 }} />
                      <span>{t.form.submit}</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* ── SIDEBAR ── */}
            <div className="ct-sidebar e4">

              <div className="ct-info-card">
                <p className="ct-info-title">
                  <span className="ct-info-icon-wrap">
                    <Phone style={{ width: 13, height: 13, color: '#fff' }} />
                  </span>
                  {t.contactInfo.title}
                </p>

                <a href={`tel:${t.contactInfo.phone}`} className="ct-contact-row">
                  <div className="ct-row-icon">
                    <Phone style={{ width: 14, height: 14 }} />
                  </div>
                  <div>
                    <div className="ct-row-label">{t.contactInfo.phoneLabel}</div>
                    <div className="ct-row-val">{t.contactInfo.phone}</div>
                  </div>
                </a>

                <a href={`mailto:${t.contactInfo.email}`} className="ct-contact-row">
                  <div className="ct-row-icon">
                    <Mail style={{ width: 14, height: 14 }} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div className="ct-row-label">{t.contactInfo.emailLabel}</div>
                    <div className="ct-row-val" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.contactInfo.email}</div>
                  </div>
                </a>

                <div className="ct-static-row">
                  <div className="ct-row-icon">
                    <Clock style={{ width: 14, height: 14 }} />
                  </div>
                  <div>
                    <div className="ct-row-label">{t.contactInfo.hours}</div>
                    <div className="ct-row-val">{t.contactInfo.schedule}</div>
                  </div>
                </div>

                <div className="ct-static-row">
                  <div className="ct-row-icon" style={{ marginTop: 2 }}>
                    <MapPin style={{ width: 14, height: 14 }} />
                  </div>
                  <div>
                    <div className="ct-row-label">{t.contactInfo.addressLabel}</div>
                    <div className="ct-row-val" style={{ lineHeight: 1.5 }}>{t.contactInfo.address}</div>
                  </div>
                </div>
              </div>

              <div className="ct-map" onClick={() => window.open(MAPS_URL, '_blank')}>
                <img src="IMG_1330.webp" alt="Parcul Cișmigiu" loading="lazy" decoding="async" />
                <div className="ct-map-overlay" />
                <div className="ct-map-content">
                  <div>
                    <div className="ct-map-label">📍 Locație</div>
                    <div className="ct-map-name">{t.contactInfo.addressShort}</div>
                  </div>
                  <div className="ct-map-btn">
                    <MapPin style={{ width: 11, height: 11 }} />
                    Maps
                  </div>
                </div>
              </div>

              <div className="ct-badges">
                {t.features.map((f, i) => (
                  <div key={i} className="ct-badge">
                    <div className="ct-badge-icon">
                      <f.icon style={{ width: 14, height: 14 }} />
                    </div>
                    <div className="ct-badge-title">{f.title}</div>
                    <div className="ct-badge-desc">{f.desc}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const ErrMsg = ({ msg }: { msg: string }) => (
  <div className="ct-err">
    <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} />
    <span>{msg}</span>
  </div>
);

export default ContactForm;