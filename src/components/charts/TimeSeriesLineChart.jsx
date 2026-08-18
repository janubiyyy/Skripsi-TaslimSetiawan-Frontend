// src/components/charts/TimeSeriesLineChart.jsx
// Grafik Line Chart — Tren volume kendaraan per tahun (YoY H-7 s.d. H+7)

import { Line } from 'react-chartjs-2';
import '../charts/index.js';
import { baseOptions, YEAR_PALETTE } from './index.js';

const INDEKS_LABELS = ['H-7','H-6','H-5','H-4','H-3','H-2','H-1','H','H+1','H+2','H+3','H+4','H+5','H+6','H+7'];

export default function TimeSeriesLineChart({ yoyData = {}, metric = 'masuk', height = 320 }) {
  if (!yoyData || (Object.keys(yoyData).length === 0 && !yoyData?.series)) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Belum ada data time series.
      </div>
    );
  }

  let datasets = [];

  // Support series array format
  if (yoyData?.series && Array.isArray(yoyData.series)) {
    datasets = yoyData.series.map((s, idx) => ({
      label: s.name || `Tahun ${idx + 1}`,
      data: s.data || [],
      borderColor: YEAR_PALETTE[idx % YEAR_PALETTE.length],
      backgroundColor: 'transparent',
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
      spanGaps: true,
    }));
  } else if (typeof yoyData === 'object') {
    // Support year-keyed object format { '2022': { data_per_hari: [...] } }
    const years = Object.keys(yoyData).filter((y) => y !== 'labels' && y !== 'series').sort();
    const metricKey = metric === 'keluar' ? 'avg_v_keluar'
      : metric === 'total' ? 'avg_v_total'
      : 'avg_v_masuk';

    datasets = years.map((year, idx) => {
      const yearObj = yoyData[year];
      const yearRows = Array.isArray(yearObj) ? yearObj : yearObj?.data_per_hari || [];
      const dataByIndeks = {};
      yearRows.forEach((r) => {
        dataByIndeks[r.indeks_hari] = r[metricKey] ?? r.avg_v_masuk ?? r.v_masuk ?? null;
      });

      return {
        label: String(year),
        data: INDEKS_LABELS.map((h) => dataByIndeks[h] ?? null),
        borderColor: YEAR_PALETTE[idx % YEAR_PALETTE.length],
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        spanGaps: true,
      };
    });
  }

  const data = { labels: INDEKS_LABELS, datasets };

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      legend: { ...baseOptions.plugins.legend, position: 'top' },
      title: {
        display: true,
        text: `Tren Volume ${metric === 'keluar' ? 'Keluar' : metric === 'total' ? 'Total' : 'Masuk'} H-7 s.d. H+7 (Year-on-Year)`,
        font: { size: 13, weight: '600', family: 'Inter' },
        color: '#374151',
        padding: { bottom: 12 },
      },
    },
    scales: {
      ...baseOptions.scales,
      x: { ...baseOptions.scales.x, title: { display: true, text: 'Indeks Hari Lebaran', font: { size: 11 }, color: '#9ca3af' } },
      y: { ...baseOptions.scales.y, title: { display: true, text: 'Rata-rata Volume Kendaraan', font: { size: 11 }, color: '#9ca3af' } },
    },
  };

  return (
    <div className="chart-container" style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
