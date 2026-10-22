'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sparkles, Users, Radio, Shield, ArrowRight } from 'lucide-react';
import { useGameStore } from '../game/state/useGameStore';
import { GameHUD } from '../game/ui/GameHUD';
import { networkManager } from '../game/network/socketClient';

// Dynamically import Three.js 3D Scene with SSR disabled to prevent window/canvas hydration mismatch
const NairobiCBDScene = dynamic(
  () => import('../game/scenes/NairobiCBDScene').then((mod) => mod.NairobiCBDScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07090e] text-white">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold tracking-widest uppercase text-emerald-400">
          GENERATING NAIROBI CBD • KICC • PARLIAMENT...
        </p>
      </div>
    ),
  }
);

export default function GamePage() {
  const {
    username,
    placardText,
    outfitColor,
    isStreaming,
    setUsername,
    setPlacardText,
    setOutfitColor,
  } = useGameStore();

  const [hasJoined, setHasJoined] = useState(false);
  const [localName, setLocalName] = useState(username);
  const [localPlacard, setLocalPlacard] = useState(placardText);
  const [localColor, setLocalColor] = useState(outfitColor);

  useEffect(() => {
    if (hasJoined) {
      networkManager.connect();
      return () => {
        networkManager.disconnect();
      };
    }
  }, [hasJoined]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localName.trim()) {
      setUsername(localName.trim());
      setPlacardText(localPlacard.trim());
      setOutfitColor(localColor);
      setHasJoined(true);
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D Nairobi World */}
      <NairobiCBDScene />

      {/* In-Game HUD overlay */}
      {hasJoined && <GameHUD />}

      {/* Smartphone Stream POV Visual Filter */}
      {hasJoined && isStreaming && (
        <div className="pointer-events-none fixed inset-0 z-30 border-[16px] border-black/80 rounded-3xl phone-stream-overlay">
          <div className="absolute top-6 left-8 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <span className="px-2 py-0.5 rounded bg-red-600 text-[10px] font-bold text-white tracking-widest uppercase">
              REC • TIKTOK LIVE
            </span>
          </div>
          <div className="absolute top-6 right-8 text-xs font-mono text-white/80">
            🔋 88% • 5G NAIROBI
          </div>
        </div>
      )}

      {/* INITIAL LOBBY / CHARACTER CREATION MODAL */}
      {!hasJoined && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="glass-panel border border-white/20 p-8 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col gap-6">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
                🇰🇪 NAIROBI PROTEST SIMULATOR
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                MAANDAMANO <span className="text-emerald-400">3D</span>
              </h1>
              <p className="text-xs text-white/70 max-w-sm">
                Step into the shoes of Kenya's Gen Z in Nairobi CBD. Assemble at Parliament Road, customize your placard, wave the flag, and broadcast the truth.
              </p>
            </div>

            {/* Customization Form */}
            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Protester Alias / Nickname
                </label>
                <input
                  type="text"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  maxLength={18}
                  required
                  placeholder="e.g. GenZ_Tribeless"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Starting Placard Slogan
                </label>
                <input
                  type="text"
                  value={localPlacard}
                  onChange={(e) => setLocalPlacard(e.target.value.toUpperCase())}
                  maxLength={36}
                  required
                  placeholder="e.g. REJECT FINANCE BILL 2024"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-amber-300 font-bold uppercase focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Hoodie / Bandana Color
                </label>
                <div className="flex items-center gap-3">
                  {[
                    { color: '#10b981', label: 'Protest Green' },
                    { color: '#ef4444', label: 'Solidarity Red' },
                    { color: '#f59e0b', label: 'Sun Gold' },
                    { color: '#38bdf8', label: 'Nairobi Sky' },
                    { color: '#a855f7', label: 'Afro Purple' },
                    { color: '#f8fafc', label: 'Peace White' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.color}
                      onClick={() => setLocalColor(item.color)}
                      style={{ backgroundColor: item.color }}
                      className={`w-9 h-9 rounded-full transition-all border-2 ${
                        localColor === item.color
                          ? 'border-white scale-110 shadow-lg'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              {/* Enter Button */}
              <button
                type="submit"
                className="mt-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>ENTER NAIROBI CBD PROTEST</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Feature Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-[10px] text-white/60">
              <div className="p-2 rounded-xl bg-white/5">
                <Users className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                <span>Multiplayer Protest</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <Radio className="w-3.5 h-3.5 text-rose-400 mx-auto mb-1" />
                <span>Phone Stream Mode</span>
              </div>
              <div className="p-2 rounded-xl bg-white/5">
                <Shield className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                <span>Rapier 3D Physics</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
