'use client';

import { useState } from 'react';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useMounted } from '@/hooks/useMounted';
import { JobList } from '@/components/jobs/JobList';
import { JobModal } from '@/components/jobs/JobModal';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Job } from '@/lib/types';

export default function BookmarksPage() {
  const mounted = useMounted();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const { bookmarks, clearBookmarks } = useBookmarkStore();

    // Hydration mismatch 방지: 마운트 전에는 렌더링 하지 않거나 로딩 상태 표시
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
           <div className="animate-pulse space-y-4">
             <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
               ))}
             </div>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            관심 공고 ({bookmarks.length})
          </h2>
          
          {bookmarks.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('모든 관심 공고를 삭제하시겠습니까?')) {
                  clearBookmarks();
                }
              }}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              전체 삭제
            </button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 dark:text-white">저장된 관심 공고가 없습니다.</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">마음에 드는 공고의 하트 버튼을 눌러 저장해보세요.</p>
          </div>
        ) : (
          <JobList 
            jobs={bookmarks} 
            isLoading={false} 
            onJobClick={setSelectedJob} 
          />
        )}
      </main>

      <Footer />
      
      {selectedJob && (
        <JobModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}
