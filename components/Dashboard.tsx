import React, { useRef, useState } from 'react';
import { GameSession, UserProfile } from '../types';
import { PlusCircle, Clock, ChevronRight, Trophy, Trash2, Download, Upload, LogOut, Share2, Cloud, RefreshCw, CheckCircle2 } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DashboardProps {
  user: UserProfile;
  sessions: GameSession[];
  onNewGame: () => void;
  onResumeGame: (session: GameSession) => void;
  onDeleteSession: (id: string) => void;
  onLogout: () => void;
  onRefreshSessions: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  sessions, 
  onNewGame, 
  onResumeGame,
  onDeleteSession,
  onLogout,
  onRefreshSessions
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getLeader = (session: GameSession) => {
    if (!session.players.length) return 'No players';
    const sorted = [...session.players].sort((a, b) => b.score - a.score);
    return `${sorted[0].name} (${sorted[0].score})`;
  };

  const handleBackup = async () => {
    if (navigator.canShare && navigator.share) {
       const shared = await storageService.shareBackup(user.username);
       if (shared) return;
    }

    const file = storageService.generateBackupFile(user.username);
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSync = async () => {
    if (!user.email) return;
    setIsSyncing(true);
    await storageService.syncToCloud(user);
    setIsSyncing(false);
    onRefreshSessions(); // To update the "last synced" display
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storageService.importData(content);
        if (success) {
          alert("Backup restored successfully!");
          onRefreshSessions(); 
        } else {
          alert("Failed to restore backup. Invalid file format.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col p-4 md:p-8 max-w-6xl mx-auto">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome, <span className="text-indigo-400">{user.username}</span></h1>
          <div className="flex items-center gap-2 mt-1">
            {user.email ? (
                 <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Cloud size={12} />
                    <span>Cloud Active: {user.email}</span>
                 </div>
            ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    <Cloud size={12} />
                    <span>Local Mode</span>
                 </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
             {user.email && (
                <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-300 rounded-lg text-sm transition-colors"
                >
                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
             )}
            <button 
                onClick={handleBackup}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-sm transition-colors"
            >
                {navigator.share ? <Share2 size={16} /> : <Download size={16} />}
                <span className="hidden sm:inline">{navigator.share ? 'Share' : 'Export'}</span>
            </button>
            <div className="w-px h-8 bg-slate-800 mx-1"></div>
            <button 
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm transition-colors"
            >
                <LogOut size={16} />
                <span className="hidden md:inline">Logout</span>
            </button>
        </div>
      </header>

      {/* Cloud Status Bar (if synced) */}
      {user.email && user.lastSynced && (
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-800/50 w-fit">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Last successfully synced with cloud: {new Date(user.lastSynced).toLocaleString()}</span>
          </div>
      )}

      {/* Main Stats & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Action Card */}
        <button 
          onClick={onNewGame}
          className="col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white p-6 rounded-3xl shadow-xl shadow-indigo-900/30 flex flex-col items-start justify-between min-h-[180px] transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="p-3 bg-white/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform backdrop-blur-sm">
            <PlusCircle size={32} />
          </div>
          <div className="text-left relative z-10">
            <h3 className="text-2xl font-bold">New Session</h3>
            <p className="text-indigo-100 text-sm mt-1 font-medium">Start scoring a game</p>
          </div>
        </button>

        {/* Stats Card */}
        <div className="col-span-1 lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-slate-800/50 to-transparent"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                    <Trophy size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Your Stats</h3>
                    <p className="text-slate-400 text-sm">Track your gaming history</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative z-10">
                <div>
                    <div className="text-3xl font-black text-white">{sessions.length}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Games Played</div>
                </div>
                <div>
                    <div className="text-3xl font-black text-white">
                        {sessions.reduce((acc, s) => acc + (s.isFinished ? 1 : 0), 0)}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</div>
                </div>
                 <div className="hidden sm:block">
                    <div className="text-3xl font-black text-white">
                        {sessions.length > 0 ? formatDate(sessions[0].lastUpdated).split(',')[0] : '-'}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</div>
                </div>
            </div>
        </div>
      </div>

      {/* Recent Games List */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-slate-400" />
          History
        </h2>

        {sessions.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            <Trophy size={48} className="mx-auto mb-4 text-slate-700" />
            <p className="text-slate-500 font-medium">No game history found.</p>
            <p className="text-slate-600 text-sm mt-1">Start a new session or import a backup.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <div 
                key={session.id}
                className="group flex items-center gap-4 p-5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all cursor-pointer relative overflow-hidden"
                onClick={() => onResumeGame(session)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex-1 min-w-0 relative z-10">
                  <h4 className="font-bold text-white text-lg truncate group-hover:text-indigo-400 transition-colors">
                    {session.name}
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="font-medium text-slate-400">{formatDate(session.date)}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                    <span className="truncate">Players: {session.players.length}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full hidden sm:inline"></span>
                    <span className="truncate hidden sm:inline text-indigo-400/80">Leading: {getLeader(session)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 relative z-10">
                    <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                    className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Session"
                    >
                    <Trash2 size={18} />
                    </button>
                    
                    <div className="p-2 text-slate-600 group-hover:text-white transition-colors">
                    <ChevronRight size={24} />
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};