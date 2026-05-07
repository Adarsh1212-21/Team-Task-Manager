import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const COLORS = {
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  done: '#10b981',
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-elevated p-3">
        {label && <p className="text-xs font-bold text-slate-600 mb-1">{label}</p>}
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const StatusPieChart = ({ data }) => {
  const chartData = [
    { name: 'To Do', value: data.todo || 0, color: COLORS.todo },
    { name: 'In Progress', value: data['in-progress'] || 0, color: COLORS['in-progress'] },
    { name: 'Done', value: data.done || 0, color: COLORS.done },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No task data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-slate-600 font-medium">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const PriorityBarChart = ({ data }) => {
  const chartData = [
    { name: 'Low', value: data.low || 0, color: COLORS.low },
    { name: 'Medium', value: data.medium || 0, color: COLORS.medium },
    { name: 'High', value: data.high || 0, color: COLORS.high },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const MemberBarChart = ({ data }) => {
  const chartData = data.map((m) => ({
    name: m.name.split(' ')[0],
    Total: m.total,
    Done: m.done,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
        />
        <Bar dataKey="Total" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Done" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
