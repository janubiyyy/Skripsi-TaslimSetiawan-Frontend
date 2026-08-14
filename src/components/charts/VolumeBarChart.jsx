// src/components/charts/VolumeBarChart.jsx
// Grafik Bar Chart — Perbandingan Volume Masuk vs Volume Keluar per indeks hari

import { Bar } from 'react-chartjs-2';
import '../charts/index.js';
import { baseOptions } from './index.js';

const INDEKS_LABELS = ['H-7','H-6','H-5','H-4','H-3','H-2','H-1','H','H+1','H+2','H+3','H+4','H+5','H+6','H+7'];

export default function VolumeBarChart({ trendData = [], height = 320 }) {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Belum ada data volume harian.
      </div>
    );
  }

  const dataByIndeks = {};
  trendData.forEach((row) => {
    dataByIndeks[row.indeks_hari] = {
      masuk: row.avg_v_masuk || 0,
      keluar: row.avg_v_keluar || 0,
    };
  });

  const dataMasuk = INDEKS_LABELS.map((h) => dataByIndeks[h]?.masuk || 0);
  const dataKeluar = INDEKS_LABELS.map((h) => dataByIndeks[h]?.keluar || 0);

  const data = {
    labels: INDEKS_LABELS,
    datasets: [
      {
        label: 'Volume Masuk (Rata-rata)',
        data: dataMasuk,
        backgroundColor: '#4f46e5',
        borderRadius: 6,
      },
      {
        label: 'Volume Keluar (Rata-rata)',
        data: dataKeluar,
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      },
    ],
  };

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { ...baseOptions.plugins.legend, position: 'top' },
      title: {
        display: true,
        text: 'Perbandingan Volume Masuk vs Keluar per Indeks Hari',
        font: { size: 13, weight: '600', family: 'Inter' },
        color: '#374151',
        padding: { bottom: 12 },
      },
    },
    scales: {
      ...baseOptions.scales,
      x: { ...baseOptions.scales.x, title: { display: true, text: 'Indeks Hari', font: { size: 11 }, color: '#9ca3af' } },
      y: { ...baseOptions.scales.y, title: { display: true, text: 'Volume Kendaraan', font: { size: 11 }, color: '#9ca3af' } },
    },
  };

  return (
    <div className="chart-container" style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
