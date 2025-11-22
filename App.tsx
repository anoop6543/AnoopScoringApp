import React, { useState, useEffect, useRef } from 'react';
import { Player, AppView } from './types';
import { PlayerCard } from './components/PlayerCard';
import { RuleAssistant } from './components/RuleAssistant';
import { 
  Users, 
  RotateCcw, 
  History, 
  Trophy, 
  PlusCircle, 
  Trash2, 
  Settings, 
  Bot,
  ArrowLeft
} from 'lucide-react';

// Pre-defined pleasing colors for players
const PLAYER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

const App: React.FC = () => {
  // State
  const [view, setView] = useState<AppView>(AppView.SETUP);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameName, setGameName] = useState<string>('Game Night');
  // History is a stack of Player arrays. history[history.length - 1] is the *previous* state.
  const [history, setHistory] = useState<Player[][]>([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Setup State
  const [newPlayerName, setNewPlayerName] = useState('');

  // Initial Load
  useEffect(() => {
    // Add default players for quick start
    if (players.length === 0) {
      setPlayers([
        { id: '1', name: 'Player 1', score: 0, color: PLAYER_COLORS[0] },
        { id: '2', name: 'Player 2', score: 0, color: PLAYER_COLORS[1] },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Actions ---

  const addPlayer = (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = newPlayerName.trim() || `Player ${players.length + 1}`;
    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      score: 0,
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length],
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const startGame = () => {
    setHistory([]);
    setView(AppView.GAME);
  };

  const saveToHistory = () => {
    // Deep copy current players state to history
    const snapshot = JSON.parse(JSON.stringify(players));
    setHistory(prev => [...prev, snapshot]);
  };

  const updateScore = (id: string, delta: number) => {
    saveToHistory();
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, score: p.score + delta } : p
    ));
  };

  const setScore = (id: string, val: number) => {
    saveToHistory();
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, score: val } : p
    ));
  };

  const renamePlayer = (id: string, newName: string) => {
    // We don't necessarily need history for renaming, but let's keep it for consistency
    setPlayers(prev => prev.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  const undo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setPlayers(previousState);
    setHistory(prev => prev.slice(0, -1));
  };

  const resetScores = () => {
    if (confirm("Reset all scores to zero?")) {
      saveToHistory();
      setPlayers(prev => prev.map(p => ({ ...p, score: 0 })));
    }
  };

  const endGame = () => {
    if (confirm("End current game and go back to setup?")) {
      setView(AppView.SETUP);
    }
  };

  // --- Views ---

  if (view === AppView.SETUP) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-4">
              <Trophy size={48} className="text-indigo-400" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">ScoreMaster AI</h1>
            <p className="text-slate-400">Setup your game and players</p>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Game Name</label>
              <input 
                type="text" 
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Catan, Basketball..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Players</label>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }}></div>
                    <span className="flex-1 font-medium">{player.name}</span>
                    <button onClick={() => removePlayer(player.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              
              <form onSubmit={addPlayer} className="flex gap-2">
                <input 
                  type="text" 
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder="Player Name"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-colors">
                  <PlusCircle size={24} />
                </button>
              </form>
            </div>

            <button 
              onClick={startGame}
              disabled={players.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
            >
              Start Scoring
            </button>
          </div>
        </div>
      </div>
    );
  }

  // GAME VIEW
  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Top Bar */}
      <header className="flex-none bg-slate-900 border-b border-slate-800 p-4 z-10 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
            <button onClick={endGame} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-300">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg md:text-xl truncate max-w-[150px] md:max-w-xs">{gameName}</h1>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={resetScores}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Reset All"
            >
                <RotateCcw size={20} />
            </button>
             <button 
                onClick={() => setIsAssistantOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 rounded-lg border border-indigo-500/30 transition-colors"
            >
                <Bot size={18} />
                <span className="hidden md:inline font-medium">Assistant</span>
            </button>
        </div>
      </header>

      {/* Main Grid Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className={`grid gap-4 md:gap-6 w-full max-w-7xl mx-auto ${
          players.length === 1 ? 'grid-cols-1' :
          players.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
          players.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}>
          {players.map(player => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              onUpdateScore={updateScore}
              onSetScore={setScore}
              onRename={renamePlayer}
            />
          ))}
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div className="flex-none p-4 pb-6 md:pb-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex justify-center gap-4 z-20">
         <button 
            onClick={undo}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-full font-semibold border border-slate-700 shadow-lg active:scale-95 transition-all w-full md:w-auto justify-center"
         >
            <History size={20} />
            Undo Last Action
         </button>
      </div>

      <RuleAssistant 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)}
        gameContext={gameName}
      />
    </div>
  );
};

export default App;
