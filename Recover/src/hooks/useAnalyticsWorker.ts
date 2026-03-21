/**
 * Analytics Worker Hook
 *
 * Provides a simple interface to use the analytics Web Worker
 */

import { useRef, useCallback, useEffect } from 'react';
import type { WorkerMessage, WorkerResponse } from '@/workers/analytics.worker';
import type { RiskPrediction, RiskData } from '@/lib/relapse-risk-prediction';
import type { CheckIn, Meeting, Meditation } from '@/types/app';

interface AnalyticsWorkerHook {
  predictRisk: (data: RiskData) => Promise<RiskPrediction>;
  generateInsights: (data: {
    checkIns: CheckIn[];
    meetings: Meeting[];
    meditations: Meditation[];
  }) => Promise<unknown>;
  isWorkerSupported: boolean;
}

export function useAnalyticsWorker(): AnalyticsWorkerHook {
  const workerRef = useRef<Worker | null>(null);
  const pendingCallbacks = useRef<Map<string, (result: unknown) => void>>(new Map());

  // Check if Web Workers are supported
  const isWorkerSupported = typeof Worker !== 'undefined';

  // Initialize worker on mount
  useEffect(() => {
    if (!isWorkerSupported) {
      console.warn('[Analytics Worker] Web Workers not supported in this environment');
      return;
    }

    try {
      // Create worker
      workerRef.current = new Worker(
        new URL('../workers/analytics.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Handle messages from worker
      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { type, payload } = event.data;

        if (type === 'ERROR') {
          console.error('[Analytics Worker] Error:', payload);
          return;
        }

        // Find and call the pending callback
        const callback = pendingCallbacks.current.get(type);
        if (callback) {
          callback(payload);
          pendingCallbacks.current.delete(type);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('[Analytics Worker] Worker error:', error);
      };

      console.log('[Analytics Worker] Initialized successfully');
    } catch (error) {
      console.error('[Analytics Worker] Failed to initialize:', error);
    }

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingCallbacks.current.clear();
    };
  }, [isWorkerSupported]);

  // Predict relapse risk
  const predictRisk = useCallback(
    async (data: RiskData): Promise<RiskPrediction> => {
      if (!isWorkerSupported || !workerRef.current) {
        // Fallback to main thread if worker not available
        const { predictRelapseRisk } = await import('@/lib/relapse-risk-prediction');
        return predictRelapseRisk(data);
      }

      return new Promise((resolve) => {
        pendingCallbacks.current.set('PREDICT_RISK_RESULT', resolve);
        const message: WorkerMessage = {
          type: 'PREDICT_RISK',
          payload: data,
        };
        workerRef.current!.postMessage(message);
      });
    },
    [isWorkerSupported]
  );

  // Generate insights
  const generateInsights = useCallback(
    async (data: {
      checkIns: CheckIn[];
      meetings: Meeting[];
      meditations: Meditation[];
    }): Promise<unknown> => {
      if (!isWorkerSupported || !workerRef.current) {
        // Fallback to main thread if worker not available
        const { generateInsights: generate } = await import('@/lib/analytics-engine');
        return generate(data.checkIns, data.meetings, data.meditations);
      }

      return new Promise((resolve) => {
        pendingCallbacks.current.set('GENERATE_INSIGHTS_RESULT', resolve);
        const message: WorkerMessage = {
          type: 'GENERATE_INSIGHTS',
          payload: data,
        };
        workerRef.current!.postMessage(message);
      });
    },
    [isWorkerSupported]
  );

  return {
    predictRisk,
    generateInsights,
    isWorkerSupported,
  };
}
