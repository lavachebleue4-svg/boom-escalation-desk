import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, RoleName, Severity } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SelectField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { SUPPORT_ROLES } from '../../../lib/roles';
import { SEVERITY_MODEL } from '../../../lib/severity';

export function AcknowledgeModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [owner, setOwner] = useState<RoleName>(
    SUPPORT_ROLES.includes(state.demo.role) ? state.demo.role : 'Joy',
  );
  const [severity, setSeverity] = useState<Severity>(c.severity);
  const [nextClientUpdate, setNextClientUpdate] = useState<number | undefined>(
    now + SEVERITY_MODEL[c.severity].updateCadenceMs,
  );
  const [error, setError] = useState('');

  const submit = () => {
    if (!owner || !severity || !nextClientUpdate) {
      setError('Owner, severity, and a next client update are all required to acknowledge a case.');
      return;
    }
    dispatch({
      type: 'ACKNOWLEDGE_CASE',
      caseId: c.id,
      owner,
      severity,
      nextClientUpdate,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Acknowledge & Classify" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <SelectField label="Accountable Support Owner" value={owner} onChange={(e) => setOwner(e.target.value as RoleName)}>
        {SUPPORT_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Provisional severity"
        value={severity}
        onChange={(e) => setSeverity(e.target.value as Severity)}
        hint={SEVERITY_MODEL[severity].label + ' — ' + SEVERITY_MODEL[severity].examples[0]}
      >
        <option value="P1">P1 — Critical</option>
        <option value="P2">P2 — High</option>
        <option value="P3">P3 — Standard Escalation</option>
      </SelectField>

      <DeadlinePicker label="Next client update due" now={now} value={nextClientUpdate} onChange={setNextClientUpdate} />

      <p className="text-xs text-muted">
        Proposed cadence for {severity}: {SEVERITY_MODEL[severity].updateCadenceLabel} (proposed operating target).
      </p>

      {error && <p className="mt-2 text-xs font-medium text-red">{error}</p>}

      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Acknowledge Case
        </Button>
      </ModalActions>
    </Modal>
  );
}
