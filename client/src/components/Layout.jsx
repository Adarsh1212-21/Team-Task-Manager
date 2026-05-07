import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
     
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    
      <aside
        className={`fixed lg:relative lg:flex flex-col z-30 h-screen sidebar-width transition-transform duration-300
          ${sidebarOpen ? 'flex translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
