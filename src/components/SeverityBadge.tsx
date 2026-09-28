import type { Severity } from '../types';
import { Badge } from './ui/Badge';

const config: Record<Severity, { label: string; tone: 'red' | 'amber' | 'blue' }> = {
  P1: { label: 'P1 Critical', tone: 'red' },
  P2: { label: 'P2 High', tone: 'amber' },
  P3: { label: 'P3 Standard', tone: 'blue' },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const c = config[severity];
  return <Badge tone={c.tone}>{c.label}</Badge>;
}
