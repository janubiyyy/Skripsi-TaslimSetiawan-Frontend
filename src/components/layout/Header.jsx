// src/components/layout/Header.jsx

import { Menu, Bell, RefreshCw } from 'lucide-react';
import { useFilterStore } from '../../store/filterStore';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard Utama',
  '/dataset': 'Manajemen Dataset',
  '/preprocessing': 'Preprocessing Data',
  '/visualization': 'Visualisasi & Clustering',
  '/report': 'Generator Laporan',
};

const INDEKS_OPTIONS = [
  'H-7','H-6','H-5','H-4','H-3','H-2','H-1',
  'H','H+1','H+2','H+3','H+4','H+5','H+6','H+7',
];
const TAHUN_OPTIONS = Array.from({ length: 11 }, (_, i) => 2016 + i);

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  const {
    selectedTahun, setTahun,
    selectedIndeks, setIndeks,
    selectedGerbang, setGerbang,
    gerbangOptions, resetFilters,
    selectedMetric, setMetric,
  } = useFilterStore();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center gap-3 px-4 sticky top-0 z-10">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Page title */}
      <h1 className="font-semibold text-gray-800 text-sm hidden sm:block">{title}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* ── Filter Dropdowns ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Tahun */}
        <select
          value={selectedTahun || ''}
          onChange={(e) => setTahun(e.target.value ? Number(e.target.value) : null)}
          className="select text-xs py-1.5 w-28"
        >
          <option value="">Semua Tahun</option>
          {TAHUN_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Metric */}
        <select
          value={selectedMetric}
          onChange={(e) => setMetric(e.target.value)}
          className="select text-xs py-1.5 w-28 hidden md:block"
        >
          <option value="masuk">Volume Masuk</option>
          <option value="keluar">Volume Keluar</option>
          <option value="total">Total</option>
        </select>

        {/* Reset filter */}
        <button
          onClick={resetFilters}
          title="Reset semua filter"
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
