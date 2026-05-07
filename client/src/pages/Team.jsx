import { useState, useEffect } from 'react';
import { authAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Loader from '../components/Loader';

const getInitials = (name = '') => name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
const avatarColors = [
  'from-blue-500 to-blue-600',
  'from-sky-500 to-sky-600',
  'from-indigo-500 to-indigo-600',
  'from-violet-500 to-violet-600',
  'from-teal-500 to-teal-600',
  'from-cyan-500 to-cyan-600',
];
const getGradient = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const Team = () => {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    authAPI.getAllUsers()
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-700">Admin Access Required</h2>
        <p className="text-slate-400 mt-2 text-sm max-w-sm">
          Team management is only available to administrators. Contact your admin for access.
        </p>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const admins = filtered.filter((u) => u.role === 'admin');
  const members = filtered.filter((u) => u.role === 'member');

  if (loading) return <Loader fullScreen text="Loading team..." />;

  return (
    <div className="space-y-6 animate-fade-in">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} registered users</p>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Members',
            value: users.length,
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
            color: 'bg-blue-100 text-blue-600',
          },
          {
            label: 'Admins',
            value: users.filter((u) => u.role === 'admin').length,
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            color: 'bg-violet-100 text-violet-600',
          },
          {
            label: 'Active Members',
            value: users.filter((u) => u.isActive).length,
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
            color: 'bg-emerald-100 text-emerald-600',
          },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-sm font-semibold text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>


      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input className="input-field pl-10" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>


      {admins.length > 0 && (
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-violet-500 rounded-full inline-block" />
            Administrators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((u) => (
              <MemberCard key={u._id} member={u} currentUser={user} gradient={getGradient(u.name)} initials={getInitials(u.name)} />
            ))}
          </div>
        </div>
      )}


      {members.length > 0 && (
        <div>
          <h2 className="section-title mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
            Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((u) => (
              <MemberCard key={u._id} member={u} currentUser={user} gradient={getGradient(u.name)} initials={getInitials(u.name)} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-bold text-slate-600">No users found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member, currentUser, gradient, initials }) => (
  <div className="card animate-fade-in group">
    <div className="flex items-start gap-4">
      <div className={`avatar w-14 h-14 text-lg bg-gradient-to-br ${gradient} shadow-sm flex-shrink-0`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-slate-800 truncate">{member.name}</p>
          {member._id === currentUser?._id && (
            <span className="badge badge-blue text-xs">You</span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate mt-0.5">{member.email}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`badge ${member.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>
            {member.role}
          </span>
          <span className={`badge ${member.isActive ? 'badge-green' : 'badge-red'}`}>
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="text-xs text-slate-400">
        <span className="font-semibold text-slate-500">Joined</span>{' '}
        {format(new Date(member.createdAt), 'MMM yyyy')}
      </div>
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${member.isActive ? 'bg-emerald-400' : 'bg-slate-300'}`} />
        <span className="text-xs text-slate-400">{member.isActive ? 'Online' : 'Offline'}</span>
      </div>
    </div>
  </div>
);

export default Team;
