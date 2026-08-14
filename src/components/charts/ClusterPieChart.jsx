// src/components/charts/ClusterPieChart.jsx
// Grafik Pie / Doughnut Chart — Persentase sebaran data pada Cluster 1, 2, dan 3

import { Doughnut } from 'react-chartjs-2';
import '../charts/index.js';

export default function ClusterPieChart({ clusters = [], height = 300 }) {
  if (!clusters || clusters.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Belum ada data cluster.
      </div>
    );
  }

  const labels = clusters.map((c) => c.label || `Cluster ${c.k_value || ''}`);
  const counts = clusters.map((c) => c.member_count || 0);
  const colors = ['#22c55e', '#eab308', '#ef4444', '#6366f1', '#a855f7'];

  const totalMembers = counts.reduce((a, b) => a + b, 0);

  const data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors.slice(0, clusters.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 14,
          font: { size: 11, family: 'Inter' },
          color: '#4b5563',
        },
      },
      tooltip: {
        backgroundColor: '#0f1629',
        titleColor: '#ffffff',
        bodyColor: '#e5e7eb',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw || 0;
            const pct = totalMembers > 0 ? ((val / totalMembers) * 100).toFixed(1) : 0;
            return ` ${ctx.label}: ${val.toLocaleString('id-ID')} data (${pct}%)`;
          },
        },
      },
      title: {
        display: true,
        text: 'Sebaran Data Hasil K-Means Clustering',
        font: { size: 13, weight: '600', family: 'Inter' },
        color: '#374151',
        padding: { bottom: 12 },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="chart-container" style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
