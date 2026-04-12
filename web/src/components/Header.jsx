import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm font-medium text-gray-500">
          Welcome back, <span className="text-gray-900 font-semibold">{user?.name}</span>
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 capitalize">
          <User size={12} />
          {user?.role}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
