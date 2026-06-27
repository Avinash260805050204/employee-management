import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Hammer, Clipboard, Wrench } from 'lucide-react';

const RoleSelection = () => {
  const { selectRole } = useAuth();

  const cards = [
    {
      id: 'EMP001',
      title: 'Admin Portal',
      subtitle: 'System Administrator',
      desc: 'Access core plant roster scheduling, approve leave requests, view breakdown analytics, and perform employee management.',
      icon: Shield,
      color: 'from-rose-500/10 to-rose-600/5 hover:border-rose-500/30 text-rose-400 border-rose-500/10 shadow-rose-950/20'
    },
    {
      id: 'EMP002',
      title: 'Technician Portal',
      subtitle: 'Maintenance Specialist',
      desc: 'Review assigned machinery breakdowns, update repair tasks progress, log work timesheets, and log shifts attendance.',
      icon: Hammer,
      color: 'from-amber-500/10 to-amber-600/5 hover:border-amber-500/30 text-amber-400 border-amber-500/10 shadow-amber-950/20'
    },
    {
      id: 'EMP003',
      title: 'Employee Portal',
      subtitle: 'Control Room Operator',
      desc: 'Punch in/out daily attendance, submit leave requests, report machine breakdowns (with photos), and view rosters.',
      icon: Clipboard,
      color: 'from-sky-500/10 to-sky-600/5 hover:border-sky-500/30 text-sky-400 border-sky-500/10 shadow-sky-950/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-[-25%] left-[-25%] w-[80%] h-[80%] bg-steel-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-25%] w-[80%] h-[80%] bg-industrial-orange/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Brand Header */}
      <div className="text-center mb-12 relative z-10 max-w-xl">
        <div className="inline-flex p-3 rounded-2xl bg-steel-500/10 border border-steel-500/20 text-steel-400 mb-4">
          <Wrench className="w-10 h-10 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-steel-200 via-white to-steel-400 bg-clip-text text-transparent">
          Smart Steel Plant
        </h1>
        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
          Operations & Employee Management Portal. Please select a user profile card to enter the system. No credentials required.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => selectRole(card.id)}
              className={`glass-card p-8 rounded-2xl flex flex-col text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-gradient-to-br border ${card.color}`}
            >
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-fit mb-6 text-current">
                <Icon className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">{card.title}</h2>
              <span className="text-xs uppercase font-bold text-slate-500 mt-1 tracking-wider">{card.subtitle}</span>
              <p className="text-slate-400 text-xs mt-4 leading-relaxed flex-1">
                {card.desc}
              </p>
              <div className="mt-6 pt-4 border-t border-slate-800/40 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center justify-between">
                <span>Enter Workspace</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="mt-16 text-xs text-slate-500 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span>Demo Environment Active | Server API online</span>
      </div>
    </div>
  );
};

export default RoleSelection;
