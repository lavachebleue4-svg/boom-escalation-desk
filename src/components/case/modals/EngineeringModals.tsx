import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, RoleName } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SelectField, TextAreaField, TextField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { ENGINEERING_ROLES, ALL_ROLES } from '../../../lib/roles';
import { makeId } from '../../../lib/id';

export function RequestEngineeringModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [issueRef, setIssueRef] = useState(() => `ENG-${makeId('').slice(-4).toUpperCase()}`);
  const [error, setError] = useState('');

  const submit = () => {
    if (!issueRef.trim()) {
      setError('An engineering issue reference is required.');
      return;
    }
    dispatch({ type: 'REQUEST_ENGINEERING', caseId: c.id, issueRef: issueRef.trim(), actor: state.demo.role });
    onClose();
  };

  return (
    <Modal title="Escalate to Engineering" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <p className="mb-3 text-sm text-charcoal-soft">
        This links an engineering issue and moves the case to <strong>Waiting on Engineering</strong>. The case
        stays owned by Support until engineering work is returned and verified.
      </p>
      <TextField label="Engineering issue reference" value={issueRef} onChange={(e) => setIssueRef(e.target.value)} error={error} hint="SIMULATED INTEGRATION — Engineering Tracker" />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Send to Engineering
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function EngineeringAcceptModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [technicalOwner, setTechnicalOwner] = useState<RoleName>(c.engineering.technicalOwner ?? 'Leo');

  const submit = () => {
    dispatch({ type: 'ENGINEERING_ACCEPT', caseId: c.id, technicalOwner, actor: state.demo.role });
    onClose();
  };

  return (
    <Modal title="Engineering Accepts" subtitle={`${c.engineeringIssueRef ?? ''} — ${c.issueTitle}`} onClose={onClose}>
      <p className="mb-3 text-sm text-charcoal-soft">
        Engineering explicitly accepts ownership of the technical investigation. This issue will not sit unowned in
        a queue.
      </p>
      <SelectField label="Technical resolver" value={technicalOwner} onChange={(e) => setTechnicalOwner(e.target.value as RoleName)}>
        {ENGINEERING_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Accept
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function EngineeringRequestInfoModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [infoNeeded, setInfoNeeded] = useState('');
  const [infoRequestedFrom, setInfoRequestedFrom] = useState('Joy');
  const [infoDeadline, setInfoDeadline] = useState<number | undefined>(now + 60 * 60_000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!infoNeeded.trim()) e.infoNeeded = 'Describe what information is needed.';
    if (!infoRequestedFrom.trim()) e.infoRequestedFrom = 'Who must provide it is required.';
    if (!infoDeadline) e.infoDeadline = 'A deadline is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'ENGINEERING_REQUEST_INFO',
      caseId: c.id,
      infoNeeded: infoNeeded.trim(),
      infoRequestedFrom: infoRequestedFrom.trim(),
      infoDeadline: infoDeadline!,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Engineering: Request Information" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <TextAreaField label="What information is needed" value={infoNeeded} onChange={(e) => setInfoNeeded(e.target.value)} error={errors.infoNeeded} />
      <TextField label="Who must provide it" value={infoRequestedFrom} onChange={(e) => setInfoRequestedFrom(e.target.value)} error={errors.infoRequestedFrom} />
      <DeadlinePicker label="Deadline" now={now} value={infoDeadline} onChange={setInfoDeadline} error={errors.infoDeadline} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Request Information
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function EngineeringRedirectModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [redirectDestination, setRedirectDestination] = useState('');
  const [redirectReason, setRedirectReason] = useState('');
  const [newOwner, setNewOwner] = useState<RoleName>('Nina');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!redirectDestination.trim()) e.redirectDestination = 'A destination is required.';
    if (!redirectReason.trim()) e.redirectReason = 'A reason is required.';
    if (!newOwner) e.newOwner = 'A new owner is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'ENGINEERING_REDIRECT',
      caseId: c.id,
      redirectDestination: redirectDestination.trim(),
      redirectReason: redirectReason.trim(),
      newOwner,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Engineering: Redirect" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <TextField label="Destination (team / queue)" value={redirectDestination} onChange={(e) => setRedirectDestination(e.target.value)} error={errors.redirectDestination} />
      <TextAreaField label="Reason" value={redirectReason} onChange={(e) => setRedirectReason(e.target.value)} error={errors.redirectReason} />
      <SelectField label="New technical owner" value={newOwner} onChange={(e) => setNewOwner(e.target.value as RoleName)} error={errors.newOwner}>
        {ALL_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Redirect
        </Button>
      </ModalActions>
    </Modal>
  );
}
