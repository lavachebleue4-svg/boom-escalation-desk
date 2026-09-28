import type { Severity } from '../types';

const MIN = 60_000;
const HOUR = 60 * MIN;

export interface SeverityModel {
  label: string;
  name: string;
  examples: string[];
  acknowledgeTargetMs: number;
  acknowledgeLabel: string;
  ownerPlanTargetMs: number;
  ownerPlanLabel: string;
  updateCadenceMs: number;
  updateCadenceLabel: string;
}

export const SEVERITY_MODEL: Record<Severity, SeverityModel> = {
  P1: {
    label: 'P1 Critical',
    name: 'Critical',
    examples: [
      'Listings unavailable',
      'Booking capability unavailable',
      'Material ongoing business impact',
      'No workable alternative',
    ],
    acknowledgeTargetMs: 15 * MIN,
    acknowledgeLabel: '15 minutes',
    ownerPlanTargetMs: 30 * MIN,
    ownerPlanLabel: '30 minutes',
    updateCadenceMs: 60 * MIN,
    updateCadenceLabel: 'Every 60 minutes',
  },
  P2: {
    label: 'P2 High',
    name: 'High',
    examples: [
      'Important workflow impaired',
      'Workaround exists',
      'Significant issue is not progressing',
    ],
    acknowledgeTargetMs: 1 * HOUR,
    acknowledgeLabel: 'Within 1 covered working hour',
    ownerPlanTargetMs: 4 * HOUR,
    ownerPlanLabel: 'Within 4 covered working hours',
    updateCadenceMs: 4 * HOUR,
    updateCadenceLabel: 'Every 4 covered working hours',
  },
  P3: {
    label: 'P3 Standard',
    name: 'Standard Escalation',
    examples: [
      'Lower-impact issue needing specialist help',
      'No immediate major operational loss',
    ],
    acknowledgeTargetMs: 4 * HOUR,
    acknowledgeLabel: 'Within 4 covered working hours',
    ownerPlanTargetMs: 24 * HOUR,
    ownerPlanLabel: 'Within 1 business day',
    updateCadenceMs: 24 * HOUR,
    updateCadenceLabel: 'Each business day',
  },
};

export const SEVERITY_ORDER: Severity[] = ['P1', 'P2', 'P3'];
