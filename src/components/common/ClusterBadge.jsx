// src/components/common/ClusterBadge.jsx — Badge Warna Cluster

import clsx from 'clsx';
import { Circle } from 'lucide-react';

const CLUSTER_CONFIG = {
  0: { label: 'C1 - Volume Rendah', class: 'badge-low', dot: '#22c55e', status: 'Lancar' },
  1: { label: 'C2 - Volume Sedang', class: 'badge-medium', dot: '#eab308', status: 'Moderat' },
  2: { label: 'C3 - Volume Tinggi', class: 'badge-high', dot: '#ef4444', status: 'Kritis' },
  low:    { label: 'Lancar',  class: 'badge-low',    dot: '#22c55e', status: 'Lancar' },
  medium: { label: 'Moderat', class: 'badge-medium', dot: '#eab308', status: 'Moderat' },
  high:   { label: 'Kritis',  class: 'badge-high',   dot: '#ef4444', status: 'Kritis' },
};

export function ClusterBadge({ cluster, showDot = true }) {
  const config = CLUSTER_CONFIG[cluster] || CLUSTER_CONFIG.medium;
  return (
    <span className={config.class}>
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.dot }}
        />
      )}
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config =
    status === 'Lancar'  ? CLUSTER_CONFIG.low :
    status === 'Moderat' ? CLUSTER_CONFIG.medium :
    status === 'Kritis'  ? CLUSTER_CONFIG.high :
    CLUSTER_CONFIG.medium;

  return (
    <span className={config.class}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: config.dot }} />
      {status || 'Normal'}
    </span>
  );
}

export function TrafficStatusCard({ status = 'Moderat', description, hari }) {
  const config =
    status === 'Lancar'  ? { ...CLUSTER_CONFIG.low,    bg: 'bg-green-50 border-green-200' } :
    status === 'Moderat' ? { ...CLUSTER_CONFIG.medium, bg: 'bg-yellow-50 border-yellow-200' } :
                           { ...CLUSTER_CONFIG.high,   bg: 'bg-red-50 border-red-200' };

  return (
    <div className={clsx('rounded-xl border p-4 flex items-center gap-4', config.bg)}>
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: config.dot + '25' }}
      >
        <Circle className="w-6 h-6" style={{ color: config.dot }} fill={config.dot} />
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{hari || 'Status Kepadatan'}</p>
        <p className="text-lg font-bold" style={{ color: config.dot }}>{status}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}
