// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import useAuthStore from '../store/authStore';
// import toast from 'react-hot-toast';
// import { UserPlus } from 'lucide-react';

// export default function RegisterPage() {
//   const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '' });
//   const { register, loading } = useAuthStore();
//   const navigate = useNavigate();

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await register(form);
//       toast.success('Account created!');
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
//           <p className="text-gray-500 mt-2">Create your account</p>
//         </div>
//         <div className="bg-white rounded-2xl shadow-lg p-8">
//           <h2 className="text-2xl font-semibold text-gray-900 mb-6">Register</h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//               <input name="name" value={form.name} onChange={handleChange} className="input-field" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//               <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
//               <input name="password" type="password" value={form.password} onChange={handleChange} className="input-field" minLength={6} required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//               <select name="role" value={form.role} onChange={handleChange} className="input-field">
//                 <option value="student">Student</option>
//                 <option value="mentor">Mentor</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
//               <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
//             </div>
//             <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
//               <UserPlus size={18} />
//               {loading ? 'Creating...' : 'Create Account'}
//             </button>
//           </form>
//           <p className="text-center text-sm text-gray-500 mt-6">
//             Already have an account?{' '}
//             <Link to="/login" className="text-primary-600 font-medium hover:underline">
//               Sign in
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
import { UserPlus, Mail, KeyRound, User, Phone, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
  });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f6dcb2,transparent_23%),radial-gradient(circle_at_bottom_right,#bfe9ff,transparent_24%),linear-gradient(160deg,#07111f,#18273a_40%,#23304a)] px-5 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left side – info panel */}
        <section className="rounded-[2.4rem] border border-white/10 bg-white/5 p-7 text-white shadow-2xl shadow-black/20 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
            <GraduationCap className="h-4 w-4" />
            Smart Internship Management
          </div>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl">
            Manage internships, students, mentors, and evaluations in one place
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-200/85 md:text-base">
            The Smart Internship Management System helps universities and companies
            track student applications, mentor assignments, project submissions,
            and performance reviews – all powered by Spring Boot and JWT.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { label: 'Core Modules', value: 'Internships · Students · Mentors · Evaluations' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  {item.label}
                </p>
                <p className="mt-3 text-sm font-semibold text-white leading-tight">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Right side – registration form */}
        <section className="rounded-[2.4rem] border border-white/10 bg-white px-6 py-7 shadow-2xl shadow-black/20 md:px-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Join the platform
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Create account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign up as a student or mentor to start your internship journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Full Name
              </span>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </div>
            </label>

            {/* Email */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Email
              </span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  required
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Password
              </span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </div>
            </label>

            {/* Role */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Role
              </span>
              <div className="relative">
                <UserPlus className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 appearance-none"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Mentor</option>
                </select>
              </div>
            </label>

            {/* Phone (optional) */}
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Phone (optional)
              </span>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className="w-full rounded-[1.2rem] border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-[1.2rem] bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-950 transition hover:text-sky-700">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
