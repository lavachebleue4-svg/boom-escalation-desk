import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, Severity } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { SelectField, TextAreaField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { SEVERITY_ORDER } from '../../../lib/severity';

export function ChangeSeverityModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [newSeverity, setNewSeverity] = useState<Severity>(c.severity);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const isLowering = SEVERITY_ORDER.indexOf(newSeverity) > SEVERITY_ORDER.indexOf(c.severity);

  const apply = () => {
    dispatch({ type: 'CHANGE_SEVERITY', caseId: c.id, newSeverity, reason: reason.trim(), actor: state.demo.role });
    onClose();
  };

  const submit = () => {
    if (!reason.trim()) {
      setError('A reason is required to change severity.');
      return;
    }
    if (newSeverity === c.severity) {
      onClose();
      return;
    }
    if (isLowering) {
      setConfirming(true);
    } else {
      apply();
    }
  };

  if (confirming) {
    return (
      <ConfirmDialog
        title="Lower severity?"
        body={`Changing ${c.client} from ${c.severity} to ${newSeverity} relaxes the proposed operating targets for acknowledgement, ownership, and client updates. Reason on record: "${reason.trim()}"`}
        confirmLabel="Confirm Lower Severity"
        tone="danger"
        onConfirm={apply}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <Modal title="Change Severity" subtitle={`${c.client} — currently ${c.severity}`} onClose={onClose}>
      <SelectField label="New severity" value={newSeverity} onChange={(e) => setNewSeverity(e.target.value as Severity)}>
        <option value="P1">P1 — Critical</option>
        <option value="P2">P2 — High</option>
        <option value="P3">P3 — Standard Escalation</option>
      </SelectField>
      <TextAreaField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} error={error} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Change Severity
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function ChangeDeadlineModal({
  c,
  field,
  onClose,
}: {
  c: EscalationCase;
  field: 'nextActionDeadline' | 'nextClientUpdate';
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [newValue, setNewValue] = useState<number | undefined>(c[field]);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!newValue) e.newValue = 'A new time is required.';
    if (!reason.trim()) e.reason = 'A reason is required — the previous deadline stays in the case history.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({ type: 'CHANGE_DEADLINE', caseId: c.id, field, newValue: newValue!, reason: reason.trim(), actor: state.demo.role });
    onClose();
  };

  const label = field === 'nextActionDeadline' ? 'Next-action deadline' : 'Next client update';

  return (
    <Modal title={`Change ${label}`} subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <DeadlinePicker label={`New ${label.toLowerCase()}`} now={now} value={newValue} onChange={setNewValue} error={errors.newValue} />
      <TextAreaField label="Reason for change" value={reason} onChange={(e) => setReason(e.target.value)} error={errors.reason} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Change Deadline
        </Button>
      </ModalActions>
    </Modal>
  );
}
