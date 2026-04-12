import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard,
  ListTodo,
  CalendarCheck,
  FileText,
  Users,
  Briefcase,
  Award,
} from 'lucide-react';

const navItems = {
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/internships', icon: Briefcase, label: 'Internships' },
    { to: '/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/certificates', icon: Award, label: 'Certificates' },
  ],
  mentor: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'My Students' },
    { to: '/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/internships', icon: Briefcase, label: 'Internships' },
  ],
  student: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: ListTodo, label: 'My Tasks' },
    { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/reports', icon: FileText, label: 'Reports' },
    { to: '/certificates', icon: Award, label: 'Certificates' },
  ],
};

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const items = navItems[user?.role] || navItems.student;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-primary-700 tracking-tight">Internix</h1>
        <p className="text-xs text-gray-400 mt-1">Internship Management</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
