// src/components/common/KPICard.jsx

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

/**
 * KPI Card untuk dashboard
 * @param {string} title
 * @param {string|number} value
 * @param {string} [subtitle]
 * @param {React.ReactNode} icon
 * @param {'indigo'|'green'|'yellow'|'red'|'blue'} [color]
 * @param {number} [trend] — nilai persen perubahan (positif/negatif)
 * @param {boolean} [loading]
 */

const COLOR_MAP = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  ring: 'ring-green-100' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', ring: 'ring-yellow-100' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    ring: 'ring-red-100' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   ring: 'ring-blue-100' },
};

export default function KPICard({ title, value, subtitle, icon, color = 'indigo', trend, loading = false }) {
  const c = COLOR_MAP[color] || COLOR_MAP.indigo;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="card card-hover p-5 flex items-start gap-4">
      {/* Icon */}
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center ring-1 flex-shrink-0', c.bg, c.ring)}>
        <span className={clsx('w-5 h-5', c.icon)}>{icon}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-gray-500 mb-0.5 truncate">{title}</p>
        {loading ? (
          <div className="h-7 w-24 bg-gray-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
          {trend !== undefined && !loading && (
            <span className={clsx('flex items-center gap-0.5 text-xs font-medium', trendColor)}>
              <TrendIcon className="w-3 h-3" />
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
