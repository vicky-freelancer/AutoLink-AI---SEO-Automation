import React, { useEffect, useRef, useState } from 'react';
import { LogEntry } from '../types';
import { ArrowDown, Trash2 } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  onClear?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll logic
  useEffect(() => {
    if (isAutoScroll && containerRef.current) {
      const { scrollHeight, clientHeight } = containerRef.current;
      containerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [logs, isAutoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Tolerance of 20px to consider "at bottom"
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 20;

    if (isAtBottom) {
      setIsAutoScroll(true);
      setShowScrollButton(false);
    } else {
      setIsAutoScroll(false);
      setShowScrollButton(true);
    }
  };

  const scrollToBottom = () => {
    setIsAutoScroll(true);
    if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        containerRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 font-mono text-xs border border-slate-800 rounded-lg overflow-hidden shadow-inner relative">
      <div className="bg-slate-900 px-3 py-1 text-slate-400 border-b border-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
            <span>sys_log://autolink_engine/tail -f</span>
            {onClear && (
                <button 
                    onClick={onClear}
                    title="Clear Logs"
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-slate-800"
                >
                    <Trash2 size={12} />
                </button>
            )}
        </div>
        <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      </div>
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar scroll-smooth"
      >
        {logs.length === 0 && (
            <div className="text-slate-600 italic text-center mt-10">-- Log cleared --</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 hover:bg-slate-900/50 p-0.5 rounded">
            <span className="text-slate-500 whitespace-nowrap">[{log.timestamp}]</span>
            <span
              className={`font-bold whitespace-nowrap ${
                log.type === 'INFO'
                  ? 'text-blue-400'
                  : log.type === 'SUCCESS'
                  ? 'text-emerald-400'
                  : log.type === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-rose-500'
              }`}
            >
              {log.type}
            </span>
            <span className="text-slate-400 w-24 truncate" title={log.project}>
              [{log.project}]
            </span>
            <span className="text-slate-300 break-all">{log.message}</span>
          </div>
        ))}
      </div>
      
      {showScrollButton && (
        <button 
          onClick={scrollToBottom}
          className="absolute bottom-4 right-4 bg-slate-800/90 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-full shadow-lg text-xs hover:bg-slate-800 transition-all flex items-center gap-2 backdrop-blur-sm z-10"
        >
          <span>Resume Scroll</span>
          <ArrowDown size={12} />
        </button>
      )}
    </div>
  );
};

export default Terminal;