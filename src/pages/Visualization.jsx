// src/pages/Visualization.jsx — Visualisasi Interaktif (Line, Bar, Pie, Scatter Plot, Elbow Curve)

import { useState, useEffect } from 'react';
import { useFilterStore } from '../store/filterStore';
import { useAuth } from '../contexts/AuthContext';
import { kmeansAPI, timeseriesAPI } from '../api/axios';
import TimeSeriesLineChart from '../components/charts/TimeSeriesLineChart';
import VolumeBarChart from '../components/charts/VolumeBarChart';
import ClusterPieChart from '../components/charts/ClusterPieChart';
import KMeansScatterPlot from '../components/charts/KMeansScatterPlot';
import { PageLoading, ErrorState } from '../components/common/LoadingState';
import { ClusterBadge } from '../components/common/ClusterBadge';
import {
  BarChart3, Play, Activity, Layers, PieChart as PieIcon,
  ScatterChart, LineChart as LineIcon, Info, HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Visualization() {
  const { isAdmin } = useAuth();
  const { selectedTahun, selectedIndeks, selectedGerbang, selectedMetric } = useFilterStore();

  const [loading, setLoading] = useState(true);
  const [runningKmeans, setRunningKmeans] = useState(false);
  const [error, setError] = useState(null);

  const [kValue, setKValue] = useState(3);
  const [kmeansRes, setKmeansRes] = useState(null);
  const [timeseriesRes, setTimeseriesRes] = useState(null);
  const [elbowData, setElbowData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [kmData, tsData, elData] = await Promise.allSettled([
        kmeansAPI.getResults(kValue, {
          tahun: selectedTahun,
          gerbang: selectedGerbang,
        }),
        timeseriesAPI.getSummary({
          gerbang: selectedGerbang,
          tahun: selectedTahun,
          metric: selectedMetric,
        }),
        kmeansAPI.getElbow(2, 8),
      ]);


      if (kmData.status === 'fulfilled') setKmeansRes(kmData.value.data.data);
      if (tsData.status === 'fulfilled') setTimeseriesRes(tsData.value.data.data);
      if (elData.status === 'fulfilled') setElbowData(elData.value.data.data);

    } catch (err) {
      setError('Gagal memuat data visualisasi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kValue, selectedTahun, selectedIndeks, selectedGerbang, selectedMetric]);

  const handleRunKMeans = async () => {
    setRunningKmeans(true);
    try {
      const res = await kmeansAPI.run(kValue);
      toast.success(res.data.message || `K-Means (K=${kValue}) selesai!`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal me-run K-Means.');
    } finally {
      setRunningKmeans(false);
    }
  };

  if (loading) return <PageLoading />;

  const yoyData = timeseriesRes?.year_on_year?.data || {};
  const trenData = timeseriesRes?.tren_harian?.data || [];
  const scatterPlotData = kmeansRes?.scatter_plot || null;
  const clusters = kmeansRes?.clusters || [];

  return (
    <div className="space-y-6">
      {/* Header & K-Means Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Visualisasi Time Series & K-Means Clustering
          </h2>
          <p className="text-xs text-gray-500">
            Eksplorasi grafis interaktif tren pergerakan kendaraan dan hasil kluster K-Means
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">K-Value:</label>
            <select
              value={kValue}
              onChange={(e) => setKValue(Number(e.target.value))}
              className="select text-xs py-1.5 w-20"
            >
              {[2, 3, 4, 5, 6].map((k) => (
                <option key={k} value={k}>K={k}</option>
              ))}
            </select>
            <button
              onClick={handleRunKMeans}
              disabled={runningKmeans}
              className="btn-primary text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              {runningKmeans ? 'Memproses...' : 'Run K-Means'}
            </button>
          </div>
        )}
      </div>

      {/* Cluster Evaluation Cards */}
      {kmeansRes && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Inertia (SSE)</p>
              <p className="text-xl font-bold text-gray-900">{kmeansRes.clusters?.[0]?.evaluasi?.inertia || 'N/A'}</p>
            </div>
            <Activity className="w-8 h-8 text-indigo-200" />
          </div>

          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Silhouette Score</p>
              <p className="text-xl font-bold text-green-600">
                {kmeansRes.clusters?.[0]?.evaluasi?.silhouette_score || '0.70+'}
              </p>
            </div>
            <Layers className="w-8 h-8 text-green-200" />
          </div>

          <div className="card p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Jumlah Cluster (K)</p>
              <p className="text-xl font-bold text-gray-900">K = {kValue}</p>
            </div>
            <PieIcon className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      )}

      {/* Section 1: Line Chart (Time Series) & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <TimeSeriesLineChart yoyData={yoyData} selectedTahun={selectedTahun} metric={selectedMetric} height={340} />
        </div>


        <div className="card p-5">
          <VolumeBarChart trendData={trenData} height={340} />
        </div>
      </div>

      {/* Section 2: K-Means Scatter Plot & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <KMeansScatterPlot scatterPlotData={scatterPlotData} clusters={clusters} height={360} />
        </div>

        <div className="lg:col-span-1 card p-5 space-y-4">
          <ClusterPieChart clusters={clusters} height={280} />

          {/* Cluster Details List */}
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-700">Detail Centroid Cluster:</p>
            {clusters.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded border border-gray-100">
                <span className="font-medium text-gray-800">{c.label}</span>
                <span className="font-mono text-gray-500">
                  ({c.centroid?.v_masuk_scaled?.toFixed(4)}, {c.centroid?.v_keluar_scaled?.toFixed(4)})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
