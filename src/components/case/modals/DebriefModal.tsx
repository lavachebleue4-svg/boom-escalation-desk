import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { CorrectiveAction, EscalationCase, RoleName } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SelectField, TextAreaField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { ALL_ROLES } from '../../../lib/roles';
import { makeId } from '../../../lib/id';

const UNKNOWN_ROOT_CAUSE = 'Unknown / still under investigation';

function listToArray(v: string) {
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function DebriefModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;

  const [whatHappened, setWhatHappened] = useState('');
  const [whenAware, setWhenAware] = useState('');
  const [clientImpact, setClientImpact] = useState(c.customerImpact);
  const [whereStalled, setWhereStalled] = useState('');
  const [dependencyInvolved, setDependencyInvolved] = useState(c.partner.partnerName ?? c.engineeringIssueRef ?? '');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [rootCauseUnknown, setRootCauseUnknown] = useState(true);
  const [rootCause, setRootCause] = useState('');
  const [facts, setFacts] = useState('');
  const [assumptions, setAssumptions] = useState('');
  const [followUps, setFollowUps] = useState('');
  const [actions, setActions] = useState<CorrectiveAction[]>([
    { id: makeId('ca'), description: '', owner: 'Joy', deadline: now + 24 * 60 * 60_000 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateAction = (id: string, patch: Partial<CorrectiveAction>) =>
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!whatHappened.trim()) e.whatHappened = 'Required.';
    if (!whenAware.trim()) e.whenAware = 'Required.';
    if (!clientImpact.trim()) e.clientImpact = 'Required.';
    if (!whereStalled.trim()) e.whereStalled = 'Required.';
    if (!whatWorked.trim()) e.whatWorked = 'Required.';
    if (!whatFailed.trim()) e.whatFailed = 'Required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const cleanActions = actions.filter((a) => a.description.trim());

    dispatch({
      type: 'CREATE_DEBRIEF',
      caseId: c.id,
      debrief: {
        whatHappened: whatHappened.trim(),
        whenAware: whenAware.trim(),
        clientImpact: clientImpact.trim(),
        whereStalled: whereStalled.trim(),
        dependencyInvolved: dependencyInvolved.trim() || 'None',
        whatWorked: whatWorked.trim(),
        whatFailed: whatFailed.trim(),
        rootCause: rootCauseUnknown ? UNKNOWN_ROOT_CAUSE : rootCause.trim() || UNKNOWN_ROOT_CAUSE,
        facts: listToArray(facts),
        assumptions: listToArray(assumptions),
        followUps: listToArray(followUps),
        correctiveActions: cleanActions,
      },
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Create Debrief" subtitle={`${c.client} — ${c.issueTitle}`} wide onClose={onClose}>
      <TextAreaField label="What happened?" value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} error={errors.whatHappened} />
      <TextAreaField label="When did Boom become aware?" value={whenAware} onChange={(e) => setWhenAware(e.target.value)} error={errors.whenAware} />
      <TextAreaField label="What was the client impact?" value={clientImpact} onChange={(e) => setClientImpact(e.target.value)} error={errors.clientImpact} />
      <TextAreaField label="Where did the process stall?" value={whereStalled} onChange={(e) => setWhereStalled(e.target.value)} error={errors.whereStalled} />
      <TextAreaField label="What dependency was involved?" value={dependencyInvolved} onChange={(e) => setDependencyInvolved(e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextAreaField label="What worked?" value={whatWorked} onChange={(e) => setWhatWorked(e.target.value)} error={errors.whatWorked} />
        <TextAreaField label="What failed?" value={whatFailed} onChange={(e) => setWhatFailed(e.target.value)} error={errors.whatFailed} />
      </div>

      <div className="mb-3 rounded-md border border-border-strong p-3">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-charcoal">
          <input type="checkbox" checked={rootCauseUnknown} onChange={(e) => setRootCauseUnknown(e.target.checked)} />
          Root cause: Unknown / still under investigation
        </label>
        {!rootCauseUnknown && (
          <TextAreaField label="Root cause (state only what is verified)" value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TextAreaField label="Facts (one per line)" value={facts} onChange={(e) => setFacts(e.target.value)} hint="Verified, not inferred." />
        <TextAreaField label="Assumptions (one per line)" value={assumptions} onChange={(e) => setAssumptions(e.target.value)} hint="Believed but unverified." />
        <TextAreaField label="Follow-ups (one per line)" value={followUps} onChange={(e) => setFollowUps(e.target.value)} hint="Still open." />
      </div>

      <div className="mb-2 mt-1">
        <span className="mb-2 block text-sm font-medium text-charcoal">Corrective actions</span>
        <div className="space-y-3">
          {actions.map((a) => (
            <div key={a.id} className="rounded-md border border-border p-3">
              <TextAreaField
                label="Description"
                value={a.description}
                onChange={(e) => updateAction(a.id, { description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Owner" value={a.owner} onChange={(e) => updateAction(a.id, { owner: e.target.value as RoleName })}>
                  {ALL_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </SelectField>
                <DeadlinePicker label="Deadline" now={now} value={a.deadline} onChange={(ms) => updateAction(a.id, { deadline: ms })} />
              </div>
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          className="mt-1 !px-2 text-xs"
          onClick={() => setActions((prev) => [...prev, { id: makeId('ca'), description: '', owner: 'Joy', deadline: now + 24 * 60 * 60_000 }])}
        >
          + Add another corrective action
        </Button>
      </div>

      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Create Debrief
        </Button>
      </ModalActions>
    </Modal>
  );
}
