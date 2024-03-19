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
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  GitCommit, 
  GitPullRequest, 
  MessageSquare, 
  Terminal as TerminalIcon, 
  CheckCircle,
  AlertCircle,
  Download,
  ExternalLink,
  Users,
  GitMerge
} from 'lucide-react';
import ConfigForm from './components/ConfigForm';
import TerminalLog from './components/TerminalLog';
import ActivityChart from './components/ActivityChart';
import { SimulationConfig, SimulationState, GeneratedItem, ActivityType } from './types';
import { DEFAULT_CONFIG, LOG_MESSAGES } from './constants';
import { generateActivityPlan } from './services/geminiService';
import { verifyRepo, createRealIssue, createRealPR, mergePR, createRealCommit } from './services/githubService';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [viewState, setViewState] = useState<'IDLE' | 'RUNNING' | 'COMPLETE'>('IDLE');
  
  const [simState, setSimState] = useState<SimulationState>({
    isRunning: false,
    progress: 0,
    logs: ["Waiting for credentials..."],
    items: [],
    stats: { issues: 0, prs: 0, commits: 0, discussions: 0 }
  });

  const [chartData, setChartData] = useState<{ time: string, value: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'logs' | 'items'>('logs');

  const handleConfigChange = (key: keyof SimulationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const addLog = (msg: string) => {
    setSimState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-100), msg]
    }));
  };

  const executeRealSimulation = async () => {
    if (!config.githubToken) {
      addLog("ERROR: GitHub Token is required for Real Mode.");
      return;
    }

    setViewState('RUNNING');
    setSimState(prev => ({ ...prev, isRunning: true, progress: 0, items: [], stats: { issues: 0, prs: 0, commits: 0, discussions: 0 } }));
    
    try {
      // 1. Verify Credentials
      addLog(`Authenticating with GitHub...`);
      const { owner, repo } = await verifyRepo(config.githubToken, config.repoName);
      addLog(`SUCCESS: Connected to ${owner}/${repo}`);

      // 2. Generate Plan
      addLog("Initializing Gemini 2.5 Flash for content generation...");
      const totalOps = config.issueCount + config.prCount + config.commitCount;
      const plan = await generateActivityPlan(config.language, config.repoName, totalOps);
      addLog(`Generated ${plan.length} activity templates.`);

      // 3. Execution Loop
      const auth = { token: config.githubToken, owner, repo };
      let completed = 0;
      
      const CHUNK_SIZE = 3; 
      
      for (let i = 0; i < plan.length; i += CHUNK_SIZE) {
        const chunk = plan.slice(i, i + CHUNK_SIZE);
        
        await Promise.all(chunk.map(async (item) => {
          try {
            let result: GeneratedItem | null = null;
            
            if (item.type === ActivityType.ISSUE) {
              addLog(`Creating Issue: ${item.title}...`);
              result = await createRealIssue(auth, item);
              setSimState(prev => ({ ...prev, stats: { ...prev.stats, issues: prev.stats.issues + 1 } }));
            } else if (item.type === ActivityType.PR) {
              addLog(`Creating PR: ${item.title}...`);
              result = await createRealPR(auth, item);
              setSimState(prev => ({ ...prev, stats: { ...prev.stats, prs: prev.stats.prs + 1 } }));
              
              if (result && config.autoMerge) {
                addLog(`Auto-Merging PR #${result.id}...`);
                try {
                  await mergePR(auth, result.id);
                  addLog(`SUCCESS: PR #${result.id} Merged (Badge Progress +1)`);
                  result.status = 'merged';
                } catch (mergeErr: any) {
                  addLog(`WARNING: Failed to auto-merge PR #${result.id}: ${mergeErr.message}`);
                }
              }

            } else if (item.type === ActivityType.COMMIT) {
              addLog(`Pushing Commit: ${item.title}...`);
              result = await createRealCommit(auth, item);
              setSimState(prev => ({ ...prev, stats: { ...prev.stats, commits: prev.stats.commits + 1 } }));
            }

            if (result) {
              setSimState(prev => ({
                 ...prev,
                 items: [result!, ...prev.items]
              }));
              addLog(`SUCCESS: Created ${result.type} #${result.id}`);
            }
          } catch (e: any) {
            addLog(`ERROR: Failed to create ${item.title} - ${e.message}`);
          } finally {
            completed++;
            setSimState(prev => ({ ...prev, progress: (completed / totalOps) * 100 }));
            setChartData(prev => [...prev.slice(-19), { time: new Date().toISOString(), value: completed }]);
          }
        }));

        if (i + CHUNK_SIZE < plan.length) {
          addLog("Cooling down (Rate Limit Protection)...");
          await new Promise(r => setTimeout(r, 2000)); 
        }
      }

      addLog("ALL OPERATIONS COMPLETED.");
      setViewState('COMPLETE');
      setSimState(prev => ({ ...prev, isRunning: false, progress: 100 }));

    } catch (e: any) {
      addLog(`CRITICAL FAILURE: ${e.message}`);
      setViewState('IDLE');
      setSimState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className={`p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm flex items-center justify-between`}>
      <div>
        <p className="text-gray-400 text-xs font-mono uppercase mb-1">{label}</p>
        <p className={`text-2xl font-bold font-mono ${color}`}>{value.toLocaleString()}</p>
      </div>
      <div className={`p-3 rounded-full bg-white/5 ${color.replace('text-', 'text-opacity-80 ')}`}>
        <Icon size={24} className={color} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-turbo-black text-white font-sans selection:bg-neon-cyan selection:text-black overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-cyan blur-lg opacity-50 animate-pulse-fast"></div>
              <GitCommit size={48} className="text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-cyan to-white">
                GITHUB HISTORIAN <span className="text-neon-cyan">TURBO</span>
              </h1>
              <p className="text-gray-400 font-mono text-sm tracking-widest">REAL-TIME GITHUB AUTOMATION ENGINE</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
             <div className="flex items-center gap-2 justify-end text-green-400 font-mono text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                API CONNECTED
             </div>
             <p className="text-gray-600 text-xs mt-1">v3.0.0-real-mode</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <ConfigForm 
              config={config} 
              onChange={handleConfigChange} 
              onDeploy={executeRealSimulation}
              disabled={viewState === 'RUNNING'}
            />
            
            {viewState !== 'IDLE' && (
               <div className="p-6 glass-panel rounded-xl border border-white/10">
                 <h3 className="text-xs font-mono text-gray-400 mb-4">API RESPONSE TIME</h3>
                 <ActivityChart data={chartData} color="#00f2ff" />
               </div>
            )}
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={AlertCircle} label="Issues Created" value={simState.stats.issues} color="text-neon-green" />
              <StatCard icon={GitPullRequest} label="PRs Opened" value={simState.stats.prs} color="text-neon-purple" />
              <StatCard icon={GitCommit} label="Commits Pushed" value={simState.stats.commits} color="text-white" /> 
              <StatCard icon={MessageSquare} label="Ops Queue" value={simState.stats.discussions} color="text-neon-cyan" />
            </div>

            <div className="flex-1 min-h-[500px] glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col relative">
              {viewState === 'RUNNING' && (
                <div className="absolute top-0 left-0 h-1 bg-neon-cyan shadow-[0_0_10px_#00f2ff]" style={{ width: `${simState.progress}%`, transition: 'width 0.1s linear' }} />
              )}

              <div className="flex border-b border-white/5 bg-black/20">
                <button 
                  onClick={() => setActiveTab('logs')}
                  className={`px-6 py-3 text-sm font-mono flex items-center gap-2 ${activeTab === 'logs' ? 'text-neon-cyan border-b-2 border-neon-cyan bg-white/5' : 'text-gray-500 hover:text-white'}`}
                >
                  <TerminalIcon size={14} /> LIVE_LOGS
                </button>
                <button 
                  onClick={() => setActiveTab('items')}
                  className={`px-6 py-3 text-sm font-mono flex items-center gap-2 ${activeTab === 'items' ? 'text-neon-cyan border-b-2 border-neon-cyan bg-white/5' : 'text-gray-500 hover:text-white'}`}
                >
                  <Activity size={14} /> ARTIFACTS <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">{simState.items.length}</span>
                </button>
              </div>

              <div className="flex-1 p-0 overflow-hidden bg-black/40">
                {activeTab === 'logs' ? (
                  <TerminalLog logs={simState.logs} />
                ) : (
                  <div className="h-full overflow-y-auto p-4 space-y-2 scrollbar-hide">
                    {simState.items.length === 0 && (
                      <div className="text-center text-gray-500 mt-20 font-mono text-sm">Waiting for execution...</div>
                    )}
                    {simState.items.map((item) => (
                      <div key={item.id} className="group p-3 rounded border border-white/5 hover:border-white/20 bg-white/5 transition-all flex items-start gap-3">
                        <div className={`mt-1 ${item.type === ActivityType.ISSUE ? 'text-neon-green' : item.type === ActivityType.PR ? 'text-neon-purple' : 'text-white'}`}>
                          {item.type === ActivityType.ISSUE ? <AlertCircle size={16} /> : item.type === ActivityType.PR ? <GitPullRequest size={16} /> : <GitCommit size={16} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-200 hover:text-neon-cyan transition-colors flex items-center gap-2">
                               {item.title} <ExternalLink size={10} />
                             </a>
                             <span className="text-[10px] font-mono text-gray-500">{new Date(item.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">#{item.id}</span>
                            {item.status === 'merged' ? (
                               <span className="text-[10px] bg-neon-purple/20 text-neon-purple px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><GitMerge size={8} /> MERGED</span>
                            ) : (
                               <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded uppercase tracking-wider">LIVE</span>
                            )}
                            
                            {item.coAuthors && item.coAuthors.length > 0 && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-400 border border-white/5 rounded px-1.5 py-0.5 bg-black/20">
                                <Users size={10} />
                                <span>with {item.coAuthors.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {viewState === 'COMPLETE' && (
                <div className="p-4 border-t border-white/10 bg-neon-green/10 flex items-center justify-between animate-pulse-fast">
                  <div className="flex items-center gap-2 text-neon-green">
                    <CheckCircle size={20} />
                    <span className="font-bold font-mono">MISSION ACCOMPLISHED</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;