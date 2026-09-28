import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, RoleName, VerificationRecord } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { SelectField, TextAreaField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { ALL_ROLES } from '../../../lib/roles';

export function ReturnOutcomeModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [note, setNote] = useState('');

  const submit = () => {
    dispatch({ type: 'RETURN_TECHNICAL_OUTCOME', caseId: c.id, note: note.trim() || undefined, actor: state.demo.role });
    onClose();
  };

  return (
    <Modal title="Return Technical Outcome" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <p className="mb-3 text-sm text-charcoal-soft">
        Marks the technical work complete and moves the case to <strong>Ready to Verify</strong>. Support must still
        confirm the client-facing outcome before this can close.
      </p>
      <TextAreaField label="What was done (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Mark Ready to Verify
        </Button>
      </ModalActions>
    </Modal>
  );
}

const RESULTS: VerificationRecord['result'][] = ['Verified Resolved', 'Still Impacted', 'Partially Resolved'];

export function VerifyModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [result, setResult] = useState<VerificationRecord['result']>('Verified Resolved');
  const [notes, setNotes] = useState('');
  const [remainingImpact, setRemainingImpact] = useState('');
  const [newNextAction, setNewNextAction] = useState('');
  const [followOwner, setFollowOwner] = useState<RoleName>(c.accountableOwner ?? state.demo.role);
  const [followDeadline, setFollowDeadline] = useState<number | undefined>(now + 60 * 60_000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!notes.trim()) e.notes = 'Verification notes are required.';
    if (result === 'Still Impacted') {
      if (!newNextAction.trim()) e.newNextAction = 'A new next action is required when the client is still impacted.';
      if (!followDeadline) e.followDeadline = 'A new deadline is required.';
    }
    if (result === 'Partially Resolved') {
      if (!remainingImpact.trim()) e.remainingImpact = 'Describe the remaining impact.';
      if (!followOwner) e.followOwner = 'An owner for the remaining impact is required.';
      if (!followDeadline) e.followDeadline = 'A deadline is required.';
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'VERIFY_CASE',
      caseId: c.id,
      result,
      notes: notes.trim(),
      remainingImpact: remainingImpact.trim() || undefined,
      newNextAction: newNextAction.trim() || undefined,
      followOwner,
      followDeadline,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Verify Client Outcome" subtitle={`${c.client} — ${c.issueTitle}`} wide onClose={onClose}>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {RESULTS.map((r) => (
          <button
            key={r}
            onClick={() => setResult(r)}
            className={`rounded-md border px-2 py-2 text-sm font-medium ${
              result === r ? 'border-charcoal bg-charcoal text-white' : 'border-border-strong text-charcoal-soft hover:border-charcoal'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <TextAreaField
        label="Verification notes — is the original client problem actually fixed? Is the service functioning? Any remaining client impact?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        error={errors.notes}
      />

      {result === 'Still Impacted' && (
        <>
          <TextAreaField label="New next action" value={newNextAction} onChange={(e) => setNewNextAction(e.target.value)} error={errors.newNextAction} />
          <SelectField label="Owner" value={followOwner} onChange={(e) => setFollowOwner(e.target.value as RoleName)}>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
          <DeadlinePicker label="New deadline" now={now} value={followDeadline} onChange={setFollowDeadline} error={errors.followDeadline} />
        </>
      )}

      {result === 'Partially Resolved' && (
        <>
          <TextAreaField label="Remaining impact" value={remainingImpact} onChange={(e) => setRemainingImpact(e.target.value)} error={errors.remainingImpact} />
          <SelectField label="Owner" value={followOwner} onChange={(e) => setFollowOwner(e.target.value as RoleName)} error={errors.followOwner}>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </SelectField>
          <DeadlinePicker label="Deadline" now={now} value={followDeadline} onChange={setFollowDeadline} error={errors.followDeadline} />
        </>
      )}

      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Record Verification
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function CloseCaseModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [verificationEvidence, setVerificationEvidence] = useState('');
  const [finalClientComm, setFinalClientComm] = useState('');
  const [followUpTasks, setFollowUpTasks] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);

  const canClose = c.status === 'Resolved';

  const validate = () => {
    const e: Record<string, string> = {};
    if (!resolutionSummary.trim()) e.resolutionSummary = 'A resolution summary is required.';
    if (!verificationEvidence.trim()) e.verificationEvidence = 'Verification evidence is required.';
    if (!finalClientComm.trim()) e.finalClientComm = 'The final client communication must be recorded.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  if (confirming) {
    return (
      <ConfirmDialog
        title="Close this case?"
        body={`This closes the client case for ${c.client}. Closure cannot happen without a recorded verification, which this case has.`}
        confirmLabel="Close Case"
        onConfirm={() => {
          dispatch({
            type: 'CLOSE_CASE',
            caseId: c.id,
            resolutionSummary: resolutionSummary.trim(),
            verificationEvidence: verificationEvidence.trim(),
            finalClientComm: finalClientComm.trim(),
            followUpTasks: followUpTasks
              .split('\n')
              .map((t) => t.trim())
              .filter(Boolean),
            actor: state.demo.role,
          });
          onClose();
        }}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <Modal title="Close Case" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      {!canClose && (
        <p className="mb-3 rounded-md border border-red-border bg-red-bg px-3 py-2 text-sm text-red">
          This case cannot close yet — it must reach <strong>Resolved</strong> via a "Verified Resolved" verification
          first.
        </p>
      )}
      <TextAreaField label="Resolution summary" value={resolutionSummary} onChange={(e) => setResolutionSummary(e.target.value)} error={errors.resolutionSummary} disabled={!canClose} />
      <TextAreaField label="Verification evidence" value={verificationEvidence} onChange={(e) => setVerificationEvidence(e.target.value)} error={errors.verificationEvidence} disabled={!canClose} />
      <TextAreaField label="Final client communication" value={finalClientComm} onChange={(e) => setFinalClientComm(e.target.value)} error={errors.finalClientComm} disabled={!canClose} />
      <TextAreaField label="Remaining follow-up tasks (one per line, optional)" value={followUpTasks} onChange={(e) => setFollowUpTasks(e.target.value)} disabled={!canClose} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          disabled={!canClose}
          onClick={() => {
            if (validate()) setConfirming(true);
          }}
        >
          Close Case
        </Button>
      </ModalActions>
    </Modal>
  );
}
