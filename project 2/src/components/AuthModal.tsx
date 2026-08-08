import { useState } from 'react';
import { X, LogIn, Eye, EyeOff, Lock, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!username.trim() || !password) { setError('Completează toate câmpurile.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 280));
    const result = login(username, password);
    setLoading(false);
    if (result.success) onClose();
    else setError(result.error || 'Eroare.');
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,12,30,0.72)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          animation: 'slideUp .3s cubic-bezier(.34,1.56,.64,1)',
          background: 'linear-gradient(155deg, rgba(24,38,74,0.62) 0%, rgba(12,20,46,0.7) 55%, rgba(8,14,34,0.78) 100%)',
          backdropFilter: 'blur(26px) saturate(160%)',
          WebkitBackdropFilter: 'blur(26px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 24px 60px rgba(3,8,24,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <style>{`
          @keyframes slideUp{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:none}}
          .auth-input::placeholder { color: rgba(191,209,255,0.4); }
          .auth-input:-webkit-autofill { -webkit-text-fill-color:#eaf0ff; box-shadow:0 0 0 1000px rgba(15,23,55,0.6) inset; }
        `}</style>

        {/* faint smoky sheen across the glass */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(120% 70% at 15% -10%, rgba(120,160,255,0.16), transparent 60%)' }} />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 text-white"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
            <X size={15}/>
          </button>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/25 mb-3 shadow-lg">
            <img src="https://voluntx.com/wp-content/uploads/2025/09/Untitled-design-1.png" alt="" className="w-full h-full object-cover"/>
          </div>
          <div className="font-bold text-xl" style={{fontFamily:'Cormorant Garamond,Georgia,serif'}}>Portal Membri</div>
          <div className="text-blue-200/80 text-xs mt-0.5 flex items-center gap-1.5">
            <Shield size={11}/> Interact Cismigiu · Acces restricționat
          </div>
        </div>

        {/* Body */}
        <div className="relative p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5"
              style={{ background: 'rgba(160,34,61,0.18)', border: '1px solid rgba(220,90,110,0.35)', color: '#ffc9d2' }}>
              <span className="text-base">⚠️</span> {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-blue-200/90 uppercase tracking-wide mb-1.5">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/50 pointer-events-none"/>
              <input
                className="auth-input w-full pl-9 pr-4 py-3 rounded-xl text-sm text-blue-50 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.16)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(120,160,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(80,120,255,0.18)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                type="text" placeholder="INTERACT CISMIGIU" autoFocus
                value={username} onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-blue-200/90 uppercase tracking-wide mb-1.5">Parolă</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200/50 pointer-events-none"/>
              <input
                className="auth-input w-full pl-9 pr-10 py-3 rounded-xl text-sm text-blue-50 focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.16)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(120,160,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(80,120,255,0.18)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; }}
                type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={() => setShowPwd(!showPwd)} type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-blue-100 transition-colors p-1">
                {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit} disabled={loading}
            className="w-full py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60 text-sm"
            style={{
              background: 'linear-gradient(120deg, rgba(61,139,219,0.9), rgba(23,69,143,0.95))',
              border: '1px solid rgba(255,255,255,0.16)',
              boxShadow: '0 12px 28px rgba(0,60,160,0.35)',
            }}
          >
            {loading ? <span className="animate-pulse">Se verifică...</span> : <><LogIn size={15}/> Intră în Portal</>}
          </button>
        </div>
      </div>
    </div>
  );
}