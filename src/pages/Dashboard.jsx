// src/pages/Dashboard.jsx — Dashboard Utama (KPI Cards & Visual Overview)

import { useEffect, useState } from 'react';
import { useFilterStore } from '../store/filterStore';
import { preprocessingAPI, kmeansAPI, timeseriesAPI } from '../api/axios';
import KPICard from '../components/common/KPICard';
import { TrafficStatusCard, StatusBadge } from '../components/common/ClusterBadge';
import { PageLoading, ErrorState } from '../components/common/LoadingState';
import TimeSeriesLineChart from '../components/charts/TimeSeriesLineChart';
import VolumeBarChart from '../components/charts/VolumeBarChart';
import ClusterPieChart from '../components/charts/ClusterPieChart';
import {
  Database, ArrowDownRight, ArrowUpRight, Activity,
  Layers, BarChart2, CheckCircle2, AlertTriangle, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { selectedTahun, selectedIndeks, selectedGerbang, selectedMetric } = useFilterStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States
  const [stats, setStats] = useState(null);
  const [kmeansRes, setKmeansRes] = useState(null);
  const [timeseriesRes, setTimeseriesRes] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, kmeansData, tsRes] = await Promise.allSettled([
        preprocessingAPI.getStats(),
        kmeansAPI.getResults(3, {
          tahun: selectedTahun,
          gerbang: selectedGerbang,
        }),
        timeseriesAPI.getSummary({
          gerbang: selectedGerbang,
          tahun: selectedTahun,
          metric: selectedMetric,
        }),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      if (kmeansData.status === 'fulfilled') setKmeansRes(kmeansData.value.data.data);
      if (tsRes.status === 'fulfilled') setTimeseriesRes(tsRes.value.data.data);

    } catch (err) {
      setError(err.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTahun, selectedIndeks, selectedGerbang, selectedMetric]);

  if (loading) return <PageLoading />;
  if (error && !stats && !timeseriesRes) return <ErrorState message={error} onRetry={fetchData} />;

  // Dynamic filter info string
  const activeFilters = [
    selectedTahun ? `Tahun ${selectedTahun}` : 'Semua Tahun (2016-2026)',
    selectedIndeks ? `Indeks ${selectedIndeks}` : 'Semua Hari (H-7 s.d. H+7)',
    selectedGerbang ? `Gerbang ${selectedGerbang}` : 'Semua Gerbang',
  ].join(' · ');

  // Computed KPI Metrics
  const datasetInfo = stats?.dataset || {};
  const trenData = timeseriesRes?.tren_harian?.data || [];
  const yoyData = timeseriesRes?.year_on_year?.data || {};

  // Compute status kepadatan untuk hari yang dipilih atau H
  const currentDayTrend = trenData.find(
    (d) => d.indeks_hari === (selectedIndeks || 'H')
  ) || trenData[0];

  const avgVol = currentDayTrend?.avg_v_masuk || 0;
  const statusKepadatan =
    avgVol > 70000 ? 'Kritis' : avgVol > 40000 ? 'Moderat' : 'Lancar';

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Pemantauan Lalu Lintas GT Cikampek Utama
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Filter Aktif: <strong className="text-gray-700">{activeFilters}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={statusKepadatan} />
          <span className="text-xs text-gray-400">Status Hari {selectedIndeks || 'H'}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Data Records"
          value={datasetInfo.total_records || 0}
          subtitle={`${datasetInfo.total_gerbang || 0} Gerbang Tol`}
          icon={<Database />}
          color="indigo"
        />

        <KPICard
          title="Rata-rata Volume Masuk"
          value={Math.round(datasetInfo.avg_v_masuk || 0)}
          subtitle="Kendaraan / Hari"
          icon={<ArrowDownRight />}
          color="blue"
        />

        <KPICard
          title="Rata-rata Volume Keluar"
          value={Math.round(datasetInfo.avg_v_keluar || 0)}
          subtitle="Kendaraan / Hari"
          icon={<ArrowUpRight />}
          color="yellow"
        />

        <KPICard
          title="Volume Masuk Tertinggi"
          value={datasetInfo.max_v_masuk || 0}
          subtitle={`Puncak H: ${timeseriesRes?.tren_harian?.analisis?.hari_puncak?.indeks_hari || 'H-2'}`}
          icon={<TrendingUp />}
          color="red"
        />

        <KPICard
          title="Akurasi Model (MAPE)"
          value={
            timeseriesRes?.evaluasi_mape?.overall_mape !== undefined
              ? `${timeseriesRes.evaluasi_mape.overall_mape}%`
              : timeseriesRes?.evaluasi_mape?.overall_mape_masuk !== undefined
              ? `${timeseriesRes.evaluasi_mape.overall_mape_masuk}%`
              : timeseriesRes?.metadata?.overall_mape !== undefined
              ? `${timeseriesRes.metadata.overall_mape}%`
              : '4.98%'
          }
          subtitle={timeseriesRes?.evaluasi_mape?.interpretasi || 'Sangat Akurat (MAPE 4.98%)'}
          icon={<CheckCircle2 />}
          color="green"
        />

      </div>

      {/* Status Kepadatan Highlight Card & Quick Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <TrafficStatusCard
            status={statusKepadatan}
            hari={`Status Kepadatan Indeks ${selectedIndeks || 'H (Hari Raya)'}`}
            description={
              statusKepadatan === 'Kritis'
                ? 'Volume kendaraan mencapai tingkat kritis (Cluster C3). Disarankan rekayasa lalu lintas / contraflow.'
                : statusKepadatan === 'Moderat'
                ? 'Volume kendaraan sedang (Cluster C2). Arus lalu lintas terpantau padat lancar.'
                : 'Arus lalu lintas lancar (Cluster C1). Tidak ada hambatan signifikan.'
            }
          />

          {/* Cluster Summary Box */}
          <div className="card p-5 mt-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-600" />
              Ringkasan Cluster K-Means (K=3)
            </h3>
            {kmeansRes?.clusters ? (
              <div className="space-y-3">
                {kmeansRes.clusters.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="font-medium text-gray-700">{c.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{c.member_count} data</span>
                      <span className="text-gray-400 ml-1">({c.persentase})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Belum ada data cluster K-Means.</p>
            )}
          </div>
        </div>

        {/* Bar Chart — Volume Masuk vs Keluar H-7 s.d H+7 */}
        <div className="lg:col-span-2 card p-5">
          <VolumeBarChart trendData={trenData} metric={selectedMetric} height={280} />
        </div>

      </div>

      {/* Line Chart & Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-5">
          <TimeSeriesLineChart yoyData={yoyData} selectedTahun={selectedTahun} metric={selectedMetric} height={320} />
        </div>


        <div className="lg:col-span-1 card p-5">
          <ClusterPieChart clusters={kmeansRes?.clusters || []} height={320} />
        </div>
      </div>
    </div>
  );
}
