import type { CaseStatus } from '../types';
import { Badge } from './ui/Badge';

const toneFor = (s: CaseStatus) => {
  switch (s) {
    case 'New':
      return 'purple' as const;
    case 'Acknowledged':
    case 'Investigating':
      return 'blue' as const;
    case 'Waiting on Engineering':
    case 'Waiting on Partner':
      return 'amber' as const;
    case 'Ready to Verify':
      return 'blue' as const;
    case 'Resolved':
    case 'Closed':
      return 'green' as const;
  }
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <Badge tone={toneFor(status)}>{status}</Badge>;
}
