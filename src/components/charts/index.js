// src/components/charts/index.js — Chart.js global registration

import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
);

// ── Shared chart options ──────────────────────────────────────────────────
export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 16,
        font: { size: 11, family: 'Inter' },
        color: '#6b7280',
      },
    },
    tooltip: {
      backgroundColor: '#0f1629',
      titleColor: '#f9fafb',
      bodyColor: '#d1d5db',
      padding: 10,
      cornerRadius: 8,
      titleFont: { size: 12, weight: '600', family: 'Inter' },
      bodyFont: { size: 11, family: 'Inter' },
      callbacks: {
        label: (ctx) => `  ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString('id-ID')}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 11, family: 'Inter' }, color: '#9ca3af' },
    },
    y: {
      grid: { color: '#f3f4f6', drawBorder: false },
      ticks: {
        font: { size: 11, family: 'Inter' },
        color: '#9ca3af',
        callback: (v) => Number(v).toLocaleString('id-ID'),
      },
    },
  },
};

// Year palette (11 warna berbeda)
export const YEAR_PALETTE = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6', '#a855f7',
];

export const CLUSTER_COLORS = {
  0: { bg: 'rgba(34,197,94,0.7)',  border: '#22c55e', label: 'C1 - Rendah (Lancar)' },
  1: { bg: 'rgba(234,179,8,0.7)',  border: '#eab308', label: 'C2 - Sedang (Moderat)' },
  2: { bg: 'rgba(239,68,68,0.7)',  border: '#ef4444', label: 'C3 - Tinggi (Kritis)' },
};
