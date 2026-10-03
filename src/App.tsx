import { useState } from 'react';
import { Header } from './components/Header';
import { WorldControls } from './components/WorldControls';
import { CodeEditorPanel } from './components/CodeEditorPanel';
import KarelGrid from './components/KarelGrid';
import InstructionGuide from './components/InstructionGuide';
import { ChallengeBrowser } from './components/ChallengeBrowser';
import { useKarelRunner } from './hooks/useKarelRunner';

export default function App() {
  const [showGuide, setShowGuide] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);

  const {
    lang,
    code,
    robot,
    beepers,
    walls,
    trace,
    displayedTrace,
    history,
    time,
    isProgramLoaded,
    isPlaying,
    error,
    errorInfo,
    statusMsg,
    editMode,
    robotEditDir,
    setCode,
    setEditMode,
    setIsPlaying,
    handleLanguageSwitch,
    handleCellClick,
    handleCompileAndRun,
    computeStep,
    handleBack,
    handleStop,
    handleResetWorld,
    handleShare,
    handleLoadChallenge,
    activeChallengeId,
  } = useKarelRunner();

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-300 flex flex-col p-3 sm:p-4 gap-3 overflow-hidden select-none font-sans">
      {/* Top Header Navigation Bar */}
      <Header
        lang={lang}
        isProgramLoaded={isProgramLoaded}
        showGuide={showGuide}
        showChallenges={showChallenges}
        onLanguageSwitch={handleLanguageSwitch}
        onToggleGuide={() => setShowGuide(!showGuide)}
        onToggleChallenges={() => setShowChallenges(!showChallenges)}
        onShare={handleShare}
      />

      {/* Main Workspace Area (2 Columns) */}
      <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0 overflow-hidden">
        {/* Left Column: World Grid & Action Controls */}
        <main className="relative flex-1 flex flex-col items-center justify-between gap-2.5 min-h-0 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 shadow-inner overflow-hidden">
          {/* Challenge Browser Overlay */}
          <ChallengeBrowser
            lang={lang}
            isOpen={showChallenges}
            activeChallengeId={activeChallengeId}
            onClose={() => setShowChallenges(false)}
            onSelectChallenge={(challenge) => {
              handleLoadChallenge(challenge);
              setShowChallenges(false);
            }}
          />

          {/* Central World Grid Canvas & Toolbar */}
          <WorldControls
            lang={lang}
            isProgramLoaded={isProgramLoaded}
            editMode={editMode}
            time={time}
            history={history}
            trace={trace}
            isPlaying={isPlaying}
            onSetEditMode={setEditMode}
            onResetWorld={handleResetWorld}
            onOpenChallenges={() => setShowChallenges(true)}
            onCompileAndRun={handleCompileAndRun}
            onStop={handleStop}
            onBack={handleBack}
            onForward={computeStep}
            onTogglePlay={setIsPlaying}
          />

          {/* Central World Grid Canvas */}
          <div className="flex-1 w-full flex justify-center items-center min-h-0 py-1">
            <KarelGrid
              robot={robot}
              beepers={beepers}
              walls={walls}
              editMode={editMode}
              robotEditDir={robotEditDir}
              onCellClick={handleCellClick}
              disabled={isProgramLoaded}
            />
          </div>
        </main>

        {/* Right Column: Code Editor & Execution Trace View */}
        <CodeEditorPanel
          lang={lang}
          code={code}
          isProgramLoaded={isProgramLoaded}
          isPlaying={isPlaying}
          trace={trace}
          displayedTrace={displayedTrace}
          error={error}
          errorInfo={errorInfo}
          statusMsg={statusMsg}
          onCodeChange={setCode}
          onStop={handleStop}
        />
      </div>

      {/* Language / Syntax Instruction Guide Modal/Drawer */}
      {showGuide && (
        <div className="shrink-0 overflow-y-auto max-h-[35vh]">
          <InstructionGuide onClose={() => setShowGuide(false)} lang={lang} />
        </div>
      )}
    </div>
  );
}
