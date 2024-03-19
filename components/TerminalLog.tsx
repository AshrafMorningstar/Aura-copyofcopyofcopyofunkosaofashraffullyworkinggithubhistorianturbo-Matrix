/**
 * @license
 * Copyright © 2026 Ashraf Morningstar
 * https://github.com/AshrafMorningstar
 * 
 * Licensed under the MIT License.
 * This is a personal educational recreation.
 * Original concepts remain property of their respective creators.
 * 
 * @author Ashraf Morningstar
 * @see https://github.com/AshrafMorningstar
 */
import React, { useEffect, useRef } from 'react';

interface TerminalLogProps {
  logs: string[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="w-full h-64 bg-turbo-black border border-white/10 rounded-lg p-4 overflow-hidden font-mono text-xs relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-gradient-to-b from-transparent to-turbo-black/20 z-10" />
      <div className="space-y-1 h-full overflow-y-auto scrollbar-hide pb-4">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start text-emerald-500/80">
            <span className="mr-2 opacity-50">[{new Date().toLocaleTimeString().split(' ')[0]}.{Math.floor(Math.random() * 999)}]</span>
            <span className={log.includes("ERROR") ? "text-red-500" : "text-emerald-400"}>
              {">"} {log}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalLog;