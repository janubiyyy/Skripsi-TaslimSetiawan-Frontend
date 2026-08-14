// src/utils/exportPDF.js — Export laporan ke PDF

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const TITLE_COLOR = [15, 22, 41];   // #0f1629 sidebar color
const HEADER_COLOR = [79, 70, 229]; // primary-600

/**
 * Export tabel data ke PDF
 * @param {object[]} data — array of objects
 * @param {string[]} columns — nama kolom untuk header
 * @param {string} title — judul laporan
 * @param {string} filename — nama file output
 */
export const exportTableToPDF = (data, columns, title = 'Laporan', filename = 'laporan.pdf') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header laporan
  doc.setFillColor(...TITLE_COLOR);
  doc.rect(0, 0, 297, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dashboard Analisis Lalu Lintas Lebaran', 14, 10);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 17);

  // Tanggal cetak
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 297 - 14, 17, { align: 'right' });

  // Tabel
  const tableData = data.map((row) => columns.map((col) => row[col] ?? '-'));
  const headers = columns.map((c) => c.replace(/_/g, ' ').toUpperCase());

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 28,
    headStyles: {
      fillColor: HEADER_COLOR,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { overflow: 'linebreak' },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${pageCount} — Skripsi Analisis Pola Lalu Lintas Lebaran`,
      148.5, 205, { align: 'center' }
    );
  }

  doc.save(filename);
};

/**
 * Capture elemen HTML (chart / section) ke PDF
 * @param {string} elementId — id elemen DOM
 * @param {string} title
 * @param {string} filename
 */
export const exportChartToPDF = async (elementId, title = 'Visualisasi', filename = 'chart.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Elemen #${elementId} tidak ditemukan`);

  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/png');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const imgWidth = 270;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Header
  doc.setFillColor(...TITLE_COLOR);
  doc.rect(0, 0, 297, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(title, 14, 12);
  doc.setFontSize(8);
  doc.text(new Date().toLocaleString('id-ID'), 297 - 14, 12, { align: 'right' });

  doc.addImage(imgData, 'PNG', 14, 22, imgWidth, Math.min(imgHeight, 170));
  doc.save(filename);
};

/**
 * Export full dashboard section (screenshot + tabel)
 */
export const exportDashboardReport = async (dashboardId, tableData, columns, filename = 'laporan-dashboard.pdf') => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Cover page
  doc.setFillColor(...TITLE_COLOR);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ANALISIS', 105, 100, { align: 'center' });
  doc.text('POLA LALU LINTAS LEBARAN', 105, 115, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('GT Cikampek Utama | 2016-2026', 105, 130, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`K-Means Clustering & Time Series Analysis`, 105, 145, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 180);
  doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, 105, 270, { align: 'center' });

  // Data table page
  doc.addPage();
  const headers = columns.map((c) => c.replace(/_/g, ' ').toUpperCase());
  const tableRows = tableData.map((row) => columns.map((col) => String(row[col] ?? '-')));

  doc.setFontSize(14);
  doc.setTextColor(15, 22, 41);
  doc.text('Rekapitulasi Data Lalu Lintas', 14, 20);

  autoTable(doc, {
    head: [headers],
    body: tableRows,
    startY: 28,
    headStyles: { fillColor: HEADER_COLOR, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7, cellPadding: 1.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Halaman ${i - 1} dari ${pageCount - 1}`, 105, 290, { align: 'center' });
  }

  doc.save(filename);
};
