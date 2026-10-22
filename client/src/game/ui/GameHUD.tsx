'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Volume2, 
  VolumeX, 
  Users, 
  Radio, 
  ShieldAlert, 
  Send, 
  Camera, 
  Sparkles, 
  Milk, 
  MessageSquare, 
  Edit3, 
  TrendingUp, 
  X,
  HelpCircle,
  Megaphone,
  Compass
} from 'lucide-react';
import { useGameStore, CameraMode } from '../state/useGameStore';
import { soundManager } from '../audio/soundManager';

export function GameHUD() {
  const {
    username,
    stamina,
    hype,
    teargasExposure,
    milkBottles,
    placardText,
    isChanting,
    isStreaming,
    streamViewers,
    cameraMode,
    isMuted,
    tension,
    chatMessages,
    isPlacardEditorOpen,
    setPlacardText,
    setPlacardEditorOpen,
    setCameraMode,
    toggleStream,
    setChanting,
    useMilkBottle,
    toggleMute,
    addChatMessage,
  } = useGameStore();

  const [inputPlacard, setInputPlacard] = useState(placardText);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const handleSavePlacard = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPlacard.trim()) {
      setPlacardText(inputPlacard.trim());
      setPlacardEditorOpen(false);
      soundManager.playWhistle();
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      addChatMessage({
        id: 'msg_' + Date.now(),
        senderId: 'local',
        senderName: username,
        text: chatInput.trim(),
        timestamp: Date.now(),
        isChant: chatInput.includes('!') || chatInput.length < 20,
      });
      setChatInput('');
    }
  };

  const handleChantPress = () => {
    soundManager.playVuvuzela(1.4);
    setChanting(true);
    setTimeout(() => setChanting(false), 1400);
  };

  const handleDrinkMilk = () => {
    soundManager.playDrinkMilk();
    useMilkBottle();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between p-4 font-sans select-none">
      
      {/* Teargas Screen Blur / Vignette Overlay */}
      {teargasExposure > 15 && (
        <div 
          className="pointer-events-none fixed inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, transparent 35%, rgba(203, 213, 225, ${teargasExposure / 120}) 100%)`,
            backdropFilter: `blur(${Math.min(8, teargasExposure / 12)}px)`,
          }}
        />
      )}

      {/* TOP HEADER: Compact & Sleek */}
      <header className="flex items-start justify-between gap-3 w-full">
        {/* Top Left: Live Status & Viewers */}
        <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-panel border border-white/10 shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-300">
              {isStreaming ? 'LIVE' : 'NAIROBI CBD'}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>{streamViewers.toLocaleString()}</span>
            <TrendingUp className="w-3 h-3 text-emerald-400" />
          </div>

          <div className="h-3 w-[1px] bg-white/20" />

          <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{tension.trendingHashtag}</span>
          </div>
        </div>

        {/* Top Center: Minimal Tension Gauge */}
        <div className="pointer-events-auto flex flex-col items-center gap-1 glass-panel px-4 py-1.5 rounded-2xl border border-white/15 max-w-sm w-full shadow-xl">
          <div className="flex items-center justify-between w-full text-[10px] font-bold">
            <span className="text-emerald-400">🇰🇪 Solidarity {tension.publicSolidarity}%</span>
            <span className="text-white/60 tracking-wider font-mono">HALI YA HEWA</span>
            <span className="text-rose-400">🛡️ Police {tension.policeAlertLevel}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden p-0.5 border border-white/10 flex gap-0.5">
            <div 
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-500" 
              style={{ width: `${tension.publicSolidarity}%` }}
              title="Solidarity"
            />
            <div 
              className="h-full bg-amber-500 transition-all duration-500" 
              style={{ width: `${tension.politicalPanic}%` }}
              title="Political Panic"
            />
            <div 
              className="h-full bg-rose-600 rounded-r-full transition-all duration-500" 
              style={{ width: `${tension.policeAlertLevel}%` }}
              title="Police Alert"
            />
          </div>
        </div>

        {/* Top Right: Camera Switcher & Sound Toggle */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-xl glass-panel border border-white/10">
            {(['third_person', 'stream_pov', 'tactical_drone'] as CameraMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setCameraMode(mode)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  cameraMode === mode
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode === 'third_person' ? '3rd' : mode === 'stream_pov' ? '📱 POV' : '🚁 Drone'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              toggleMute();
              soundManager.setMuted(!isMuted);
            }}
            className="p-2 rounded-xl glass-panel border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 shadow-md"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* MIDDLE: Teargas Exposure Alert (Only when affected) */}
      {teargasExposure > 30 && (
        <div className="pointer-events-auto self-center px-5 py-2 rounded-2xl glass-panel-danger border border-rose-500/40 text-rose-200 flex items-center gap-3 animate-bounce shadow-2xl">
          <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
          <div className="text-xs">
            <p className="font-bold">TEARGAS EXPOSURE ({Math.round(teargasExposure)}%)</p>
            <p className="text-[11px] text-rose-300">Click Milk button or press [M] to flush eyes!</p>
          </div>
          <button
            onClick={handleDrinkMilk}
            disabled={milkBottles <= 0}
            className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            DRINK ({milkBottles})
          </button>
        </div>
      )}

      {/* FLOATING CHAT POPUP (Opened via Chat Icon) */}
      {isChatOpen && (
        <div className="pointer-events-auto fixed bottom-24 left-4 z-50 flex flex-col h-64 w-80 glass-panel rounded-2xl border border-white/15 p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10">
            <span className="text-xs font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> NAIROBI CROWD CHAT
            </span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-1.5 rounded-lg ${
                  msg.isChant 
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200' 
                    : 'bg-black/40 text-white/90'
                }`}
              >
                <span className="font-bold text-sky-400">{msg.senderName}: </span>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Field */}
          <form onSubmit={handleSendChat} className="mt-2 flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Chant or shout to crowd..."
              className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING CONTROLS MODAL (Opened via ? Icon) */}
      {isControlsOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="glass-panel border border-white/20 p-6 rounded-3xl max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> GEN Z CONTROLS & MECHANICS
              </h3>
              <button 
                onClick={() => setIsControlsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs text-white/80">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-medium">Move Character</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-emerald-400 font-bold">WASD</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-medium">Sprint Dash</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-emerald-400 font-bold">Shift</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-medium">Jump Obstacles</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-emerald-400 font-bold">Space</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-medium">Chant / Vuvuzela</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-amber-400 font-bold">[C]</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-medium">Phone Live-Stream</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-rose-400 font-bold">[F]</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="font-medium">Drink Milk Antidote</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-sky-400 font-bold">[M]</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 col-span-2">
                <span className="font-medium">Customize Protest Placard</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 font-mono text-amber-300 font-bold">[P]</kbd>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 leading-relaxed">
              💡 <strong>Protest Tips:</strong> Hold your placard high to attract live viewers. Stay back from the water cannon blast and use milk bottles to flush teargas. Chanting together pushes back police readiness!
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM SECTION: Sleek Minimalist Action Dock */}
      <footer className="flex flex-col items-center gap-2.5 w-full pb-2">
        
        {/* Placard Slogan Display Pill */}
        <div 
          onClick={() => setPlacardEditorOpen(true)}
          className="pointer-events-auto group cursor-pointer flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-500/30 hover:border-amber-400 transition-all shadow-xl hover:scale-105 active:scale-95"
          title="Click to edit placard slogan [P]"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-amber-300 tracking-wide">
            📋 "{placardText}"
          </span>
          <Edit3 className="w-3 h-3 text-white/60 group-hover:text-white" />
        </div>

        {/* Floating Icon Action Dock */}
        <div className="pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl glass-panel border border-white/15 shadow-2xl">
          
          {/* Chant / Vuvuzela */}
          <button
            onClick={handleChantPress}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isChanting 
                ? 'bg-amber-500 text-black animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title="Chant / Vuvuzela [C]"
          >
            <Megaphone className="w-4 h-4" />
            <span>CHANT [C]</span>
          </button>

          {/* Milk Bottle Antidote */}
          <button
            onClick={handleDrinkMilk}
            disabled={milkBottles <= 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-700/80 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-40"
            title="Drink Milk to Clear Teargas [M]"
          >
            <Milk className="w-4 h-4" />
            <span>MILK ({milkBottles})</span>
          </button>

          {/* Live Stream Mode */}
          <button
            onClick={toggleStream}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
              isStreaming
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle Phone Live-Stream [F]"
          >
            <Camera className="w-4 h-4" />
            <span>{isStreaming ? 'LIVE ON' : 'LIVE [F]'}</span>
          </button>

          <div className="h-6 w-[1px] bg-white/20 mx-1" />

          {/* Open Chat Icon Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-xl transition-all shadow-md active:scale-95 relative ${
              isChatOpen 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle Nairobi Crowd Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          {/* Open Instructions / Controls Modal Button */}
          <button
            onClick={() => setIsControlsOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shadow-md active:scale-95"
            title="View Keyboard Controls & Help"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>

        {/* Minimal Stamina & Hype Indicator */}
        <div className="flex items-center gap-3 w-56">
          <div className="flex-1">
            <div className="flex justify-between text-[9px] text-white/60 mb-0.5 font-semibold">
              <span>STAMINA</span>
              <span>{Math.round(stamina)}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-sky-400 transition-all duration-200" 
                style={{ width: `${stamina}%` }} 
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between text-[9px] text-emerald-400 mb-0.5 font-semibold">
              <span>HYPE</span>
              <span>{Math.round(hype)}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-200" 
                style={{ width: `${hype}%` }} 
              />
            </div>
          </div>
        </div>

      </footer>

      {/* PLACARD EDITOR MODAL */}
      {isPlacardEditorOpen && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="glass-panel border border-amber-500/40 p-6 rounded-3xl max-w-md w-full shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                📋 CUSTOMIZE YOUR PLACARD
              </h3>
              <button 
                onClick={() => setPlacardEditorOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-white/70">
              Write your protest message. It will appear directly on the cardboard sign held by your 3D character in Nairobi CBD.
            </p>

            <form onSubmit={handleSavePlacard} className="flex flex-col gap-3">
              <input
                type="text"
                value={inputPlacard}
                onChange={(e) => setInputPlacard(e.target.value.toUpperCase())}
                placeholder="E.g. REJECT FINANCE BILL"
                maxLength={40}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-white/20 text-sm font-bold text-amber-300 uppercase tracking-wide focus:outline-none focus:border-amber-400"
              />

              {/* Preset Quick Slogans */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  'REJECT FINANCE BILL 2024!',
                  'TUMECHOKA!',
                  'WE ARE PEACEFUL',
                  'OCCUPY PARLIAMENT',
                  'TUBEBE MAWE AMA TUBEBE LOGIC?',
                  'TRIBELESS & PARTYLESS'
                ].map((slogan) => (
                  <button
                    type="button"
                    key={slogan}
                    onClick={() => setInputPlacard(slogan)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] text-white/80 transition-all"
                  >
                    {slogan}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPlacardEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg transition-all active:scale-95"
                >
                  Save to Placard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
