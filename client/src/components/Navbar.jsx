import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'My Tasks',
  '/team': 'Team Members',
};

const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const title = Object.entries(pageTitles).find(([key]) =>
    pathname.startsWith(key)
  )?.[1] || 'Team Flow';

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">

      
        <div className="flex items-center gap-2.5 mr-10">
          <div className="avatar w-9 h-9 text-sm bg-blue-600 hidden sm:flex ">
            {getInitials(user?.name)}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
