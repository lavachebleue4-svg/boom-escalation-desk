import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase, RoleName } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SelectField, TextAreaField, TextField } from '../../ui/Field';
import { DeadlinePicker } from '../../ui/DeadlinePicker';
import { SUPPORT_ROLES } from '../../../lib/roles';
import { makeId } from '../../../lib/id';

export function AddPartnerModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [partnerName, setPartnerName] = useState('');
  const [caseRef, setCaseRef] = useState(() => `PTR-${makeId('').slice(-4).toUpperCase()}`);
  const [impactSent, setImpactSent] = useState('');
  const [internalOwner, setInternalOwner] = useState<RoleName>(c.accountableOwner ?? 'Joy');
  const [nextChase, setNextChase] = useState<number | undefined>(now + 60 * 60_000);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!partnerName.trim()) e.partnerName = 'Partner name is required.';
    if (!caseRef.trim()) e.caseRef = 'A partner case reference is required.';
    if (!impactSent.trim()) e.impactSent = 'Describe the business impact sent to the partner.';
    if (!internalOwner) e.internalOwner = 'An internal owner is required — "Waiting" never means unowned.';
    if (!nextChase) e.nextChase = 'A next chase time is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'ADD_PARTNER',
      caseId: c.id,
      partnerName: partnerName.trim(),
      caseRef: caseRef.trim(),
      impactSent: impactSent.trim(),
      internalOwner,
      nextChase: nextChase!,
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Add External Partner Dependency" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <p className="mb-3 text-sm text-charcoal-soft">
        SIMULATED INTEGRATION — Partner Queue. "Waiting on Partner" never pauses accountable ownership.
      </p>
      <TextField label="Partner" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} error={errors.partnerName} />
      <TextField label="Partner case reference" value={caseRef} onChange={(e) => setCaseRef(e.target.value)} error={errors.caseRef} />
      <TextAreaField label="Business impact sent to partner" value={impactSent} onChange={(e) => setImpactSent(e.target.value)} error={errors.impactSent} />
      <SelectField label="Internal partner owner" value={internalOwner} onChange={(e) => setInternalOwner(e.target.value as RoleName)} error={errors.internalOwner}>
        {SUPPORT_ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </SelectField>
      <DeadlinePicker label="Next partner chase" now={now} value={nextChase} onChange={setNextChase} error={errors.nextChase} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Add Partner
        </Button>
      </ModalActions>
    </Modal>
  );
}

export function RecordPartnerChaseModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const now = state.demo.demoTimeMs;
  const [nextChase, setNextChase] = useState<number | undefined>(now + 60 * 60_000);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!nextChase) {
      setError('A next chase time is required.');
      return;
    }
    dispatch({ type: 'RECORD_PARTNER_CHASE', caseId: c.id, nextChase, note: note.trim() || undefined, actor: state.demo.role });
    onClose();
  };

  return (
    <Modal title="Record New Partner Checkpoint" subtitle={`${c.partner.partnerName ?? 'Partner'} — ${c.partner.caseRef ?? ''}`} onClose={onClose}>
      <TextAreaField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did the partner say?" />
      <DeadlinePicker label="Next partner chase" now={now} value={nextChase} onChange={setNextChase} error={error} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Record Checkpoint
        </Button>
      </ModalActions>
    </Modal>
  );
}
