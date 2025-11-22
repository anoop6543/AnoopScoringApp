import React, { useState } from 'react';
import { Player } from '../types';
import { Plus, Minus, Edit2, Check, RotateCcw } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onUpdateScore: (id: string, delta: number) => void;
  onSetScore: (id: string, val: number) => void;
  onRename: (id: string, newName: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdateScore, onSetScore, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(player.name);
  const [customDelta, setCustomDelta] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleRename = () => {
    if (tempName.trim()) {
      onRename(player.id, tempName);
    }
    setIsEditing(false);
  };

  const handleCustomScore = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customDelta);
    if (!isNaN(val)) {
      onUpdateScore(player.id, val);
      setCustomDelta('');
      setShowCustomInput(false);
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-between p-4 rounded-2xl shadow-lg transition-transform transform hover:scale-[1.01]"
      style={{ backgroundColor: player.color }}
    >
      {/* Header / Name */}
      <div className="w-full flex justify-between items-center mb-4 text-white/90">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input 
              type="text" 
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-black/20 rounded px-2 py-1 w-full text-lg font-bold outline-none border border-white/30"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
            <button onClick={handleRename} className="p-1 hover:bg-white/20 rounded"><Check size={18} /></button>
          </div>
        ) : (
          <h3 
            className="text-xl md:text-2xl font-bold truncate flex-1 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {player.name}
          </h3>
        )}
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="opacity-50 hover:opacity-100 p-1">
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {/* Score Display */}
      <div className="flex-1 flex items-center justify-center py-6">
        <span className="text-7xl md:text-8xl font-black text-white drop-shadow-md tracking-tighter">
          {player.score}
        </span>
      </div>

      {/* Controls */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        <button 
          onClick={() => onUpdateScore(player.id, -1)}
          className="flex items-center justify-center bg-black/20 hover:bg-black/30 active:scale-95 transition-all text-white p-4 rounded-xl"
        >
          <Minus size={32} />
        </button>
        <button 
          onClick={() => onUpdateScore(player.id, 1)}
          className="flex items-center justify-center bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white p-4 rounded-xl"
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Advanced Input Toggle */}
      <div className="w-full mt-3 flex justify-center">
        {showCustomInput ? (
          <form onSubmit={handleCustomScore} className="flex gap-2 w-full animate-in fade-in slide-in-from-bottom-2">
            <input 
              type="number" 
              placeholder="+/-"
              value={customDelta}
              onChange={(e) => setCustomDelta(e.target.value)}
              className="w-full bg-black/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-center outline-none border border-white/20 focus:border-white/50"
              autoFocus
            />
             <button type="submit" className="bg-white/20 px-3 rounded-lg"><Check size={20} /></button>
             <button type="button" onClick={() => setShowCustomInput(false)} className="bg-black/20 px-3 rounded-lg"><RotateCcw size={16} /></button>
          </form>
        ) : (
          <button 
            onClick={() => setShowCustomInput(true)}
            className="text-xs text-white/60 hover:text-white uppercase tracking-wider font-semibold py-2"
          >
            Custom Add
          </button>
        )}
      </div>
    </div>
  );
};
