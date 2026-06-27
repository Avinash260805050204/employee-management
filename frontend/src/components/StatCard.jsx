import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend, trendType = 'neutral' }) => {
  const trendColor = {
    positive: 'text-emerald-400 bg-emerald-500/10',
    negative: 'text-rose-400 bg-rose-500/10',
    neutral: 'text-slate-400 bg-slate-500/10'
  }[trendType];

  return (
    <div className="glass-card glass-card-hover p-6 rounded-xl relative overflow-hidden flex flex-col justify-between">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-steel-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 text-steel-400">
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/60">
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendColor}`}>
            {trend}
          </span>
        )}
        <span className="text-xs text-slate-400 truncate">{description}</span>
      </div>
    </div>
  );
};

export default StatCard;
