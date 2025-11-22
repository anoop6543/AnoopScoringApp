import React, { useState } from 'react';
import { askRuleAssistant } from '../services/geminiService';
import { Bot, Send, X, Loader2 } from 'lucide-react';

interface RuleAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  gameContext: string;
}

export const RuleAssistant: React.FC<RuleAssistantProps> = ({ isOpen, onClose, gameContext }) => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer(null);
    const result = await askRuleAssistant(query, gameContext);
    setAnswer(result);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full sm:max-w-md md:max-w-lg h-[80vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col border border-slate-700">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
          <div className="flex items-center gap-2 text-indigo-400">
            <Bot size={24} />
            <h3 className="font-bold text-lg">Referee AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
           {!answer && !isLoading && (
             <div className="text-center text-slate-500 py-8">
               <Bot size={48} className="mx-auto mb-3 opacity-20" />
               <p>Ask a rule question or settle a dispute.</p>
               <p className="text-sm mt-2">Example: "Does a flush beat a full house?"</p>
             </div>
           )}

           {isLoading && (
             <div className="flex flex-col items-center justify-center py-8 text-indigo-400">
               <Loader2 size={32} className="animate-spin mb-2" />
               <p className="text-sm">Consulting the rulebook...</p>
             </div>
           )}

           {answer && (
             <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm animate-in zoom-in-95">
               <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{answer}</p>
             </div>
           )}
        </div>

        {/* Input */}
        <form onSubmit={handleAsk} className="p-4 bg-slate-900 border-t border-slate-800 rounded-b-2xl">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your question..."
              className="w-full bg-slate-950 text-white rounded-xl pl-4 pr-12 py-3 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
            />
            <button 
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
