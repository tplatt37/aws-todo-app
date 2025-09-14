'use client';

import { useState } from 'react';

import { ApiError, ApiResponse, ExportResponse } from '@/lib/types';

import LoadingSpinner from './LoadingSpinner';

interface ExportButtonProps {
  onError: (error: ApiError) => void;
}

export default function ExportButton({ onError }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [exportInfo, setExportInfo] = useState<ExportResponse | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setExportInfo(null);
    
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
      });
      
      const data: ApiResponse<ExportResponse> = await response.json();
      
      if (!data.success) {
        onError(data.error || { message: 'Export failed', code: 'EXPORT_ERROR' });
        return;
      }
      
      if (data.data) {
        setExportInfo(data.data);
        // Automatically open the download link
        window.open(data.data.downloadUrl, '_blank');
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        onError(error as ApiError);
      } else {
        onError({ message: 'Failed to export todos', code: 'EXPORT_ERROR' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Processing export..." />;
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg className="mr-2 size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {loading ? 'Exporting...' : 'Export to CSV'}
      </button>
      
      {exportInfo && (
        <div className="text-sm text-gray-600">
          <p>
            Export ready! The download link will expire at{' '}
            {new Date(exportInfo.expiresAt).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
