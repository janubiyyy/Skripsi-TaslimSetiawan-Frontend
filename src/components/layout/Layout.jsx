// src/components/layout/Layout.jsx

import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { datasetAPI } from '../../api/axios';
import { useFilterStore } from '../../store/filterStore';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setGerbangOptions = useFilterStore((s) => s.setGerbangOptions);

  // Load daftar gerbang saat mount untuk filter dropdown
  useEffect(() => {
    datasetAPI.getGerbangList()
      .then(({ data }) => setGerbangOptions(data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-60">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-5 page-enter flex-1">
            <Outlet />
          </div>
          <footer className="py-3 px-5 border-t border-gray-200 text-center text-xs text-gray-500 bg-white">
            Created by <strong className="text-gray-700">Taslim Setiawan</strong> &bull; Universitas Nasional &bull; NPM: <span className="font-mono font-semibold text-gray-700">227064416115</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
