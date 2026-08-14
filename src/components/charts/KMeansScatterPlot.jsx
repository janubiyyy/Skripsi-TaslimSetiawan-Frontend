// src/components/charts/KMeansScatterPlot.jsx
// Grafik Scatter Plot K-Means: Plot distribusi data dengan centroid dan batas cluster berwarna (Merah, Kuning, Hijau)

import { Scatter } from 'react-chartjs-2';
import '../charts/index.js';

export default function KMeansScatterPlot({ scatterPlotData = null, clusters = [], height = 360 }) {
  if (!scatterPlotData || !scatterPlotData.datasets || scatterPlotData.datasets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Belum ada data scatter plot K-Means.
      </div>
    );
  }

  // Build centroid dataset
  const centroidPoints = clusters.map((c, i) => ({
    x: c.centroid?.v_masuk_scaled ?? c.centroid_masuk ?? 0,
    y: c.centroid?.v_keluar_scaled ?? c.centroid_keluar ?? 0,
    label: c.label || `Centroid C${i + 1}`,
  }));

  const centroidDataset = {
    label: 'Centroid Cluster',
    data: centroidPoints,
    backgroundColor: '#000000',
    borderColor: '#ffffff',
    borderWidth: 2,
    pointStyle: 'rectRot',
    pointRadius: 9,
    pointHoverRadius: 11,
  };

  const datasets = [
    ...scatterPlotData.datasets.map((ds) => ({
      ...ds,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
    centroidDataset,
  ];

  const data = { datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
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
            const raw = ctx.raw;
            if (raw.meta) {
              return [
                ` ${ctx.dataset.label}`,
                ` Gerbang: ${raw.meta.gerbang || '-'} (${raw.meta.tahun || '-'})`,
                ` Indeks Hari: ${raw.meta.indeks_hari || '-'}`,
                ` Masuk (Scaled): ${raw.x.toFixed(4)} | Original: ${raw.meta.v_masuk?.toLocaleString('id-ID')}`,
                ` Keluar (Scaled): ${raw.y.toFixed(4)} | Original: ${raw.meta.v_keluar?.toLocaleString('id-ID')}`,
              ];
            }
            return ` ${ctx.dataset.label}: (${raw.x}, ${raw.y})`;
          },
        },
      },
      title: {
        display: true,
        text: 'Scatter Plot Distribusi Cluster & Centroid (Min-Max Scaled 0 - 1)',
        font: { size: 13, weight: '600', family: 'Inter' },
        color: '#374151',
        padding: { bottom: 12 },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Volume Masuk (Normalized 0-1)',
          font: { size: 11, family: 'Inter' },
          color: '#6b7280',
        },
        grid: { color: '#f3f4f6' },
      },
      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: 'Volume Keluar (Normalized 0-1)',
          font: { size: 11, family: 'Inter' },
          color: '#6b7280',
        },
        grid: { color: '#f3f4f6' },
      },
    },
  };

  return (
    <div className="chart-container" style={{ height }}>
      <Scatter data={data} options={options} />
    </div>
  );
}
