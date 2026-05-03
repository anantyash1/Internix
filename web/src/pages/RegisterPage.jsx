// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import useAuthStore from '../store/authStore';
// import toast from 'react-hot-toast';
// import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Phone, ChevronDown } from 'lucide-react';

// const ROLES = [
//   { value: 'student', label: 'Student', desc: 'Access tasks, reports & certificates', emoji: '🎓' },
//   { value: 'mentor',  label: 'Mentor',  desc: 'Manage tasks and review student work', emoji: '👨‍🏫' },
// ];

// export default function RegisterPage() {
//   const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });
//   const [show, setShow] = useState(false);
//   const [focused, setFocused] = useState('');
//   const { register, loading } = useAuthStore();
//   const navigate = useNavigate();

//   const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
//     try {
//       await register(form);
//       toast.success('Account created!');
//       navigate('/dashboard');
//     } catch (err) {
//       toast.error(err.message || 'Registration failed');
//     }
//   };

//   const fieldStyle = (key) => ({
//     boxShadow: focused === key ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
//   });

//   return (
//     <div style={{
//       minHeight: '100dvh',
//       display: 'flex', alignItems: 'center', justifyContent: 'center',
//       background: 'var(--slate-50)',
//       padding:
//         'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))',
//       fontFamily: 'var(--font-body)',
//       boxSizing: 'border-box',
//     }}>
//       <div style={{
//         width: '100%', maxWidth: 480,
//         animation: 'fadeUp 0.4s ease both',
//       }}>
//         {/* Logo row */}
//         <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
//           <div style={{
//             width: 44, height: 44, borderRadius: 13,
//             background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             margin: '0 auto 0.75rem',
//             boxShadow: '0 4px 16px rgba(37,99,235,0.35)',
//           }}>
//             <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: '#fff' }}>I</span>
//           </div>
//           <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--slate-900)', letterSpacing: '-0.03em' }}>
//             Create your account
//           </div>
//           <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
//             Join Internix and start your internship journey
//           </div>
//         </div>

//         {/* Card */}
//         <div style={{
//           background: '#ffffff',
//           borderRadius: 'var(--radius-xl)',
//           border: '1px solid var(--slate-200)',
//           boxShadow: 'var(--shadow-xl)',
//           padding: '2rem',
//         }}>
//           {/* Role selector */}
//           <div style={{ marginBottom: '1.25rem' }}>
//             <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
//               I am a…
//             </label>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
//               {ROLES.map((r) => {
//                 const active = form.role === r.value;
//                 return (
//                   <button
//                     key={r.value}
//                     type="button"
//                     onClick={() => setForm((f) => ({ ...f, role: r.value }))}
//                     style={{
//                       display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
//                       gap: '0.25rem',
//                       padding: '0.875rem 1rem',
//                       borderRadius: 'var(--radius-md)',
//                       border: `1.5px solid ${active ? 'var(--blue-500)' : 'var(--slate-200)'}`,
//                       background: active ? 'var(--blue-50)' : '#ffffff',
//                       cursor: 'pointer',
//                       transition: 'all 180ms ease',
//                       textAlign: 'left',
//                       fontFamily: 'var(--font-body)',
//                     }}
//                     onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--slate-300)'; e.currentTarget.style.background = 'var(--slate-50)'; } }}
//                     onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = 'var(--slate-200)'; e.currentTarget.style.background = '#ffffff'; } }}
//                   >
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
//                       <span style={{ fontSize: '1rem' }}>{r.emoji}</span>
//                       <span style={{ fontSize: '0.875rem', fontWeight: 600, color: active ? 'var(--blue-700)' : 'var(--slate-800)' }}>
//                         {r.label}
//                       </span>
//                     </div>
//                     <span style={{ fontSize: '0.7rem', color: active ? 'var(--blue-500)' : 'var(--slate-400)', lineHeight: 1.4 }}>
//                       {r.desc}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
//             {/* Name */}
//             <div>
//               <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
//                 Full name
//               </label>
//               <input
//                 value={form.name} onChange={set('name')}
//                 onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
//                 className="input-field" placeholder="Jane Doe" required
//                 style={fieldStyle('name')}
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
//                 Email address
//               </label>
//               <input
//                 type="email" value={form.email} onChange={set('email')}
//                 onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
//                 className="input-field" placeholder="you@example.com" required
//                 style={fieldStyle('email')}
//               />
//             </div>

//             {/* Password */}
//             <div>
//               <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
//                 Password
//               </label>
//               <div style={{ position: 'relative' }}>
//                 <input
//                   type={show ? 'text' : 'password'}
//                   value={form.password} onChange={set('password')}
//                   onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
//                   className="input-field" placeholder="Min. 6 characters" required minLength={6}
//                   style={{ paddingRight: '2.5rem', ...fieldStyle('password') }}
//                 />
//                 <button type="button" onClick={() => setShow(!show)} style={{
//                   position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
//                   background: 'none', border: 'none', cursor: 'pointer',
//                   color: 'var(--slate-400)', padding: '0.25rem', transition: 'color 150ms',
//                   display: 'flex', alignItems: 'center',
//                 }}
//                 onMouseEnter={(e) => e.currentTarget.style.color = 'var(--slate-700)'}
//                 onMouseLeave={(e) => e.currentTarget.style.color = 'var(--slate-400)'}
//                 >
//                   {show ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//               {/* Strength bar */}
//               {form.password && (
//                 <div style={{ marginTop: '0.375rem' }}>
//                   <div style={{ height: 3, background: 'var(--slate-100)', borderRadius: 999, overflow: 'hidden' }}>
//                     <div style={{
//                       height: '100%', borderRadius: 999,
//                       width: form.password.length >= 10 ? '100%' : form.password.length >= 6 ? '55%' : '25%',
//                       background: form.password.length >= 10 ? 'var(--emerald-500)' : form.password.length >= 6 ? 'var(--amber-400)' : 'var(--rose-400)',
//                       transition: 'all 250ms ease',
//                     }} />
//                   </div>
//                   <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', marginTop: 3 }}>
//                     {form.password.length >= 10 ? '✓ Strong password' : form.password.length >= 6 ? 'Medium strength' : 'Weak'}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Phone (optional) */}
//             <div>
//               <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--slate-700)', marginBottom: '0.375rem' }}>
//                 Phone <span style={{ fontWeight: 400, color: 'var(--slate-400)' }}>(optional)</span>
//               </label>
//               <input
//                 type="tel" value={form.phone} onChange={set('phone')}
//                 onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
//                 className="input-field" placeholder="+91 98765 43210"
//                 style={fieldStyle('phone')}
//               />
//             </div>

//             <button type="submit" disabled={loading} className="btn-primary"
//               style={{
//                 justifyContent: 'center', padding: '0.6875rem',
//                 fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.25rem',
//                 background: loading ? 'var(--slate-300)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
//               }}
//             >
//               {loading ? (
//                 <>
//                   <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
//                   Creating account…
//                 </>
//               ) : (
//                 <>Create account <ArrowRight size={16} /></>
//               )}
//             </button>
//           </form>

//           <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '1.25rem' }}>
//             Already have an account?{' '}
//             <Link to="/login" style={{ color: 'var(--blue-600)', fontWeight: 600, textDecoration: 'none' }}
//               onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
//               onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'student', label: 'Student', desc: 'Tasks, reports & certificates', emoji: '🎓' },
  { value: 'mentor',  label: 'Mentor',  desc: 'Manage tasks & review work',    emoji: '👨‍🏫' },
];

/* ── tiny counter hook ── */
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let current = 0;
    const step = 30;
    const inc = target / (duration / step);
    const id = setInterval(() => {
      current = Math.min(current + inc, target);
      setVal(Math.floor(current));
      if (current >= target) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [start, target, duration]);
  return val;
}

export default function RegisterPage() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'student', phone: '' });
  const [show, setShow]     = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState([]);
  const particleRef = useRef(null);

  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  /* counters */
  const c1 = useCounter(500,  1800, mounted);
  const c2 = useCounter(95,   1800, mounted);
  const c3 = useCounter(200,  1800, mounted);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    /* ambient particle loop */
    const COLORS = ['#a78bfa','#67e8f9','#6ee7b7','#fca5a5','#fcd34d'];
    let pid = 0;
    const interval = setInterval(() => {
      const p = {
        id: pid++,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        dur: 4 + Math.random() * 6,
      };
      setParticles(prev => [...prev.slice(-25), p]);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const filledCount = [form.name, form.email, form.password].filter(Boolean).length;

  /* password strength */
  const getStrength = pw => {
    if (!pw) return null;
    const score =
      (pw.length >= 8  ? 1 : 0) +
      (pw.length >= 10 ? 1 : 0) +
      (/[A-Z]/.test(pw) ? 1 : 0) +
      (/\d/.test(pw)    ? 1 : 0) +
      (/[^a-zA-Z0-9]/.test(pw) ? 1 : 0);
    if (score <= 1) return { w: '22%', color: '#f43f5e', label: 'Weak — add numbers & symbols' };
    if (score <= 3) return { w: '58%', color: '#f59e0b', label: 'Fair — getting stronger'       };
    if (score <= 4) return { w: '80%', color: '#06b6d4', label: 'Good password!'                };
    return          { w: '100%', color: 'linear-gradient(90deg,#7c3aed,#06b6d4,#10b981)', label: '✓ Strong password', strong: true };
  };
  const strength = getStrength(form.password);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    try {
      await register(form);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const inputStyle = key => ({
    width: '100%',
    padding: '0.75rem 0.875rem 0.75rem 2.75rem',
    borderRadius: 13,
    border: `2px solid ${focused === key ? '#7c3aed' : '#e0e0e0'}`,
    background: '#fff',
    color: '#000',
    fontSize: '0.9375rem',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 200ms ease',
    boxSizing: 'border-box',
    boxShadow: focused === key ? '0 0 0 4px rgba(124,58,237,0.1)' : 'none',
  });

  const iconColor = key => focused === key ? '#7c3aed' : '#bbb';

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#03080f', minHeight: '100vh', position: 'relative' }}>

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes float1  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.08)} 66%{transform:translate(-40px,30px) scale(.95)} }
        @keyframes float2  { 0%,100%{transform:translate(0,0)} 40%{transform:translate(-50px,40px) scale(1.06)} 70%{transform:translate(30px,-50px) scale(.97)} }
        @keyframes float3  { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-60px) scale(1.04)} }
        @keyframes float4  { 0%,100%{transform:translate(0,0)} 35%{transform:translate(-30px,50px)} 65%{transform:translate(50px,-20px)} }
        @keyframes spinBorder { to{transform:rotate(360deg)} }
        @keyframes pulseGlow  { 0%,100%{box-shadow:0 0 10px #10b981,0 0 20px rgba(16,185,129,.4)} 50%{box-shadow:0 0 6px #10b981} }
        @keyframes gradShift  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes particleFly { 0%{opacity:0;transform:translateY(0) scale(0)} 20%{opacity:.6} 80%{opacity:.25} 100%{opacity:0;transform:translateY(-130px) scale(1.4) rotate(180deg)} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes featSlide  { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:none} }
        input:-webkit-autofill,input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
          -webkit-text-fill-color: #000 !important;
        }
        input::placeholder { color: #bbb; }
      `}</style>

      {/* ── Aurora orbs ── */}
      {[
        { size:700, bg:'radial-gradient(circle,#7c3aed,#312e81)', top:'-200px', left:'-200px', anim:'float1 18s ease-in-out infinite' },
        { size:600, bg:'radial-gradient(circle,#06b6d4,#0c4a6e)', bottom:'-100px', left:'20%',  anim:'float2 22s ease-in-out infinite' },
        { size:500, bg:'radial-gradient(circle,#10b981,#064e3b)', top:'30%',  right:'-100px', anim:'float3 16s ease-in-out infinite' },
        { size:400, bg:'radial-gradient(circle,#f43f5e,#7c3aed)', bottom:'10%', right:'5%',   anim:'float4 20s ease-in-out infinite' },
      ].map((o, i) => (
        <div key={i} style={{
          position:'fixed', width:o.size, height:o.size, borderRadius:'50%',
          background:o.bg, filter:'blur(80px)', opacity:.17, pointerEvents:'none', zIndex:0,
          top:o.top, left:o.left, bottom:o.bottom, right:o.right,
          animation: o.anim,
        }}/>
      ))}

      {/* ── Grid mesh ── */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
        backgroundSize:'50px 50px',
      }}/>

      {/* ── Particles ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden' }}>
        {particles.map(p => (
          <div key={p.id} style={{
            position:'absolute', width:p.size, height:p.size, borderRadius:'50%',
            background:p.color, left:`${p.x}%`, bottom:`${p.y}%`,
            animation:`particleFly ${p.dur}s ease-in forwards`,
          }}/>
        ))}
      </div>

      {/* ── Page grid ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        minHeight:'100vh',
        position:'relative', zIndex:2,
      }}>

        {/* ═══ LEFT BRAND ═══ */}
        <div style={{
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          padding:'clamp(1.5rem,4vw,3rem) clamp(1.5rem,4vw,3.5rem)',
          opacity: mounted ? 1 : 0, transition:'opacity .6s ease',
        }}>
          {/* Logo */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateX(-24px)',
            transition:'all .8s cubic-bezier(.4,0,.2,1)',
          }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'.75rem' }}>
              {/* Spinning border logo */}
              <div style={{ width:48, height:48, position:'relative' }}>
                <div style={{
                  position:'absolute', inset:-2,
                  background:'conic-gradient(from 0deg,#7c3aed,#06b6d4,#10b981,#f43f5e,#7c3aed)',
                  borderRadius:18, animation:'spinBorder 4s linear infinite',
                }}/>
                <div style={{
                  position:'absolute', inset:2, background:'#0a0f1e', borderRadius:13,
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}>
                  <img src="/logo.png" alt="Logo" style={{ width:'68%', height:'68%', objectFit:'contain', position:'relative', zIndex:1 }}/>
                </div>
              </div>
              <div>
                <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.125rem', color:'#fff', letterSpacing:'-.03em', lineHeight:1.1 }}>MR Techlab LLP</div>
                <div style={{ fontSize:'.625rem', color:'rgba(255,255,255,0.3)', letterSpacing:'.15em', textTransform:'uppercase', fontWeight:600 }}>Internship Platform</div>
              </div>
            </div>
          </div>

          {/* Hero content */}
          <div style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(24px)',
            transition:'all .9s cubic-bezier(.4,0,.2,1) .15s',
          }}>
            {/* Status pill */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:'.5rem',
              padding:'.3rem .875rem', borderRadius:999,
              border:'1px solid rgba(16,185,129,0.3)',
              background:'rgba(16,185,129,0.08)', marginBottom:'1.5rem',
            }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', animation:'pulseGlow 2s ease infinite' }}/>
              <span style={{ fontSize:'.75rem', fontWeight:600, color:'rgba(255,255,255,0.6)', letterSpacing:'.04em' }}>Now accepting applications</span>
            </div>

            <h1 style={{
              fontFamily:'Outfit,sans-serif', fontWeight:900,
              fontSize:'clamp(2.5rem,4vw,3.5rem)',
              lineHeight:1.06, letterSpacing:'-.04em',
              color:'#fff', marginBottom:'1.25rem',
            }}>
              Start your<br/>internship<br/>
              <span style={{
                background:'linear-gradient(135deg,#a78bfa 0%,#67e8f9 50%,#6ee7b7 100%)',
                backgroundSize:'200% 200%',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text', animation:'gradShift 5s ease infinite',
              }}>
                journey today.
              </span>
            </h1>

            <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.4)', lineHeight:1.75, maxWidth:380 }}>
              Join hundreds of interns on MR Techlab's unified platform — track tasks, get AI-powered mentorship, and earn verified certificates.
            </p>

            {/* Features */}
            <div style={{ display:'flex', flexDirection:'column', gap:'.625rem', marginTop:'2rem' }}>
              {[
                { icon:'⚡', label:'Real-time task & attendance tracking',    color:'rgba(124,58,237,.15)'  },
                { icon:'🤖', label:'MR AI-powered insights & assistance',      color:'rgba(6,182,212,.15)'   },
                { icon:'🎓', label:'Auto-generated completion certificates',   color:'rgba(16,185,129,.15)'  },
                { icon:'📊', label:'Live performance analytics dashboard',     color:'rgba(244,63,94,.15)'   },
              ].map((f, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:'.75rem',
                  padding:'.5rem .875rem', borderRadius:12,
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.06)',
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'none' : 'translateX(-16px)',
                  transition:`all .6s cubic-bezier(.4,0,.2,1) ${.2 + i * .1}s`,
                  cursor:'default',
                }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:f.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <span style={{ fontSize:'1rem' }}>{f.icon}</span>
                  </div>
                  <span style={{ fontSize:'.8125rem', color:'rgba(255,255,255,0.5)' }}>{f.label}</span>
                </div>
              ))}
            </div>

            {/* Stats strip */}
            <div style={{
              display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem',
              marginTop:'2.5rem', paddingTop:'2rem',
              borderTop:'1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { val:`${c1}+`, lbl:'Active Interns'  },
                { val:`${c2}%`, lbl:'Placement Rate'  },
                { val:`${c3}+`, lbl:'Projects Done'   },
              ].map((s, i) => (
                <div key={i} style={{ textAlign:'center' }}>
                  <div style={{
                    fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.5rem',
                    background:'linear-gradient(135deg,#a78bfa,#67e8f9)',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                  }}>{s.val}</div>
                  <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,0.3)', letterSpacing:'.08em', textTransform:'uppercase', marginTop:'.125rem' }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,0.2)', letterSpacing:'.04em', opacity: mounted ? 1 : 0, transition:'opacity .6s ease .4s' }}>
            © 2025 MR Techlab LLP · Secure & Encrypted
          </div>
        </div>

        {/* ═══ RIGHT FORM ═══ */}
        <div style={{
          background:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
          padding:'clamp(1rem,4vw,2rem)', overflowY:'auto', boxSizing:'border-box',
        }}>
          {/* Card */}
          <div style={{
            width:'100%', maxWidth:440,
            background:'#fff', borderRadius:28,
            border:'2.5px solid #000',
            boxShadow:'0 20px 60px rgba(0,0,0,0.15),0 4px 12px rgba(0,0,0,0.08)',
            padding:'clamp(1.5rem,5vw,2.5rem)',
            boxSizing:'border-box',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'none' : 'translateY(24px) scale(0.98)',
            transition:'all .9s cubic-bezier(.4,0,.2,1) .2s',
          }}>

            {/* Card header */}
            <div style={{ marginBottom:'1.75rem' }}>
              <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.625rem', color:'#000', letterSpacing:'-.03em', marginBottom:'.3rem' }}>
                Create your account 🚀
              </div>
              <div style={{ fontSize:'.875rem', color:'#555' }}>
                Join MR Techlab — it takes less than a minute
              </div>
              {/* Progress dots */}
              <div style={{ display:'flex', alignItems:'center', gap:'.375rem', marginTop:'.875rem' }}>
                {[0,1,2].map(i => {
                  const active = filledCount > i;
                  return (
                    <div key={i} style={{
                      height:4, borderRadius:999,
                      width: (i === 0 || active) ? 28 : 8,
                      background: active || i === 0
                        ? 'linear-gradient(90deg,#7c3aed,#06b6d4)'
                        : '#e0e0e0',
                      boxShadow: (active || i === 0) ? '0 0 8px rgba(124,58,237,.4)' : 'none',
                      transition:'all .4s ease',
                    }}/>
                  );
                })}
              </div>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom:'1.25rem' }}>
              <label style={{ display:'block', fontSize:'.8125rem', fontWeight:600, color:'#111', marginBottom:'.5rem' }}>I am a…</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.5rem' }}>
                {ROLES.map(r => {
                  const active = form.role === r.value;
                  return (
                    <button
                      key={r.value} type="button"
                      onClick={() => setForm(f => ({ ...f, role: r.value }))}
                      style={{
                        display:'flex', flexDirection:'column', alignItems:'flex-start',
                        gap:'.2rem', padding:'.875rem 1rem', borderRadius:14,
                        border:`1.5px solid ${active ? '#7c3aed' : '#e0e0e0'}`,
                        background: active ? 'linear-gradient(135deg,rgba(124,58,237,.07),rgba(6,182,212,.04))' : '#fff',
                        cursor:'pointer', transition:'all .2s ease', textAlign:'left',
                        fontFamily:"'DM Sans',sans-serif", position:'relative', overflow:'hidden',
                        boxShadow: active ? '0 0 0 3px rgba(124,58,237,.12)' : 'none',
                      }}
                    >
                      {/* Checkmark */}
                      <div style={{
                        position:'absolute', top:8, right:8, width:18, height:18,
                        borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#06b6d4)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        opacity: active ? 1 : 0,
                        transform: active ? 'scale(1)' : 'scale(.4)',
                        transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
                      }}>
                        <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5"/></svg>
                      </div>
                      <span style={{ fontSize:'1.125rem' }}>{r.emoji}</span>
                      <span style={{ fontSize:'.875rem', fontWeight:700, color: active ? '#6d28d9' : '#111' }}>{r.label}</span>
                      <span style={{ fontSize:'.68rem', color: active ? '#7c3aed' : '#888', lineHeight:1.4 }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Name */}
              <div>
                <label style={{ display:'block', fontSize:'.8125rem', fontWeight:600, color:'#111', marginBottom:'.4rem' }}>Full name</label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: iconColor('name'), pointerEvents:'none', display:'flex', transition:'color .2s' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
                  </div>
                  <input type="text" value={form.name} onChange={set('name')} onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                    placeholder="Jane Doe" required style={inputStyle('name')}/>
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display:'block', fontSize:'.8125rem', fontWeight:600, color:'#111', marginBottom:'.4rem' }}>Email address</label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: iconColor('email'), pointerEvents:'none', display:'flex', transition:'color .2s' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 8l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/></svg>
                  </div>
                  <input type="email" value={form.email} onChange={set('email')} onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    placeholder="you@example.com" required style={inputStyle('email')}/>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display:'block', fontSize:'.8125rem', fontWeight:600, color:'#111', marginBottom:'.4rem' }}>Password</label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: iconColor('pw'), pointerEvents:'none', display:'flex', transition:'color .2s' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  </div>
                  <input type={show ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                    placeholder="Min. 6 characters" required
                    style={{ ...inputStyle('pw'), paddingRight:'2.75rem' }}/>
                  <button type="button" onClick={() => setShow(s => !s)} style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'#bbb', padding:4,
                    display:'flex', alignItems:'center', transition:'color .15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color='#7c3aed'}
                    onMouseLeave={e => e.currentTarget.style.color='#bbb'}
                  >
                    {show
                      ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                      : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    }
                  </button>
                </div>
                {/* Strength bar */}
                {strength && (
                  <div style={{ marginTop:'.375rem' }}>
                    <div style={{ height:3, background:'#f0f0f0', borderRadius:999, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:999, width:strength.w, background:strength.color, transition:'all .35s ease' }}/>
                    </div>
                    <div style={{ fontSize:'.7rem', marginTop:3, color: strength.strong ? '#059669' : strength.color }}>{strength.label}</div>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display:'block', fontSize:'.8125rem', fontWeight:600, color:'#111', marginBottom:'.4rem' }}>
                  Phone <span style={{ fontWeight:400, color:'#aaa' }}>(optional)</span>
                </label>
                <div style={{ position:'relative' }}>
                  <div style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: iconColor('phone'), pointerEvents:'none', display:'flex', transition:'color .2s' }}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <input type="tel" value={form.phone} onChange={set('phone')} onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                    placeholder="+91 98765 43210" style={inputStyle('phone')}/>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  marginTop:'.25rem', width:'100%', padding:'.875rem',
                  borderRadius:14, border:'none',
                  background: loading ? '#ccc' : 'linear-gradient(135deg,#7c3aed 0%,#5b21b6 50%,#312e81 100%)',
                  color:'#fff', fontSize:'1rem', fontWeight:700,
                  fontFamily:"'DM Sans',sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'.625rem',
                  transition:'all .25s ease',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,.4)',
                  boxSizing:'border-box', position:'relative', overflow:'hidden',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(124,58,237,.55)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=loading?'none':'0 4px 20px rgba(124,58,237,.4)'; }}
              >
                {loading ? (
                  <>
                    <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider + link */}
            <div style={{ display:'flex', alignItems:'center', gap:'.75rem', margin:'1.25rem 0' }}>
              <div style={{ flex:1, height:1, background:'#e8e8e8' }}/>
              <span style={{ fontSize:'.75rem', color:'#aaa', fontWeight:500 }}>or</span>
              <div style={{ flex:1, height:1, background:'#e8e8e8' }}/>
            </div>
            <p style={{ textAlign:'center', fontSize:'.875rem', color:'#777' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#7c3aed', fontWeight:700, textDecoration:'none', transition:'color .15s' }}
                onMouseEnter={e => { e.target.style.color='#5b21b6'; e.target.style.textDecoration='underline'; }}
                onMouseLeave={e => { e.target.style.color='#7c3aed'; e.target.style.textDecoration='none'; }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}