import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, RoleName } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SelectField, TextAreaField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { ALL_ROLES } from '../../../lib/roles';

export function NextActionModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [nextAction, setNextAction] = useState(c.nextAction ?? '');
  const [owner, setOwner] = useState<RoleName>(c.nextActionOwner ?? c.accountableOwner ?? state.demo.role);
  const [deadline, setDeadline] = useState<number | undefined>(c.nextActionDeadline);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!nextAction.trim()) e.nextAction = 'A next action is required — an active escalation cannot go without one.';
    if (!owner) e.owner = 'A next-action owner is required.';
    if (!deadline) e.deadline = 'A next-action deadline is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    dispatch({
      type: 'SET_NEXT_ACTION',
      caseId: c.id,
      nextAction: nextAction.trim(),
      nextActionOwner: owner,
      nextActionDeadline: deadline!,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal
      title={c.nextAction ? 'Revise Next Action' : 'Establish Next Action'}
      subtitle={`${c.client} — ${c.issueTitle}`}
      onClose={onClose}
    >
      <TextAreaField
        label="Next action"
        value={nextAction}
        onChange={(e) => setNextAction(e.target.value)}
        error={errors.nextAction}
        placeholder="What is the concrete next step?"
      />
      <SelectField label="Next-action owner" value={owner} onChange={(e) => setOwner(e.target.value as RoleName)} error={errors.owner}>
        {ALL_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>
      <DeadlinePicker label="Next-action deadline" now={now} value={deadline} onChange={setDeadline} error={errors.deadline} />

      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Save Next Action
        </Button>
      </ModalActions>
    </Modal>
  );
}
