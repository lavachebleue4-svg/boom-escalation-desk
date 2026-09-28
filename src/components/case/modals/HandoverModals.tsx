import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, RoleName } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { SelectField, TextAreaField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { ALL_ROLES } from '../../../lib/roles';

export function RequestHandoverModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [toOwner, setToOwner] = useState<RoleName>(ALL_ROLES.find((r) => r !== c.accountableOwner) ?? 'Maya');
  const [currentImpact, setCurrentImpact] = useState(c.customerImpact);
  const [currentTechnicalStatus, setCurrentTechnicalStatus] = useState('');
  const [currentDependency, setCurrentDependency] = useState(c.waitingOn ? `Waiting on ${c.waitingOn}` : 'None');
  const [nextAction, setNextAction] = useState(c.nextAction ?? '');
  const [nextActionDeadline, setNextActionDeadline] = useState<number | undefined>(c.nextActionDeadline);
  const [nextClientUpdate, setNextClientUpdate] = useState<number | undefined>(c.nextClientUpdate);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!toOwner) e.toOwner = 'An incoming owner is required.';
    if (!currentImpact.trim()) e.currentImpact = 'Current impact is required.';
    if (!currentTechnicalStatus.trim()) e.currentTechnicalStatus = 'Current technical status is required.';
    if (!currentDependency.trim()) e.currentDependency = 'Current dependency is required (write "None" if there is none).';
    if (!nextAction.trim()) e.nextAction = 'Next action is required.';
    if (!nextActionDeadline) e.nextActionDeadline = 'Next-action deadline is required.';
    if (!nextClientUpdate) e.nextClientUpdate = 'Next client update is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'REQUEST_HANDOVER',
      caseId: c.id,
      toOwner,
      currentImpact: currentImpact.trim(),
      currentTechnicalStatus: currentTechnicalStatus.trim(),
      currentDependency: currentDependency.trim(),
      nextAction: nextAction.trim(),
      nextActionDeadline: nextActionDeadline!,
      nextClientUpdate: nextClientUpdate!,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Transfer Case Ownership" subtitle={`${c.client} — ${c.issueTitle}`} wide onClose={onClose}>
      <p className="mb-3 text-sm text-charcoal-soft">
        Until the incoming owner explicitly accepts, <strong>{c.accountableOwner ?? 'the current owner'}</strong>{' '}
        remains accountable. This is how ownership survives a time-zone handover.
      </p>
      <SelectField label="Incoming owner" value={toOwner} onChange={(e) => setToOwner(e.target.value as RoleName)} error={errors.toOwner}>
        {ALL_ROLES.filter((r) => r !== c.accountableOwner).map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>
      <TextAreaField label="Current impact" value={currentImpact} onChange={(e) => setCurrentImpact(e.target.value)} error={errors.currentImpact} />
      <TextAreaField label="Current technical status" value={currentTechnicalStatus} onChange={(e) => setCurrentTechnicalStatus(e.target.value)} error={errors.currentTechnicalStatus} />
      <TextAreaField label="Current dependency" value={currentDependency} onChange={(e) => setCurrentDependency(e.target.value)} error={errors.currentDependency} />
      <TextAreaField label="Next action" value={nextAction} onChange={(e) => setNextAction(e.target.value)} error={errors.nextAction} />
      <DeadlinePicker label="Next-action deadline" now={now} value={nextActionDeadline} onChange={setNextActionDeadline} error={errors.nextActionDeadline} />
      <DeadlinePicker label="Next client update" now={now} value={nextClientUpdate} onChange={setNextClientUpdate} error={errors.nextClientUpdate} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Request Handover
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function AcceptHandoverModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { dispatch, state } = useStore();
  if (!c.handover) return null;
  return (
    <ConfirmDialog
      title="Accept handover?"
      body={`You will become the accountable owner for ${c.client} — ${c.issueTitle}, taking on the next action, deadline, and client-update commitment set by ${c.handover.fromOwner}.`}
      confirmLabel="Accept Handover"
      onConfirm={() => {
        dispatch({ type: 'ACCEPT_HANDOVER', caseId: c.id, actor: state.demo.role });
        onClose();
      }}
      onCancel={onClose}
    />
  );
}
