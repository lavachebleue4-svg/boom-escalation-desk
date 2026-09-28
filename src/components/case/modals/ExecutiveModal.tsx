import { useState } from 'react';
import { useStore } from '../../../state/store';
import type { EscalationCase } from '../../../types';
import { Modal, ModalActions } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { TextAreaField } from '../../ui/Field';

export function ExecutiveDecisionModal({ c, onClose }: { c: EscalationCase; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [decisionRequired, setDecisionRequired] = useState('');
  const [whyInsufficient, setWhyInsufficient] = useState('');
  const [businessImpact, setBusinessImpact] = useState(c.customerImpact);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const e: Record<string, string> = {};
    if (!decisionRequired.trim()) e.decisionRequired = 'State the decision required.';
    if (!whyInsufficient.trim()) e.whyInsufficient = 'Explain why functional escalation was insufficient.';
    if (!businessImpact.trim()) e.businessImpact = 'Business impact is required.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    dispatch({
      type: 'REQUEST_EXECUTIVE_DECISION',
      caseId: c.id,
      decisionRequired: decisionRequired.trim(),
      whyInsufficient: whyInsufficient.trim(),
      businessImpact: businessImpact.trim(),
      actor: state.demo.role,
    });
    onClose();
  };

  return (
    <Modal title="Request Executive Decision" subtitle={`${c.client} — ${c.issueTitle}`} onClose={onClose}>
      <p className="mb-3 rounded-md border border-purple-border bg-purple-bg px-3 py-2 text-sm text-charcoal">
        This is a deliberate, human-triggered escalation to the COO. It is never automatic — automation only ever
        flags overdue items to the responsible owner and functional lead.
      </p>
      <TextAreaField label="Decision required" value={decisionRequired} onChange={(e) => setDecisionRequired(e.target.value)} error={errors.decisionRequired} />
      <TextAreaField label="Why functional escalation was insufficient" value={whyInsufficient} onChange={(e) => setWhyInsufficient(e.target.value)} error={errors.whyInsufficient} />
      <TextAreaField label="Business impact" value={businessImpact} onChange={(e) => setBusinessImpact(e.target.value)} error={errors.businessImpact} />
      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Request Executive Decision
        </Button>
      </ModalActions>
    </Modal>
  );
}
