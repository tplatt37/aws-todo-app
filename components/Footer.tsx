'use client';

import { useState, useEffect } from 'react';

interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  environment: string;
}

export default function Footer() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch('/api/system-info');
        const data = await response.json();
        
        if (data.success) {
          setSystemInfo(data.data);
        } else {
          setError('Failed to fetch system information');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
  }, []);

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">System Info:</span>
            {loading ? (
              <span className="text-gray-500">Loading...</span>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : systemInfo ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>
                  <span className="font-medium">Host:</span> {systemInfo.hostname}
                </span>
                <span>
                  <span className="font-medium">Platform:</span> {systemInfo.platform}
                </span>
                <span>
                  <span className="font-medium">Env:</span> {systemInfo.environment}
                </span>
              </div>
            ) : null}
          </div>
          <div className="mt-2 sm:mt-0 text-gray-500">
            AWS Todo App Demo
          </div>
        </div>
      </div>
    </footer>
  );
}
