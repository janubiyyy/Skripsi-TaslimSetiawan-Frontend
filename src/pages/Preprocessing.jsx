// src/pages/Preprocessing.jsx — Preprocessing Data (Min-Max Scaling, Pagination, Grid Borders, Filter Integration)

import { useState, useEffect } from 'react';
import { preprocessingAPI } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useFilterStore } from '../store/filterStore';
import { PageLoading, ErrorState, EmptyState } from '../components/common/LoadingState';
import { Play, FlaskConical, RefreshCw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Preprocessing() {
  const { isAdmin } = useAuth();
  const { selectedTahun, selectedIndeks, selectedGerbang } = useFilterStore();

  const [loading, setLoading] = useState(true);
  const [scaling, setScaling] = useState(false);
  const [error, setError] = useState(null);

  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  const fetchData = async (page = 1, currentLimit = pagination.limit) => {
    setLoading(true);
    setError(null);
    try {
      const [resData, logsData, statsData] = await Promise.all([
        preprocessingAPI.getResults({
          page,
          limit: currentLimit,
          tahun: selectedTahun,
          indeks_hari: selectedIndeks,
          gerbang: selectedGerbang,
        }),
        preprocessingAPI.getLogs(),
        preprocessingAPI.getStats(),
      ]);

      const resultObj = resData.data || {};
      const meta = resultObj.meta || {};
      const rows = resultObj.data || [];

      setResults(rows);
      setLogs(logsData.data?.data || []);
      setStats(statsData.data?.data || null);

      setPagination({
        page: meta.page || page,
        limit: meta.limit || currentLimit,
        total: meta.total !== undefined ? meta.total : rows.length,
        totalPages: meta.totalPages || Math.ceil((meta.total || rows.length) / currentLimit) || 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data preprocessing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.limit);
  }, [selectedTahun, selectedIndeks, selectedGerbang]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage, pagination.limit);
    }
  };

  const handleLimitChange = (newLimit) => {
    fetchData(1, newLimit);
  };

  const handleRunScaling = async () => {
    setScaling(true);
    try {
      const res = await preprocessingAPI.runScaling();
      toast.success(res.data.message || 'Min-Max Scaling berhasil dijalankan!');
      fetchData(1, pagination.limit);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menjalankan Min-Max Scaling.');
    } finally {
      setScaling(false);
    }
  };

  const minMaxInfo = stats?.dataset || {};

  return (
    <div className="space-y-6">
      {/* Header & Run Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            Preprocessing Data & Min-Max Scaling
          </h2>
          <p className="text-xs text-gray-500">
            Penanganan missing value, duplikat, serta normalisasi atribut volume ke rentang [0, 1]
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleRunScaling}
            disabled={scaling}
            className="btn-primary text-xs"
          >
            <Play className="w-3.5 h-3.5" />
            {scaling ? 'Memproses Scaling...' : 'Jalankan Min-Max Scaling'}
          </button>
        )}
      </div>

      {/* Info Formula Min-Max Scaling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-indigo-600 space-y-1">
          <p className="text-xs font-bold text-gray-700">Rumus Min-Max Scaling</p>
          <p className="font-mono text-xs bg-indigo-50 text-indigo-800 p-2 rounded border border-indigo-100">
            x_scaled = (x - x_min) / (x_max - x_min)
          </p>
          <p className="text-[11px] text-gray-400">Rentang output: [0.0 - 1.0]</p>
        </div>

        <div className="card p-4 border-l-4 border-blue-500 space-y-1">
          <p className="text-xs font-bold text-gray-700">Parameter Volume Masuk</p>
          <div className="flex justify-between text-xs font-mono">
            <span>Min: {minMaxInfo.min_v_masuk?.toLocaleString('id-ID') || 0}</span>
            <span>Max: {minMaxInfo.max_v_masuk?.toLocaleString('id-ID') || 0}</span>
          </div>
          <p className="text-[11px] text-gray-400">Total data diproses: {pagination.total}</p>
        </div>

        <div className="card p-4 border-l-4 border-yellow-500 space-y-1">
          <p className="text-xs font-bold text-gray-700">Parameter Volume Keluar</p>
          <div className="flex justify-between text-xs font-mono">
            <span>Min: {minMaxInfo.min_v_keluar?.toLocaleString('id-ID') || 0}</span>
            <span>Max: {minMaxInfo.max_v_keluar?.toLocaleString('id-ID') || 0}</span>
          </div>
          <p className="text-[11px] text-gray-400">Siap untuk K-Means Clustering</p>
        </div>
      </div>

      {/* Tabel Komparasi Data Mentah vs Data Scaled (Grid Borders + Pagination) */}
      <div className="card overflow-hidden border border-gray-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-sm">
            Komparasi Data Mentah (Original) vs Scaled (Normalisasi)
          </h3>

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
              Menampilkan <strong>{results.length}</strong> dari <strong>{pagination.total}</strong> data
            </span>

            <button onClick={() => fetchData(pagination.page, pagination.limit)} className="p-1 rounded hover:bg-gray-100" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchData(1, pagination.limit)} />
        ) : results.length === 0 ? (
          <EmptyState
            title="Belum Ada Hasil Scaling"
            description="Klik tombol 'Jalankan Min-Max Scaling' untuk memproses data mentah."
            action={
              isAdmin ? (
                <button onClick={handleRunScaling} className="btn-primary text-xs">
                  <Play className="w-3.5 h-3.5" /> Jalankan Scaling Sekarang
                </button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/80">
                  <th className="table-header border-r border-gray-200 text-center">NO</th>
                  <th className="table-header border-r border-gray-200">GERBANG TOL</th>
                  <th className="table-header border-r border-gray-200">TAHUN</th>
                  <th className="table-header border-r border-gray-200 text-center">INDEKS HARI</th>
                  <th className="table-header bg-blue-50/80 border-r border-gray-200 text-right">VOL MASUK (RAW)</th>
                  <th className="table-header bg-blue-100/80 border-r border-gray-200 text-right">VOL MASUK (SCALED)</th>
                  <th className="table-header bg-amber-50/80 border-r border-gray-200 text-right">VOL KELUAR (RAW)</th>
                  <th className="table-header bg-amber-100/80 border-r border-gray-200 text-right">VOL KELUAR (SCALED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((item, index) => {
                  const indeksHari = item.dataset?.indeks_hari || 'H';
                  const isHariH = indeksHari === 'H';

                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/40 transition-colors">
                      <td className="table-cell font-mono text-xs text-gray-400 border-r border-gray-200 text-center">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="table-cell font-medium text-gray-900 border-r border-gray-200">
                        {item.dataset?.gerbang || '-'}
                      </td>
                      <td className="table-cell font-semibold text-indigo-600 border-r border-gray-200">
                        {item.dataset?.tahun || '-'}
                      </td>
                      <td className="table-cell border-r border-gray-200 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${isHariH ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-gray-100 text-gray-700'}`}>
                          {indeksHari}
                        </span>
                      </td>
                      <td className="table-cell font-mono border-r border-gray-200 bg-blue-50/20 text-right font-medium text-gray-800">
                        {(item.dataset?.volume_masuk ?? item.dataset?.v_masuk ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="table-cell font-mono font-bold text-blue-600 border-r border-gray-200 bg-blue-50/40 text-right">
                        {Number(item.volume_masuk_scaled).toFixed(6)}
                      </td>
                      <td className="table-cell font-mono border-r border-gray-200 bg-amber-50/20 text-right font-medium text-gray-800">
                        {(item.dataset?.volume_keluar ?? item.dataset?.v_keluar ?? 0).toLocaleString('id-ID')}
                      </td>
                      <td className="table-cell font-mono font-bold text-amber-700 border-r border-gray-200 bg-amber-50/40 text-right">
                        {Number(item.volume_keluar_scaled).toFixed(6)}
                      </td>
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

      {/* Import Log History */}
      {logs.length > 0 && (
        <div className="card p-4 space-y-3 border border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Riwayat Log Preprocessing & Import
          </h3>
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <span className="font-semibold text-gray-800">{log.filename}</span>
                  <span className="text-gray-400 ml-2">({log.file_type})</span>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                  <span>Raw: {log.total_rows_raw}</span>
                  <span className="text-green-600 font-semibold">Inserted: {log.rows_inserted}</span>
                  <span className="text-red-500">Dropped: {log.missing_dropped}</span>
                  <span className="text-yellow-600">Dupes: {log.duplicates_removed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
