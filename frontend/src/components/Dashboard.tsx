import React from 'react';
import {
  Users, MapPin, Camera, Calendar, DollarSign, Clock,
  ArrowUpRight, ArrowDownRight, ChevronRight
} from 'lucide-react';

/**
 * Trendy Film Production Dashboard
 * - Clean, modern cards (rounded-2xl, soft shadows, glass blur)
 * - Gradient icon chips + clear change badges
 * - Better spacing/typography hierarchy
 * - Subtle interactions on hover
 * - Responsive grid that scales beautifully
 *
 * Requirements: TailwindCSS + lucide-react
 */

type Stat = {
  title: string;
  value: string;
  change: string; // "+12%" or "-8%" or "-2 days"
  icon: React.ComponentType<any>;
  from?: string;
  colorFrom: string; // gradient start
  colorTo: string;   // gradient end
};

const Dashboard: React.FC = () => {
  const stats: Stat[] = [
    { title: 'Active Crew Members', value: '124', change: '+12%', icon: Users, colorFrom: 'from-sky-500', colorTo: 'to-blue-600' },
    { title: 'Locations Booked',     value: '18',  change: '+5%',  icon: MapPin, colorFrom: 'from-emerald-500', colorTo: 'to-green-600' },
    { title: 'Equipment Rented',     value: '45',  change: '+23%', icon: Camera, colorFrom: 'from-violet-500', colorTo: 'to-purple-600' },
    { title: 'Scheduled Shoots',     value: '8',   change: '+15%', icon: Calendar, colorFrom: 'from-amber-500', colorTo: 'to-orange-600' },
    { title: 'Total Budget',         value: '$125K', change: '-8%', icon: DollarSign, colorFrom: 'from-rose-500', colorTo: 'to-red-600' },
    { title: 'Days Remaining',       value: '32',  change: '-2 days', icon: Clock, colorFrom: 'from-indigo-500', colorTo: 'to-blue-700' },
  ];

  const recentActivities = [
    { action: 'New crew member added', details: 'John Smith — Cinematographer', time: '2 hours ago', type: 'crew' },
    { action: 'Location booked',       details: 'Hyderabad Film Studio — Hall A', time: '4 hours ago', type: 'location' },
    { action: 'Equipment checked out', details: 'Canon C300 Mark III', time: '6 hours ago', type: 'equipment' },
    { action: 'Schedule updated',      details: "Tomorrow's call sheet finalized", time: '8 hours ago', type: 'schedule' },
  ];

  const progress = [
    { label: 'Pre-Production', value: 85, color: 'bg-sky-600' },
    { label: 'Production',     value: 45, color: 'bg-emerald-600' },
    { label: 'Post-Production', value: 0, color: 'bg-slate-400' },
  ];

  const typeColor = (t: string) =>
    t === 'crew' ? 'bg-sky-500' :
    t === 'location' ? 'bg-emerald-500' :
    t === 'equipment' ? 'bg-violet-500' :
    'bg-amber-500';

  const changePill = (change: string) => {
    const isPositive = change.trim().startsWith('+');
    const isNegative = change.trim().startsWith('-');
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        ${isPositive ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100'
          : isNegative ? 'text-rose-700 bg-rose-50 ring-1 ring-rose-100'
          : 'text-slate-700 bg-slate-50 ring-1 ring-slate-100'}`}>
        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : isNegative ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
        {change}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Production Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of today’s operations across crew, locations, equipment & schedule.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-white/70 backdrop-blur border border-slate-200 hover:bg-white transition">
            Export Report
          </button>
          <button className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-black transition">
            New Action
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 backdrop-blur hover:shadow-xl transition-shadow"
            >
              {/* subtle gradient sheen */}
              <div className="absolute inset-x-0 -top-1 h-1 bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl text-white
                    bg-gradient-to-br ${s.colorFrom} ${s.colorTo} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {changePill(s.change)}
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-semibold tracking-tight text-slate-900">{s.value}</div>
                  <div className="text-sm text-slate-600">{s.title}</div>
                </div>
              </div>
              {/* hover lift line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>

      {/* Middle Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activities</h2>
            <button className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-200">
            {recentActivities.map((a, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${typeColor(a.type)}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{a.action}</p>
                  <p className="text-sm text-slate-600">{a.details}</p>
                  <p className="text-xs text-slate-500 mt-1">{a.time}</p>
                </div>
                <button className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition">
                  Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="group p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white transition text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">Add Crew</p>
              <p className="text-xs text-slate-500">Invite or register</p>
            </button>
            <button className="group p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white transition text-left">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">Book Location</p>
              <p className="text-xs text-slate-500">Search & reserve</p>
            </button>
            <button className="group p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white transition text-left">
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">Rent Equipment</p>
              <p className="text-xs text-slate-500">Catalog & status</p>
            </button>
            <button className="group p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:from-slate-50 hover:to-white transition text-left">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-slate-900">Schedule Shoot</p>
              <p className="text-xs text-slate-500">Call sheet & crew</p>
            </button>
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Project Progress</h2>
          <span className="text-xs text-slate-500">Updated just now</span>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {progress.map((p, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{p.label}</span>
                <span className="text-sm text-slate-500">{p.value}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`${p.color} h-2.5 rounded-full transition-all`}
                  style={{ width: `${p.value}%` }}
                />
              </div>
              {/* Mini milestones */}
              <div className="mt-3 flex items-center gap-2">
                {[20, 40, 60, 80].map(m => (
                  <span
                    key={m}
                    className={`h-1 w-1 rounded-full ${p.value >= m ? 'bg-slate-600' : 'bg-slate-300'}`}
                    title={`${m}% milestone`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer helper bar */}
      <div className="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur p-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">Tip: Use the Quick Actions to keep today’s schedule up to date.</span>
        <button className="text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-black transition">
          Create Call Sheet
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
