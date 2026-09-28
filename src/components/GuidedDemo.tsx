import { useStore } from '../state/store';
import { Button } from './ui/Button';
import { HOUR, MIN } from '../lib/time';

const MAIN_CASE = 'case-main';

interface StepDef {
  label: string;
  buttonLabel: string;
  run: (dispatch: ReturnType<typeof useStore>['dispatch'], now: number) => void;
}

const STEPS: StepDef[] = [
  {
    label: 'Client reports listings offline. AI Support responded first; the client says it is still unresolved.',
    buttonLabel: 'Acknowledge & Assign Joy',
    run: (dispatch, now) => {
      dispatch({
        type: 'ACKNOWLEDGE_CASE',
        caseId: MAIN_CASE,
        owner: 'Joy',
        severity: 'P1',
        nextClientUpdate: now + HOUR,
        actor: 'Joy',
      });
    },
  },
  {
    label: 'Classified P1, next client update set. Now establish the next action and bring in Engineering.',
    buttonLabel: 'Escalate to Engineering',
    run: (dispatch, now) => {
      dispatch({
        type: 'SET_NEXT_ACTION',
        caseId: MAIN_CASE,
        nextAction: 'Investigate why listings are offline across all channels.',
        nextActionOwner: 'Joy',
        nextActionDeadline: now + 30 * MIN,
        actor: 'Joy',
      });
      dispatch({ type: 'REQUEST_ENGINEERING', caseId: MAIN_CASE, issueRef: 'ENG-5190', actor: 'Joy' });
    },
  },
  {
    label: 'Engineering accepts but identifies an external dependency — the channel partner feed.',
    buttonLabel: 'Send to Partner',
    run: (dispatch, now) => {
      dispatch({ type: 'ENGINEERING_ACCEPT', caseId: MAIN_CASE, technicalOwner: 'Leo', actor: 'Leo' });
      dispatch({
        type: 'ADD_PARTNER',
        caseId: MAIN_CASE,
        partnerName: 'ListSync Channel Partner',
        caseRef: 'PTR-7734',
        impactSent: 'Listings offline across all channels; material ongoing business impact.',
        internalOwner: 'Joy',
        nextChase: now + HOUR,
        actor: 'Joy',
      });
    },
  },
  {
    label: 'Partner checkpoint approaches — advance the demo clock to reach it.',
    buttonLabel: 'Advance 1 Hour',
    run: (dispatch) => {
      dispatch({ type: 'ADVANCE_TIME', deltaMs: HOUR });
    },
  },
  {
    label: 'The checkpoint has passed — the automated monitor created an overdue alert. Chase the partner again.',
    buttonLabel: 'Record New Partner Checkpoint',
    run: (dispatch, now) => {
      dispatch({
        type: 'RECORD_PARTNER_CHASE',
        caseId: MAIN_CASE,
        nextChase: now + HOUR,
        note: 'Partner confirmed an ETA; feed backlog is clearing.',
        actor: 'Joy',
      });
    },
  },
  {
    label: 'Engineering returns a technical fix — but the client case is not closed yet.',
    buttonLabel: 'Mark Ready to Verify',
    run: (dispatch) => {
      dispatch({
        type: 'RETURN_TECHNICAL_OUTCOME',
        caseId: MAIN_CASE,
        note: 'Sync worker patched and confirmed; listings republishing across channels.',
        actor: 'Leo',
      });
    },
  },
  {
    label: 'Support checks the actual client-facing outcome before accepting the fix.',
    buttonLabel: 'Verify Resolved',
    run: (dispatch) => {
      dispatch({
        type: 'VERIFY_CASE',
        caseId: MAIN_CASE,
        result: 'Verified Resolved',
        notes: 'Listings confirmed live across all channels; client confirms bookings are coming through again.',
        actor: 'Joy',
      });
    },
  },
  {
    label: 'Record the final client update, then close the case.',
    buttonLabel: 'Close Case',
    run: (dispatch, now) => {
      dispatch({
        type: 'RECORD_CLIENT_UPDATE',
        caseId: MAIN_CASE,
        summary: 'Listings are back online across all channels and verified working. Thank you for your patience.',
        channel: 'Client Slack Channel',
        nextUpdateDue: now + 24 * HOUR,
        actor: 'Joy',
      });
      dispatch({
        type: 'CLOSE_CASE',
        caseId: MAIN_CASE,
        resolutionSummary: 'Listings restored after the partner feed backlog cleared and the sync worker patch was confirmed.',
        verificationEvidence: 'Support verified listings live across all channels; client confirmed bookings received.',
        finalClientComm: 'Told the client listings are restored and thanked them for their patience.',
        followUpTasks: [],
        actor: 'Joy',
      });
    },
  },
  {
    label: 'Optional: for a P1 like this, capture what happened while it is fresh. Use "Create Debrief" in the case Controls panel.',
    buttonLabel: 'Finish Guided Demo',
    run: () => {},
  },
];

export function GuidedDemo({ onOpenCase }: { onOpenCase: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const stepIndex = Math.min(Math.max(state.demo.guidedDemoStep - 1, 0), STEPS.length - 1);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const advance = () => {
    step.run(dispatch, state.demo.demoTimeMs);
    onOpenCase(MAIN_CASE);
    if (isLast) {
      dispatch({ type: 'GUIDED_DEMO_EXIT' });
    } else {
      dispatch({ type: 'GUIDED_DEMO_STEP', step: stepIndex + 2 });
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal bg-charcoal text-white shadow-2xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-5 rounded-full ${i <= stepIndex ? 'bg-white' : 'bg-white/25'}`}
            />
          ))}
        </div>
        <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Guided Demo — Step {stepIndex + 1} of {STEPS.length}
        </div>
        <p className="flex-1 text-sm text-white/90">{step.label}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="!border !border-white/30 !text-white hover:!bg-white/10"
            onClick={() => dispatch({ type: 'GUIDED_DEMO_EXIT' })}
          >
            Exit
          </Button>
          <Button variant="primary" className="!bg-white !text-charcoal hover:!bg-white/90" onClick={advance}>
            {step.buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
