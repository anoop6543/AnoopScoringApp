import React, { useState, useEffect, useRef } from 'react';
import { User, ShieldCheck, ArrowRight, Upload, Mail, Cloud, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserProfile } from '../types';

interface WelcomeScreenProps {
  onLogin: (name: string, email?: string) => void;
  onGuestAccess: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, onGuestAccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isCloudMode, setIsCloudMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadUsers = () => {
    const users = storageService.getAllUsers();
    setRecentUsers(users.slice(-3).reverse());
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCloudMode && !email.trim()) {
      alert("Please enter an email for cloud backup.");
      return;
    }

    setIsLoading(true);
    // Simulate a small delay for local feeling or real delay for cloud
    if (isCloudMode) {
       // Let the parent handle the async login logic
       await onLogin(name.trim(), email.trim());
    } else {
       onLogin(name.trim());
    }
    setIsLoading(false);
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
          alert("Backup restored! You can now login with your recovered profile.");
          loadUsers(); 
        } else {
          alert("Failed to restore backup. Invalid file format.");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".json" 
        className="hidden" 
      />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl ring-1 ring-indigo-500/20 mb-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <ShieldCheck size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">ScoreMaster<span className="text-indigo-500">.</span>AI</h1>
          <p className="text-slate-400 text-lg">Your universal scorekeeper.</p>
        </div>

        {/* Quick Login for Recent Users */}
        {recentUsers.length > 0 && !isCloudMode && (
          <div className="grid grid-cols-1 gap-2">
             <div className="flex justify-between items-end px-1">
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Local Profiles</p>
             </div>
             {recentUsers.map(user => (
               <button
                 key={user.id}
                 onClick={() => onLogin(user.username)}
                 className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors group"
               >
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                     {user.username.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex flex-col items-start">
                     <span className="font-medium text-slate-200">{user.username}</span>
                     {user.email && <span className="text-[10px] text-slate-500 flex items-center gap-1"><Cloud size={8} /> {user.email}</span>}
                   </div>
                 </div>
                 <ArrowRight size={16} className="text-slate-600 group-hover:text-indigo-400" />
               </button>
             ))}
          </div>
        )}

        {/* Auth Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
                onClick={() => setIsCloudMode(true)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isCloudMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Cloud Login
            </button>
            <button 
                onClick={() => setIsCloudMode(false)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isCloudMode ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Local Only
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
           
           <div className="relative group text-left">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Username</label>
            <div className="relative">
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GamerOne"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 pl-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            </div>
          </div>

          {isCloudMode && (
              <div className="relative group text-left animate-in fade-in slide-in-from-top-2">
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Email (For Backup)</label>
                <div className="relative">
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 pl-12 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-medium"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 ml-1">We use this to secure your data. No password needed.</p>
              </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || (isCloudMode && !email.trim()) || isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin"/> : (
                <>
                    <span>{isCloudMode ? 'Login & Sync' : 'Start Playing'}</span>
                    <ArrowRight size={20} />
                </>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-3 pt-2">
           {!isCloudMode && (
                <button
                    onClick={handleImportClick}
                    className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Upload size={14} />
                    <span>Restore Local File</span>
                </button>
           )}
           
           <button
             onClick={onGuestAccess}
             className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors hover:underline underline-offset-4"
           >
             Continue as Guest
           </button>
        </div>
      </div>
    </div>
  );
};