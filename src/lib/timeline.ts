import type { TimelineEvent } from '../types';
import { makeId } from './id';

export function mkEvent(timestamp: number, actor: string, action: string, reason?: string): TimelineEvent {
  return { id: makeId('evt'), timestamp, actor, action, reason };
}
