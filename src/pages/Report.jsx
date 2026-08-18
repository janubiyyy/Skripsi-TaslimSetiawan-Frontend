// src/pages/Report.jsx — Generator Laporan (Cetak / Export PDF & Excel Rekapitulasi)

import { useState, useEffect } from 'react';
import { timeseriesAPI, datasetAPI } from '../api/axios';
import { exportTableToPDF, exportDashboardReport } from '../utils/exportPDF';
import { exportToExcel, exportYearlyRecap, exportHariRayaData } from '../utils/exportExcel';
import { PageLoading } from '../components/common/LoadingState';
import {
  FileText, Download, FileSpreadsheet, Printer,
  CheckCircle2, Calendar, Database, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useFilterStore } from '../store/filterStore';

export default function Report() {
  const { selectedTahun, selectedGerbang, selectedMetric } = useFilterStore();
  const [loading, setLoading] = useState(true);
  const [timeseriesRes, setTimeseriesRes] = useState(null);
  const [datasetList, setDatasetList] = useState([]);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      try {
        const [tsRes, dsRes] = await Promise.all([
          timeseriesAPI.getSummary({ gerbang: selectedGerbang, tahun: selectedTahun, metric: selectedMetric }),
          datasetAPI.getAll({ limit: 1000, gerbang: selectedGerbang, tahun: selectedTahun }),
        ]);
        setTimeseriesRes(tsRes.data.data || null);
        setDatasetList(dsRes.data.data || []);
      } catch (err) {
        toast.error('Gagal memuat data laporan.');
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, [selectedTahun, selectedGerbang, selectedMetric]);


  // PDF Handlers
  const handleExportPDFTable = () => {
    if (datasetList.length === 0) return toast.error('Data kosong');
    const formattedList = datasetList.map((item) => ({
      ...item,
      volume_masuk: item.volume_masuk ?? item.v_masuk ?? 0,
      volume_keluar: item.volume_keluar ?? item.v_keluar ?? 0,
      volume_total: item.volume_total ?? item.v_total ?? 0,
    }));
    const columns = ['gerbang', 'tahun', 'indeks_hari', 'volume_masuk', 'volume_keluar', 'volume_total'];
    exportTableToPDF(formattedList, columns, 'Laporan Rekapitulasi Lalu Lintas Lebaran', `Laporan_Lalin_Lebaran_${Date.now()}.pdf`);
    toast.success('Laporan PDF berhasil didownload.');
  };

  const handleExportFullReportPDF = () => {
    if (datasetList.length === 0) return toast.error('Data kosong');
    const formattedList = datasetList.map((item) => ({
      ...item,
      volume_masuk: item.volume_masuk ?? item.v_masuk ?? 0,
      volume_keluar: item.volume_keluar ?? item.v_keluar ?? 0,
      volume_total: item.volume_total ?? item.v_total ?? 0,
    }));
    const columns = ['gerbang', 'tahun', 'indeks_hari', 'volume_masuk', 'volume_keluar', 'volume_total'];
    exportDashboardReport('dashboard-report-area', formattedList, columns, `Laporan_Lengkap_Skripsi_${Date.now()}.pdf`);
    toast.success('Dokumen Laporan PDF berhasil dibuat.');
  };

  // Excel Handlers
  const handleExportExcelAll = () => {
    if (datasetList.length === 0) return toast.error('Data kosong');
    exportToExcel(datasetList, 'Semua Data', `Dataset_Lalin_Lebaran_${Date.now()}.xlsx`);
    toast.success('File Excel berhasil didownload.');
  };

  const handleExportYearlyRecapExcel = () => {
    if (datasetList.length === 0) return toast.error('Data kosong');
    const yearGrouped = {};
    datasetList.forEach((item) => {
      const year = item.tahun || 'Unknown';
      if (!yearGrouped[year]) yearGrouped[year] = [];
      yearGrouped[year].push(item);
    });
    exportYearlyRecap(yearGrouped, `Rekapitulasi_Tahunan_2016-2026_${Date.now()}.xlsx`);
    toast.success('Rekapitulasi Tahunan Excel berhasil didownload.');
  };

  const handleExportH7Excel = () => {
    if (datasetList.length === 0) return toast.error('Data kosong');
    exportHariRayaData(datasetList, `Data_Lebaran_H7_H7_${Date.now()}.xlsx`);
    toast.success('Export data H-7 s.d H+7 berhasil.');
  };

  if (loading) return <PageLoading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Generator Laporan & Export Data
        </h2>
        <p className="text-xs text-gray-500">
          Cetak dokumen resmi PDF dan export rekapitulasi data format Excel (.xlsx) untuk analisis skripsi
        </p>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Cetak PDF Laporan Ringkas */}
        <div className="card p-5 space-y-4 hover:border-indigo-200 transition">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Dokumen Laporan PDF</h3>
            <p className="text-xs text-gray-500 mt-1">
              Download laporan cetak PDF lengkap dengan header instansi, tanggal cetak, dan tabel data rekapitulasi.
            </p>
          </div>
          <button
            onClick={handleExportPDFTable}
            className="btn-primary w-full text-xs justify-center"
          >
            <Download className="w-3.5 h-3.5" />
            Download Laporan PDF
          </button>
        </div>

        {/* Card 2: Export Excel Rekapitulasi Tahunan */}
        <div className="card p-5 space-y-4 hover:border-green-200 transition">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Rekapitulasi Tahunan Excel</h3>
            <p className="text-xs text-gray-500 mt-1">
              Export file Excel multi-sheet terstruktur per tahun (2016-2026) dilengkapi sheet Ringkasan.
            </p>
          </div>
          <button
            onClick={handleExportYearlyRecapExcel}
            className="btn-secondary w-full text-xs justify-center text-green-700 border-green-200 hover:bg-green-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export Rekap Tahunan (.xlsx)
          </button>
        </div>

        {/* Card 3: Export Excel Data H-7 s.d. H+7 */}
        <div className="card p-5 space-y-4 hover:border-yellow-200 transition">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Data Pola H-7 s.d. H+7 Excel</h3>
            <p className="text-xs text-gray-500 mt-1">
              Export data terurut berdasarkan kronologi indeks hari Lebaran dari H-7 hingga H+7.
            </p>
          </div>
          <button
            onClick={handleExportH7Excel}
            className="btn-secondary w-full text-xs justify-center text-yellow-700 border-yellow-200 hover:bg-yellow-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export Pola H-7/H+7 (.xlsx)
          </button>
        </div>
      </div>

      {/* Preview Ringkasan Laporan */}
      <div className="card p-5 space-y-4">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          Pratinjau Parameter Laporan
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-400 block">Total Baris Data</span>
            <span className="font-bold text-gray-900 text-sm">{datasetList.length} Records</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-400 block">Rentang Tahun</span>
            <span className="font-bold text-indigo-600 text-sm">2016 - 2026</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-400 block">Cakupan Hari</span>
            <span className="font-bold text-gray-900 text-sm">H-7 s.d. H+7</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-400 block">Evaluasi MAPE</span>
            <span className="font-bold text-green-600 text-sm">
              {timeseriesRes?.evaluasi_mape?.overall_mape_masuk
                ? `${timeseriesRes.evaluasi_mape.overall_mape_masuk}%`
                : 'Sangat Akurat'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
