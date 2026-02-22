'use client';

import { useState, useEffect } from 'react';
import type { Release, ReleaseStatus } from '@/lib/types';
import ReleaseList from './ReleaseList';
import ReleaseDetail from './ReleaseDetail';
import CreateReleaseModal from './CreateReleaseModal';

export default function HomePage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  // Mobile view: 'list' | 'detail'
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  useEffect(() => {
    fetch('/api/releases')
      .then((r) => r.json())
      .then((data) => {
        setReleases(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileView('detail');
  }

  function handleCreate(release: Release) {
    setReleases((prev) => [release, ...prev]);
    setSelectedId(release.id);
    setMobileView('detail');
  }

  function handleDeleted(id: string) {
    setReleases((prev) => {
      const next = prev.filter((r) => r.id !== id);
      if (selectedId === id) {
        setSelectedId(next.length > 0 ? next[0].id : null);
        setMobileView('list');
      }
      return next;
    });
  }

  function handleStatusChange(id: string, status: ReleaseStatus, doneCount: number) {
    setReleases((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, done_count: doneCount } : r))
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* App bar */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h1 className="text-base font-bold text-gray-900">Release Checklist</h1>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile when viewing detail */}
        <aside
          className={`flex-shrink-0 border-r border-gray-200 bg-white ${
            mobileView === 'detail' ? 'hidden md:flex' : 'flex'
          } w-full flex-col md:w-72 lg:w-80`}
        >
          <ReleaseList
            releases={releases}
            selectedId={selectedId}
            loading={loading}
            onSelect={handleSelect}
            onNew={() => setShowCreate(true)}
          />
        </aside>

        {/* Detail panel */}
        <main
          className={`flex-1 overflow-hidden bg-white ${
            mobileView === 'list' ? 'hidden md:block' : 'block'
          }`}
        >
          {selectedId ? (
            <ReleaseDetail
              key={selectedId}
              releaseId={selectedId}
              onBack={() => setMobileView('list')}
              onDeleted={handleDeleted}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-500">No release selected</p>
                <p className="text-xs text-gray-400">Create a release or select one from the list</p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                + Create your first release
              </button>
            </div>
          )}
        </main>
      </div>

      <CreateReleaseModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
