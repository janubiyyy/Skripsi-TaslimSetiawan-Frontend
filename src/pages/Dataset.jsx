// src/pages/Dataset.jsx — Halaman Dataset (CRUD Table, Grid Borders, Edit Modal, Single Delete, Reset All, Excel Import/Export)

import { useState, useEffect } from 'react';
import { datasetAPI, preprocessingAPI } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useFilterStore } from '../store/filterStore';
import { exportToExcel } from '../utils/exportExcel';
import { PageLoading, ErrorState, EmptyState } from '../components/common/LoadingState';
import {
  Search, Upload, Download, RefreshCw, Edit2,
  ChevronLeft, ChevronRight, FileSpreadsheet, Trash2, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const INDEKS_OPTIONS = [
  'H-7','H-6','H-5','H-4','H-3','H-2','H-1',
  'H','H+1','H+2','H+3','H+4','H+5','H+6','H+7',
];

export default function Dataset() {
  const { isAdmin } = useAuth();
  const { selectedTahun, selectedIndeks, selectedGerbang } = useFilterStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  // Search & Modals State
  const [search, setSearch] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Edit Modal State
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    gerbang: '',
    tahun: 2024,
    indeks_hari: 'H',
    volume_masuk: 0,
    volume_keluar: 0,
    tanggal: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchDataset = async (page = 1, currentLimit = pagination.limit) => {
    setLoading(true);
    setError(null);
    try {
      const res = await datasetAPI.getAll({
        page,
        limit: currentLimit,
        tahun: selectedTahun,
        indeks_hari: selectedIndeks,
        gerbang: selectedGerbang,
        search,
      });
      const result = res.data;
      const meta = result.meta || {};
      const rows = result.data || [];

      setData(rows);
      setPagination({
        page: meta.page || page,
        limit: meta.limit || currentLimit,
        total: meta.total !== undefined ? meta.total : rows.length,
        totalPages: meta.totalPages || Math.ceil((meta.total || rows.length) / currentLimit) || 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat dataset.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset(1, pagination.limit);
  }, [selectedTahun, selectedIndeks, selectedGerbang, search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDataset(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    fetchDataset(1, newLimit);
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditForm({
      gerbang: item.gerbang || '',
      tahun: item.tahun || 2024,
      indeks_hari: item.indeks_hari || 'H',
      volume_masuk: item.volume_masuk ?? item.v_masuk ?? 0,
      volume_keluar: item.volume_keluar ?? item.v_keluar ?? 0,
      tanggal: item.tanggal || '',
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;

    setSavingEdit(true);
    try {
      await datasetAPI.update(editItem.id, editForm);
      toast.success(`Data ID #${editItem.id} berhasil diperbarui! Pipeline otomatis dijalankan.`);
      setEditItem(null);
      fetchDataset(pagination.page, pagination.limit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Export Excel
  const handleExportExcel = () => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor.');
      return;
    }
    const exportData = data.map((item) => ({
      'ID': item.id,
      'Gerbang Tol': item.gerbang,
      'Tahun': item.tahun,
      'Indeks Hari': item.indeks_hari || '-',
      'Volume Masuk': item.volume_masuk ?? item.v_masuk ?? 0,
      'Volume Keluar': item.volume_keluar ?? item.v_keluar ?? 0,
      'Volume Total': item.volume_total ?? item.v_total ?? 0,
      'Tanggal': item.tanggal || '-',
      'Hari': item.hari || '-',
    }));
    exportToExcel(exportData, 'Dataset Lalu Lintas', `dataset_lalin_${Date.now()}.xlsx`);
    toast.success('File Excel berhasil diunduh.');
  };

  // Handle Reset All Dataset
  const handleResetAll = async () => {
    if (!window.confirm('⚠️ APABILA DIPROSES:\n\nApakah Anda yakin ingin MENGHAPUS SELURUH DATASET?\n\nSeluruh data mentah, hasil scaling, clustering, dan time series akan di-reset total.')) {
      return;
    }

    try {
      const res = await datasetAPI.resetAll();
      toast.success(res.data?.message || 'Semua dataset berhasil di-reset.');
      fetchDataset(1, pagination.limit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus dataset.');
    }
  };

  // Handle Delete Single Row
  const handleDeleteRow = async (id, title) => {
    if (!window.confirm(`Hapus baris data ID #${id} (${title})?`)) return;

    try {
      await datasetAPI.deleteById(id);
      toast.success(`Baris data ID #${id} berhasil dihapus.`);
      fetchDataset(pagination.page, pagination.limit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus data.');
    }
  };

  // Handle Import Excel
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Pilih file Excel/CSV terlebih dahulu.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    setUploading(true);
    try {
      const res = await preprocessingAPI.importFile(formData);
      toast.success(res.data.message || 'Import berhasil!');
      setIsImportModalOpen(false);
      setUploadFile(null);
      fetchDataset(1, pagination.limit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengimport file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dataset Lalu Lintas Lebaran</h2>
          <p className="text-xs text-gray-500">
            Kelola data volume kendaraan GT Cikampek Utama (2016 - 2026)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn-primary text-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                Import Excel
              </button>

              {data.length > 0 && (
                <button
                  onClick={handleResetAll}
                  className="btn-danger text-xs"
                  title="Hapus / Reset Seluruh Dataset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Reset All
                </button>
              )}
            </>
          )}

          <button
            onClick={handleExportExcel}
            className="btn-secondary text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari gerbang, indeks, atau tahun..."
            className="input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span>Tampilkan per halaman:</span>
            <select
              value={pagination.limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="select text-xs py-1 px-2 w-20"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>

          <span>
            Menampilkan <strong>{data.length}</strong> dari <strong>{pagination.total}</strong> data
          </span>

          <button
            onClick={() => fetchDataset(pagination.page, pagination.limit)}
            className="p-1.5 rounded hover:bg-gray-100 transition"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Section — Clean Grid Borders */}
      <div className="card overflow-hidden border border-gray-200 rounded-xl shadow-sm">
        {loading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchDataset(1, pagination.limit)} />
        ) : data.length === 0 ? (
          <EmptyState
            title="Dataset Kosong"
            description="Belum ada data lalu lintas yang tersimpan. Upload file Excel terlebih dahulu."
            action={
              isAdmin ? (
                <button onClick={() => setIsImportModalOpen(true)} className="btn-primary text-xs">
                  <Upload className="w-3.5 h-3.5" /> Upload File Excel
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/80">
                  <th className="table-header border-r border-gray-200">NO</th>
                  <th className="table-header border-r border-gray-200">GERBANG TOL</th>
                  <th className="table-header border-r border-gray-200">TAHUN</th>
                  <th className="table-header border-r border-gray-200">INDEKS HARI</th>
                  <th className="table-header border-r border-gray-200">VOLUME MASUK</th>
                  <th className="table-header border-r border-gray-200">VOLUME KELUAR</th>
                  <th className="table-header border-r border-gray-200">TOTAL VOLUME</th>
                  <th className="table-header border-r border-gray-200">TANGGAL</th>
                  {isAdmin && <th className="table-header text-center">AKSI</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((item, index) => {
                  const vMasuk = item.volume_masuk ?? item.v_masuk ?? 0;
                  const vKeluar = item.volume_keluar ?? item.v_keluar ?? 0;
                  const vTotal = item.volume_total ?? item.v_total ?? (vMasuk + vKeluar);
                  const isHariH = item.indeks_hari === 'H';

                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-400 border-r border-gray-200 text-center">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="table-cell font-medium text-gray-900 border-r border-gray-200">{item.gerbang}</td>
                      <td className="table-cell font-semibold text-indigo-600 border-r border-gray-200">{item.tahun}</td>
                      <td className="table-cell border-r border-gray-200 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${isHariH ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-700'}`}>
                          {item.indeks_hari || 'H'}
                        </span>
                      </td>
                      <td className="table-cell font-mono font-medium text-gray-800 border-r border-gray-200 text-right">
                        {vMasuk.toLocaleString('id-ID')}
                      </td>
                      <td className="table-cell font-mono font-medium text-gray-800 border-r border-gray-200 text-right">
                        {vKeluar.toLocaleString('id-ID')}
                      </td>
                      <td className="table-cell font-mono font-bold text-gray-900 border-r border-gray-200 text-right">
                        {vTotal.toLocaleString('id-ID')}
                      </td>
                      <td className="table-cell text-xs text-gray-500 border-r border-gray-200">{item.tanggal || '-'}</td>
                      {isAdmin && (
                        <td className="table-cell text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600 hover:text-indigo-800 transition"
                              title="Edit baris data ini"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(item.id, `${item.gerbang} ${item.tahun} ${item.indeks_hari || ''}`)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 transition"
                              title="Hapus baris data ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs text-gray-500">
              Halaman <strong>{pagination.page}</strong> dari <strong>{pagination.totalPages}</strong> ({pagination.total} total data)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="btn-secondary text-xs py-1 px-2.5 disabled:opacity-40"
              >
                Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                Edit Data Dataset #{editItem.id}
              </h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Gerbang Tol</label>
                <input
                  type="text"
                  required
                  value={editForm.gerbang}
                  onChange={(e) => setEditForm({ ...editForm, gerbang: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tahun</label>
                  <input
                    type="number"
                    required
                    value={editForm.tahun}
                    onChange={(e) => setEditForm({ ...editForm, tahun: Number(e.target.value) })}
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Indeks Hari</label>
                  <select
                    value={editForm.indeks_hari}
                    onChange={(e) => setEditForm({ ...editForm, indeks_hari: e.target.value })}
                    className="select text-xs"
                  >
                    {INDEKS_OPTIONS.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Volume Masuk</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.volume_masuk}
                    onChange={(e) => setEditForm({ ...editForm, volume_masuk: Number(e.target.value) })}
                    className="input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Volume Keluar</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editForm.volume_keluar}
                    onChange={(e) => setEditForm({ ...editForm, volume_keluar: Number(e.target.value) })}
                    className="input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Tanggal (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editForm.tanggal}
                  onChange={(e) => setEditForm({ ...editForm, tanggal: e.target.value })}
                  className="input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Import Dataset Excel / CSV
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-500 transition">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="excel-file-input"
                />
                <label htmlFor="excel-file-input" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <span className="text-xs font-semibold text-gray-700 block">
                    {uploadFile ? uploadFile.name : 'Klik untuk memilih file Excel (.xlsx / .csv)'}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-1">Mendukung format .xlsx, .xls, .csv hingga 50MB</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="btn-primary text-xs"
                >
                  {uploading ? 'Meng-upload...' : 'Proses Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
