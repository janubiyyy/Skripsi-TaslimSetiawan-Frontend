// src/store/filterStore.js — Zustand global state untuk filter dashboard

import { create } from 'zustand';

const INDEKS_HARI = [
  'H-7', 'H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1',
  'H', 'H+1', 'H+2', 'H+3', 'H+4', 'H+5', 'H+6', 'H+7',
];

const TAHUN_RANGE = Array.from({ length: 11 }, (_, i) => 2016 + i); // 2016-2026

export const useFilterStore = create((set) => ({
  // Filter state
  selectedTahun: null,       // null = semua tahun
  selectedIndeks: null,      // null = semua indeks hari
  selectedGerbang: null,     // null = semua gerbang
  selectedMetric: 'masuk',   // 'masuk' | 'keluar' | 'total'

  // Options
  tahunOptions: TAHUN_RANGE,
  indeksOptions: INDEKS_HARI,
  gerbangOptions: [],        // Di-populate dari API

  // Actions
  setTahun: (val) => set({ selectedTahun: val }),
  setIndeks: (val) => set({ selectedIndeks: val }),
  setGerbang: (val) => set({ selectedGerbang: val }),
  setMetric: (val) => set({ selectedMetric: val }),
  setGerbangOptions: (list) => set({ gerbangOptions: list }),
  resetFilters: () => set({ selectedTahun: null, selectedIndeks: null, selectedGerbang: null }),
}));
