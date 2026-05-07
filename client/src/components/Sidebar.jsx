import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'My Tasks',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/team',
    label: 'Team',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const getAvatarColor = (name = '') => {
  const colors = ['bg-blue-500', 'bg-sky-500', 'bg-indigo-500', 'bg-violet-500', 'bg-cyan-500'];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const Sidebar = ({ onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-14 h-14 ">
            <img src="/icon.svg" className="w-15 h-15" alt="logo" />
          </div>
          <span className="font-display font-bold text-lg text-slate-1000">Team Flow</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

  
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? 'nav-link-active' : 'nav-link'
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="divider" />
            <p className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Admin</p>
            <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700">Admin Access</p>
              <p className="text-xs text-blue-500 mt-0.5">Full project control</p>
            </div>
          </>
        )}
      </nav>


      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className={`avatar w-9 h-9 text-sm ${getAvatarColor(user?.name)} flex-shrink-0`}>
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <span className={`badge text-xs ${user?.role === 'admin' ? 'badge-blue' : 'badge-gray'}`}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
