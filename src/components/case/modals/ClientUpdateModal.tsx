import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, UpdateChannel } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SelectField, TextAreaField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { SEVERITY_MODEL } from '../../../lib/severity';

const CHANNELS: UpdateChannel[] = ['Client Slack Channel', 'Email', 'Meeting / Call'];

export function ClientUpdateModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [summary, setSummary] = useState('');
  const [channel, setChannel] = useState<UpdateChannel>('Client Slack Channel');
  const [nextUpdateDue, setNextUpdateDue] = useState<number | undefined>(
    now + SEVERITY_MODEL[c.severity].updateCadenceMs,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!summary.trim()) e.summary = 'An update summary is required.';
    if (!nextUpdateDue) e.nextUpdateDue = 'The next update due time is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'RECORD_CLIENT_UPDATE',
      caseId: c.id,
      summary: summary.trim(),
      channel,
      nextUpdateDue: nextUpdateDue!,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Record Client Update" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <p className="mb-3 text-xs text-muted">SIMULATED INTEGRATION — nothing is actually sent. This only records that an update happened.</p>
      <TextAreaField label="Update summary" value={summary} onChange={(e) => setSummary(e.target.value)} error={errors.summary} />
      <SelectField label="Channel" value={channel} onChange={(e) => setChannel(e.target.value as UpdateChannel)}>
        {CHANNELS.map((ch) => (
          <option key={ch} value={ch}>
            {ch}
          </option>
        ))}
      </SelectField>
      <DeadlinePicker label="Next update due" now={now} value={nextUpdateDue} onChange={setNextUpdateDue} error={errors.nextUpdateDue} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Record Update
        </Button>
      </ModalActions>
    </Modal>
  );
}
