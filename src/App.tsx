import { useEffect, useState } from 'react';
import { useStore } from './state/store';
import { TopNav, type Route } from './components/TopNav';
import { ControlBar } from './components/ControlBar';
import { QueuePage } from './pages/QueuePage';
import { ProcessPage } from './pages/ProcessPage';
import { AutomationHealthPage } from './pages/AutomationHealthPage';
import { AboutPage } from './pages/AboutPage';
import { CaseWorkspace } from './components/CaseWorkspace';
import { GuidedDemo } from './components/GuidedDemo';

export default function App() {
  const { state } = useStore();
  const [route, setRoute] = useState<Route>('queue');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.style.fontSize = state.demo.presentationMode ? '18px' : '16px';
  }, [state.demo.presentationMode]);

  useEffect(() => {
    // If a case is closed/removed from under the guided demo, don't strand the view.
    if (activeCaseId && !state.cases[activeCaseId]) setActiveCaseId(null);
  }, [activeCaseId, state.cases]);

  const openCase = (id: string) => setActiveCaseId(id);
  const closeCase = () => setActiveCaseId(null);
  const goto = (r: Route) => {
    setActiveCaseId(null);
    setRoute(r);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <TopNav route={route} onNavigate={goto} presentationMode={state.demo.presentationMode} />
      <ControlBar onOpenCase={openCase} />
      <main className={`mx-auto max-w-[1400px] px-6 pt-5 ${state.demo.guidedDemoActive ? 'pb-24' : 'pb-16'}`}>
        {activeCaseId ? (
          <CaseWorkspace caseId={activeCaseId} onBack={closeCase} />
        ) : (
          <>
            {route === 'queue' && <QueuePage onOpenCase={openCase} />}
            {route === 'process' && <ProcessPage />}
            {route === 'automation' && <AutomationHealthPage />}
            {route === 'about' && <AboutPage />}
          </>
        )}
      </main>
      {state.demo.guidedDemoActive && <GuidedDemo onOpenCase={openCase} />}
    </div>
  );
}
