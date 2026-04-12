// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import useAuthStore from '../store/authStore';
// import toast from 'react-hot-toast';
// import { LogIn, Eye, EyeOff } from 'lucide-react';

// export default function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPass, setShowPass] = useState(false);
//   const { login, loading } = useAuthStore();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await login(email, password);
//       toast.success('Welcome back!');
//       navigate('/dashboard');
//     } catch (err) {
//       toast.error(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 p-4">
//       <div className="w-full max-w-md">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-primary-700">Internix</h1>
//           <p className="text-gray-500 mt-2">Smart Internship Management</p>
//         </div>
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign in</h2>
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="input-field"
//                 placeholder="you@example.com"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <div className="relative">
//                 <input
//                   type={showPass ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="input-field pr-10"
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPass(!showPass)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
//                 >
//                   {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>
//             <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
//               <LogIn size={18} />
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>
//           </form>
//           <p className="text-center text-sm text-gray-500 mt-6">
//             Don't have an account?{' '}
//             <Link to="/register" className="text-primary-600 font-medium hover:underline">
//               Register
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { LogIn, Mail, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f6dcb2,transparent_23%),radial-gradient(circle_at_bottom_right,#bfe9ff,transparent_24%),linear-gradient(160deg,#07111f,#18273a_40%,#23304a)] px-5 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left side – info panel (glassmorphic) */}
        <section className="rounded-[2.4rem] border border-white/10 bg-white/5 p-7 text-white shadow-2xl shadow-black/20 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
            <ShieldCheck className="h-4 w-4" />
            Secure JWT Authentication
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Welcome back to Smart Internship Management
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-200/85 md:text-base">
            Sign in to manage internship applications, track student progress,
            assign mentors, and review project submissions – all from one
            secure dashboard powered by Spring Boot.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Role Access', value: 'Student · Mentor · Admin' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  {item.label}
                </p>
                <p className="mt-3 text-sm font-semibold text-white leading-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Right side – login form (white card) */}
        <section className="rounded-[2.4rem] border border-white/10 bg-white px-6 py-7 shadow-2xl shadow-black/20 md:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Access Portal
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500">
              Use your credentials to continue your internship journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Email address
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </div>
            </label>

            {/* Password field with show/hide */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Password
              </span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[1.2rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <LogIn size={18} />
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-slate-950 transition hover:text-sky-700"
            >
              Create one
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}