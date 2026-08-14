// src/utils/exportExcel.js — Export data ke Excel (.xlsx)

import * as XLSX from 'xlsx';

const HEADER_FILL = { fgColor: { rgb: '4F46E5' } }; // primary-600

/**
 * Export array of objects ke file Excel
 * @param {object[]} data
 * @param {string} sheetName
 * @param {string} filename
 * @param {object} [meta] — metadata untuk baris info di atas data
 */
export const exportToExcel = (data, sheetName = 'Sheet1', filename = 'export.xlsx', meta = null) => {
  const wb = XLSX.utils.book_new();

  let startRow = 0;
  const wsData = [];

  // Meta info rows
  if (meta) {
    wsData.push([`Laporan: ${meta.title || sheetName}`]);
    wsData.push([`Dicetak: ${new Date().toLocaleString('id-ID')}`]);
    wsData.push(meta.filter ? [`Filter: ${meta.filter}`] : []);
    wsData.push([]);
    startRow = 4;
  }

  if (data.length === 0) {
    wsData.push(['Tidak ada data untuk diekspor.']);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
    return;
  }

  // Header row
  const headers = Object.keys(data[0]).map((h) =>
    h.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
  wsData.push(headers);

  // Data rows
  data.forEach((row) => wsData.push(Object.values(row)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 4, 12) }));
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  XLSX.writeFile(wb, filename);
};

/**
 * Export rekapitulasi tahunan (multi-sheet)
 * @param {object} yearData — { 2016: [...rows], 2017: [...rows], ... }
 * @param {string} filename
 */
export const exportYearlyRecap = (yearData, filename = 'rekapitulasi-tahunan.xlsx') => {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows = [
    ['REKAPITULASI DATA LALU LINTAS LEBARAN'],
    [`Dicetak: ${new Date().toLocaleString('id-ID')}`],
    [],
    ['Tahun', 'Total Data', 'Total Masuk', 'Total Keluar', 'Avg Masuk', 'Avg Keluar'],
  ];

  Object.entries(yearData).forEach(([tahun, rows]) => {
    const totalMasuk = rows.reduce((s, r) => s + (r.v_masuk || r.volume_masuk || 0), 0);
    const totalKeluar = rows.reduce((s, r) => s + (r.v_keluar || r.volume_keluar || 0), 0);
    summaryRows.push([
      tahun,
      rows.length,
      totalMasuk,
      totalKeluar,
      Math.round(totalMasuk / rows.length) || 0,
      Math.round(totalKeluar / rows.length) || 0,
    ]);
  });

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
  summaryWs['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

  // Per-year sheets
  Object.entries(yearData).forEach(([tahun, rows]) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]).map((h) => h.replace(/_/g, ' ').toUpperCase());
    const wsData = [headers, ...rows.map((r) => Object.values(r))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 2, 10) }));
    XLSX.utils.book_append_sheet(wb, ws, `Tahun ${tahun}`);
  });

  XLSX.writeFile(wb, filename);
};

/**
 * Export data H-7 s.d. H+7
 */
export const exportHariRayaData = (data, filename = 'data-lebaran-H7.xlsx') => {
  const INDEKS_ORDER = ['H-7','H-6','H-5','H-4','H-3','H-2','H-1','H','H+1','H+2','H+3','H+4','H+5','H+6','H+7'];
  const sorted = [...data].sort((a, b) => {
    return INDEKS_ORDER.indexOf(a.indeks_hari) - INDEKS_ORDER.indexOf(b.indeks_hari);
  });
  exportToExcel(sorted, 'H-7 sd H+7', filename, {
    title: 'Data Lalu Lintas H-7 s.d H+7',
    filter: 'Semua Gerbang & Tahun',
  });
};
