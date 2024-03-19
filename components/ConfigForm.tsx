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
import React from 'react';
import { SimulationConfig } from '../types';
import { AVAILABLE_FEATURES } from '../constants';
import { Settings, Cpu, Zap, Lock, AlertTriangle, GitMerge } from 'lucide-react';

interface ConfigFormProps {
  config: SimulationConfig;
  onChange: (key: keyof SimulationConfig, value: any) => void;
  onDeploy: () => void;
  disabled: boolean;
}

const ConfigForm: React.FC<ConfigFormProps> = ({ config, onChange, onDeploy, disabled }) => {
  return (
    <div className="p-6 glass-panel rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Cpu size={120} />
      </div>

      <div className="flex items-center gap-2 mb-6 text-neon-cyan">
        <Settings size={20} />
        <h2 className="text-xl font-bold uppercase tracking-wider">Mission Config</h2>
      </div>

      <div className="mb-6 space-y-4">
        <div>
           <label className="block text-xs font-mono text-neon-purple mb-1 flex items-center gap-2">
             <Lock size={10} /> GITHUB PERSONAL ACCESS TOKEN
           </label>
           <input 
              type="password" 
              value={config.githubToken}
              onChange={(e) => onChange('githubToken', e.target.value)}
              disabled={disabled}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-black/60 border border-neon-purple/30 rounded-lg px-4 py-2 text-white focus:border-neon-purple focus:outline-none transition-colors font-mono text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">Requires 'repo' scope. Token is not stored.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">TARGET REPO (OWNER/NAME)</label>
            <input 
              type="text" 
              value={config.repoName}
              onChange={(e) => onChange('repoName', e.target.value)}
              disabled={disabled}
              placeholder="octocat/hello-world"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">LANGUAGE</label>
            <input 
              type="text" 
              value={config.language}
              onChange={(e) => onChange('language', e.target.value)}
              disabled={disabled}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">ISSUES</label>
                <input 
                  type="number" 
                  value={config.issueCount}
                  onChange={(e) => onChange('issueCount', parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-neon-green font-mono focus:border-neon-green focus:outline-none"
                />
             </div>
             <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">PRs</label>
                <input 
                  type="number" 
                  value={config.prCount}
                  onChange={(e) => onChange('prCount', parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-neon-purple font-mono focus:border-neon-purple focus:outline-none"
                />
             </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-mono text-gray-400 mb-1">COMMITS</label>
                <input 
                  type="number" 
                  value={config.commitCount}
                  onChange={(e) => onChange('commitCount', parseInt(e.target.value))}
                  disabled={disabled}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white font-mono focus:border-white focus:outline-none"
                />
             </div>
             <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${config.autoMerge ? 'bg-neon-cyan border-neon-cyan' : 'border-gray-500'}`}>
                    {config.autoMerge && <GitMerge size={14} className="text-black" />}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.autoMerge}
                    onChange={(e) => onChange('autoMerge', e.target.checked)}
                    disabled={disabled}
                    className="hidden"
                  />
                  <span className="text-xs font-mono text-gray-400 group-hover:text-neon-cyan transition-colors">AUTO MERGE PRs</span>
                </label>
             </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-xs font-mono text-gray-400 mb-2">MEGA FEATURES</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_FEATURES.map(feature => (
            <button
              key={feature}
              onClick={() => {
                if (disabled) return;
                const newFeatures = config.megaFeatures.includes(feature)
                  ? config.megaFeatures.filter(f => f !== feature)
                  : [...config.megaFeatures, feature];
                onChange('megaFeatures', newFeatures);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                config.megaFeatures.includes(feature)
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan'
                  : 'bg-white/5 text-gray-500 border border-transparent hover:border-white/20'
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>

      {config.githubToken && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="text-red-500 shrink-0" size={16} />
          <p className="text-[10px] text-red-300">
            WARNING: This will perform REAL operations on GitHub. 
            Ensure you have permission and do not violate GitHub's Terms of Service regarding spam.
          </p>
        </div>
      )}

      <button
        onClick={onDeploy}
        disabled={disabled}
        className={`w-full group relative overflow-hidden border p-4 rounded-xl font-bold uppercase tracking-[0.2em] transition-all
          ${disabled ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' : 'bg-neon-cyan/10 hover:bg-neon-cyan/20 border-neon-cyan text-neon-cyan cursor-pointer'}
        `}
      >
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full ${!disabled && 'group-hover:animate-[scan_1s_ease-in-out_infinite]'}`} />
        <span className="flex items-center justify-center gap-2">
          <Zap className={disabled ? "animate-none" : "animate-pulse"} /> 
          {disabled ? "SYSTEM BUSY" : "ENGAGE TURBO MODE"}
        </span>
      </button>
    </div>
  );
};

export default ConfigForm;