import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import PilotProgram from './components/PilotProgram';

// Secțiuni de sub prima fereastră vizibilă (fold) — separate în chunk-uri proprii,
// descărcate în paralel, după ce Header+Hero+PilotProgram sunt deja pe ecran,
// nu înainte de primul paint. Reduce drastic JS-ul de parsat la încărcare pe telefon slab.
const ClassroomMindMap = lazy(() => import('./components/ClassroomMindMap'));
const Projects = lazy(() => import('./components/Projects'));
const Gallery = lazy(() => import('./components/Gallery'));
const News = lazy(() => import('./components/News'));
const Faq = lazy(() => import('./components/Faq'));
const ContactForm = lazy(() => import('./components/ContactForm'));
const Footer = lazy(() => import('./components/Footer'));

// Componente grele / nevizibile la prima încărcare — separate în chunk-uri proprii,
// descărcate doar când chiar sunt necesare (login sau dashboard membru).
const AuthModal = lazy(() => import('./components/AuthModal'));
const MemberDashboard = lazy(() => import('./components/MemberDashboard'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid rgba(0,0,0,.1)', borderTopColor: '#1f4e8c', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Detectare mod URL ────────────────────────────────────────
type UrlMode =
  | { mode: 'checkin'; code: string }
  | { mode: 'readonly'; token: string }
  | { mode: 'site' };

function getUrlMode(): UrlMode {
  const params = new URLSearchParams(window.location.search);

  // ?checkin=ABCD sau /checkin/ABCD
  const qCheckin = params.get('checkin');
  if (qCheckin) return { mode: 'checkin', code: qCheckin.toUpperCase() };
  const pCheckin = window.location.pathname.match(/^\/checkin\/([A-Z0-9]{6,12})$/i);
  if (pCheckin) return { mode: 'checkin', code: pCheckin[1].toUpperCase() };

  // ?view=TOKEN
  const qView = params.get('view');
  if (qView) return { mode: 'readonly', token: qView };

  return { mode: 'site' };
}

// ─── Site normal cu auth ──────────────────────────────────────
function AppWithAuth() {
  const [currentLanguage, setCurrentLanguage] = useState<'ro' | 'en'>('ro');
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) setShowDashboard(false);
  }, [isAuthenticated]);

  const isInDashboard = isAuthenticated && showDashboard;

  return (
    <div className="min-h-screen">
      {!isInDashboard && (
        <Header
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onOpenAuth={() => setShowAuth(true)}
          onOpenDashboard={() => setShowDashboard(true)}
        />
      )}
      {showAuth && (
        <Suspense fallback={<LoadingFallback />}>
          <AuthModal onClose={() => setShowAuth(false)} />
        </Suspense>
      )}
      {isInDashboard ? (
        <Suspense fallback={<LoadingFallback />}>
          <MemberDashboard />
        </Suspense>
      ) : (
        <>
          <Hero language={currentLanguage} />
          <PilotProgram language={currentLanguage} />
          <div id="classroom-mindmap">
            <Suspense fallback={<LoadingFallback />}>
              <ClassroomMindMap language={currentLanguage} />
            </Suspense>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <Projects language={currentLanguage} />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <Gallery language={currentLanguage} />
          </Suspense>
          <Suspense fallback={<LoadingFallback />}>
            <News language={currentLanguage} />
          </Suspense>
          <div id="faq">
            <Suspense fallback={<LoadingFallback />}>
              <Faq language={currentLanguage} />
            </Suspense>
          </div>
          <div id="contact">
            <Suspense fallback={<LoadingFallback />}>
              <ContactForm language={currentLanguage} />
            </Suspense>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <Footer language={currentLanguage} />
          </Suspense>
        </>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────
export default function App() {
  const urlMode = getUrlMode();

  // Check-in → MemberDashboard știe să randeze CheckInPage dacă ?checkin= e în URL
  // Nu wrappăm în AuthProvider — nu e nevoie de auth
  if (urlMode.mode === 'checkin') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MemberDashboard />
      </Suspense>
    );
  }

  // Read-only → MemberDashboard știe să randeze ReadOnlyView dacă ?view= e în URL
  // Nu wrappăm în AuthProvider — nu e nevoie de auth
  if (urlMode.mode === 'readonly') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <MemberDashboard />
      </Suspense>
    );
  }

  // Site normal
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}