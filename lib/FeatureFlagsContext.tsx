'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { FeatureFlags } from './types';
import { fetchFeatureFlags } from './featureFlags';

interface FeatureFlagsContextType {
  featureFlags: FeatureFlags;
  loading: boolean;
  error: string | null;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        setLoading(true);
        setError(null);
        const flags = await fetchFeatureFlags();
        setFeatureFlags(flags);
      } catch (err) {
        console.error('Error loading feature flags:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feature flags');
        // Set empty flags on error so app continues to work
        setFeatureFlags({});
      } finally {
        setLoading(false);
      }
    };

    loadFeatureFlags();
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ featureFlags, loading, error }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
}
