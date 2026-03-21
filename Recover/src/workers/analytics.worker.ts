/**
 * Analytics Web Worker
 *
 * Handles heavy analytics calculations off the main thread
 */

import { predictRelapseRisk } from '@/lib/relapse-risk-prediction';
import { generateInsights } from '@/lib/analytics-engine';
import type { RiskData } from '@/lib/relapse-risk-prediction';
import type { CheckIn, Meeting, Meditation } from '@/types/app';

export interface WorkerMessage {
  type: 'PREDICT_RISK' | 'GENERATE_INSIGHTS';
  payload: unknown;
}

export interface WorkerResponse {
  type: 'PREDICT_RISK_RESULT' | 'GENERATE_INSIGHTS_RESULT' | 'ERROR';
  payload: unknown;
}

// Listen for messages from the main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'PREDICT_RISK': {
        const data = payload as RiskData;
        const result = predictRelapseRisk(data);
        const response: WorkerResponse = {
          type: 'PREDICT_RISK_RESULT',
          payload: result,
        };
        self.postMessage(response);
        break;
      }

      case 'GENERATE_INSIGHTS': {
        const data = payload as {
          checkIns: CheckIn[];
          meetings: Meeting[];
          meditations: Meditation[];
        };
        const result = generateInsights(data.checkIns, data.meetings, data.meditations);
        const response: WorkerResponse = {
          type: 'GENERATE_INSIGHTS_RESULT',
          payload: result,
        };
        self.postMessage(response);
        break;
      }

      default:
        throw new Error(`Unknown worker message type: ${type}`);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'ERROR',
      payload: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    };
    self.postMessage(response);
  }
};
