'use client';

import { useState } from 'react';
import { ApiResponse, ExportResponse } from '@/lib/types';

interface ExportButtonProps {
  onError: (error: string) => void;
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
        throw new Error(data.error?.message || 'Export failed');
      }
      
      if (data.data) {
        setExportInfo(data.data);
        // Automatically open the download link
        window.open(data.data.downloadUrl, '_blank');
      }
    } catch (error: any) {
      onError(error.message || 'Failed to export todos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleExport}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
