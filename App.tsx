import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Layers, 
  Settings, 
  Terminal as TerminalIcon, 
  Play, 
  Square, 
  Plus, 
  Cpu, 
  Globe, 
  Shield,
  Pause,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Project, ProjectStatus, LogEntry, TierType } from './types';
import Terminal from './components/Terminal';
import TierVisualizer from './components/TierVisualizer';
import ProjectModal from './components/ProjectModal';

// --- Mock Data Initialization ---
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Main E-Comm Site',
    url: 'https://shop-example.com',
    status: ProjectStatus.RUNNING,
    verifiedLinks: 1240,
    submittedLinks: 4500,
    rpm: 45,
    tier: TierType.TIER_1,
    engines: ['WordPress', 'Drupal'],
    content: { keywords: ['buy shoes', 'sneakers'], title: '', body: '' }
  },
  {
    id: '2',
    name: 'Blog Network A',
    url: 'https://pbn-network-01.com',
    status: ProjectStatus.PAUSED,
    verifiedLinks: 8500,
    submittedLinks: 12000,
    rpm: 0,
    tier: TierType.TIER_2,
    engines: ['Wiki', 'Forum'],
    content: { keywords: ['fashion blog', 'trends'], title: '', body: '' }
  },
  {
    id: '3',
    name: 'Social Signals',
    url: 'https://social-aggregator.net',
    status: ProjectStatus.STOPPED,
    verifiedLinks: 320,
    submittedLinks: 320,
    rpm: 0,
    tier: TierType.TIER_3,
    engines: ['Microblog', 'Social Bookmark'],
    content: { keywords: ['viral content'], title: '', body: '' }
  },
  // Generated Mock Data to demonstrate scrolling
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `demo-${i + 4}`,
    name: `Niche Tier ${i % 2 === 0 ? '2' : '3'} Campaign ${String.fromCharCode(65 + i)}`,
    url: `https://niche-site-${i + 4}.org`,
    status: i % 3 === 0 ? ProjectStatus.RUNNING : ProjectStatus.PAUSED,
    verifiedLinks: Math.floor(Math.random() * 5000) + 100,
    submittedLinks: Math.floor(Math.random() * 15000) + 500,
    rpm: i % 3 === 0 ? Math.floor(Math.random() * 60) + 10 : 0,
    tier: i % 2 === 0 ? TierType.TIER_2 : TierType.TIER_3,
    engines: ['WordPress', 'Joomla'],
    content: { keywords: [], title: '', body: '' }
  }))
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'settings'>('dashboard');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Stats for charts
  const [chartData, setChartData] = useState<{time: string, links: number}[]>([]);
  const [resourceData, setResourceData] = useState<{time: string, cpu: number, memory: number}[]>([]);

  // Ref to hold projects for the interval closure to access latest state without dependency issues
  const projectsRef = useRef(projects);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // --- Simulation Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      // High precision timestamp for debugging
      const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = `${time}.${ms}`;
      
      let totalRpm = 0;
      const newLogs: LogEntry[] = [];
      const currentProjects = projectsRef.current;

      // Calculate new project states
      const updatedProjects = currentProjects.map(p => {
        if (p.status === ProjectStatus.RUNNING) {
          const added = Math.floor(Math.random() * 3);
          const currentRpm = Math.floor(Math.random() * 60) + 10;
          totalRpm += currentRpm;
          
          // Random log generation
          if (Math.random() > 0.7) {
            const types: ('INFO' | 'SUCCESS' | 'WARNING')[] = ['INFO', 'INFO', 'SUCCESS', 'WARNING'];
            const type = types[Math.floor(Math.random() * types.length)];
            const msgs = [
                'Identifying target forms...',
                `Found target: ${Math.random().toString(36).substring(7)}.com`,
                'Solving CAPTCHA (reCAPTCHA v3)...',
                'Verifying email address...',
                'Submission successful',
                'Proxy 192.168.x.x rotation initiated'
            ];
            newLogs.push({
                id: Date.now() + Math.random(),
                timestamp: timeStr,
                type: type,
                message: msgs[Math.floor(Math.random() * msgs.length)],
                project: p.name
            });
          }

          return {
            ...p,
            verifiedLinks: p.verifiedLinks + (Math.random() > 0.8 ? 1 : 0),
            submittedLinks: p.submittedLinks + added,
            rpm: currentRpm
          };
        }
        return { ...p, rpm: 0 };
      });

      // Update States
      setProjects(updatedProjects);

      // Update Link Velocity Chart
      setChartData(prev => {
        const newData = [...prev, { time: timeStr, links: totalRpm }];
        return newData.slice(-20); // Keep last 20 points
      });

      // Update Resource Chart (Simulated)
      setResourceData(prev => {
        const cpuBase = 20 + Math.random() * 10;
        const load = (totalRpm / 500) * 50; // Artificial load based on RPM
        const cpu = Math.min(100, cpuBase + load);
        const mem = Math.min(100, 30 + (updatedProjects.length * 2) + Math.random() * 5);
        
        const newData = [...prev, { time: timeStr, cpu, memory: mem }];
        return newData.slice(-30);
      });

      // Update Logs
      if (newLogs.length > 0) {
        setLogs(prev => [...prev, ...newLogs].slice(-100));
      }

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const toggleProjectStatus = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = p.status === ProjectStatus.RUNNING ? ProjectStatus.STOPPED : ProjectStatus.RUNNING;
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleSaveProject = (p: Project) => {
      if (editingProject) {
          setProjects(prev => prev.map(curr => curr.id === p.id ? p : curr));
      } else {
          setProjects(prev => [...prev, p]);
      }
      setEditingProject(null);
  };

  const openNewProject = () => {
      setEditingProject(null);
      setShowModal(true);
  };

  const openEditProject = (p: Project) => {
      setEditingProject(p);
      setShowModal(true);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === projects.length && projects.length > 0) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(projects.map(p => p.id)));
    }
  };

  const executeBulkAction = (action: ProjectStatus | 'DELETE') => {
    if (action === 'DELETE') {
        setProjects(prev => prev.filter(p => !selectedIds.has(p.id)));
    } else {
        setProjects(prev => prev.map(p => selectedIds.has(p.id) ? { ...p, status: action } : p));
    }
    setSelectedIds(new Set());
  };

  const clearLogs = () => {
      setLogs([]);
  };

  // --- Components ---

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
        activeTab === id 
        ? 'bg-slate-800 text-emerald-400 border-r-2 border-emerald-400' 
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
             <Globe className="animate-pulse" />
             <span className="font-bold text-lg tracking-wider">AUTOLINK</span>
          </div>
          <span className="text-xs text-slate-500 uppercase tracking-[0.2em] font-semibold">AI Automation Suite</span>
        </div>
        
        <nav className="flex-1 mt-6">
          <SidebarItem id="dashboard" icon={Activity} label="Dashboard" />
          <SidebarItem id="projects" icon={Layers} label="Campaigns" />
          <SidebarItem id="settings" icon={Settings} label="Global Settings" />
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
            <div className="bg-slate-900 rounded p-3 text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                    <span>CPU Usage</span>
                    <span>{resourceData.length > 0 ? Math.round(resourceData[resourceData.length-1].cpu) : 0}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                        className="bg-blue-500 h-full transition-all duration-500" 
                        style={{ width: `${resourceData.length > 0 ? resourceData[resourceData.length-1].cpu : 0}%`}}
                    ></div>
                </div>
                <div className="flex justify-between text-slate-400">
                    <span>Proxies Active</span>
                    <span className="text-emerald-400">142/150</span>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-20">
           <h1 className="text-xl font-semibold text-white">
               {activeTab === 'dashboard' && 'Operations Center'}
               {activeTab === 'projects' && 'Campaign Management'}
               {activeTab === 'settings' && 'System Configuration'}
           </h1>
           <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-xs font-mono text-emerald-400">SYSTEM ONLINE</span>
               </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden p-6 gap-6 grid grid-cols-1 lg:grid-cols-3">
            
            {/* Left/Main Column - Independent Scrolling Zones */}
            <div className="lg:col-span-2 flex flex-col h-full min-h-0">
                
                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase font-bold">Total Verified</span>
                                <div className="text-2xl font-mono text-white mt-1">
                                    {projects.reduce((acc, p) => acc + p.verifiedLinks, 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase font-bold">Links / Min</span>
                                <div className="text-2xl font-mono text-emerald-400 mt-1">
                                    {projects.reduce((acc, p) => acc + p.rpm, 0)}
                                </div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                <span className="text-slate-500 text-xs uppercase font-bold">Active Threads</span>
                                <div className="text-2xl font-mono text-blue-400 mt-1">450</div>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 h-64 flex flex-col">
                            <h3 className="text-sm font-medium text-slate-400 mb-4 shrink-0">Link Velocity (LPM)</h3>
                            <div className="flex-1 w-full min-h-0 relative">
                                <div className="absolute inset-0">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="time" hide />
                                            <YAxis stroke="#475569" fontSize={10} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                                itemStyle={{ color: '#10b981' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="links" 
                                                stroke="#10b981" 
                                                strokeWidth={2} 
                                                dot={false} 
                                                isAnimationActive={false} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px]">
                            <TierVisualizer projects={projects} />
                        </div>
                    </div>
                )}

                {/* Projects View */}
                {activeTab === 'projects' && (
                    <div className="flex flex-col h-full min-h-0 pr-1">
                        {selectedIds.size > 0 ? (
                            <div className="flex items-center gap-4 bg-slate-900 p-2 rounded-lg border border-slate-700 mb-4 animate-in fade-in slide-in-from-top-2 shrink-0">
                                <span className="text-sm font-medium text-white px-2 border-r border-slate-700">{selectedIds.size} Selected</span>
                                
                                <button onClick={() => executeBulkAction(ProjectStatus.RUNNING)} className="flex items-center gap-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded transition">
                                    <Play size={14} /> Start
                                </button>
                                <button onClick={() => executeBulkAction(ProjectStatus.PAUSED)} className="flex items-center gap-2 text-xs font-medium text-amber-400 hover:bg-amber-500/10 px-3 py-1.5 rounded transition">
                                    <Pause size={14} /> Pause
                                </button>
                                <button onClick={() => executeBulkAction(ProjectStatus.STOPPED)} className="flex items-center gap-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded transition">
                                    <Square size={14} /> Stop
                                </button>
                                <div className="flex-1"></div>
                                <button onClick={() => executeBulkAction('DELETE')} className="text-slate-500 hover:text-rose-400 transition p-2 hover:bg-rose-500/10 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center mb-4 shrink-0">
                                <h2 className="text-lg font-medium">Active Campaigns</h2>
                                <button 
                                    onClick={openNewProject}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition"
                                >
                                    <Plus size={16} /> New Campaign
                                </button>
                            </div>
                        )}
                        
                        {/* Scrollable Table Container */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto overflow-x-auto custom-scrollbar flex-1 relative">
                            <table className="w-full text-left text-sm min-w-[800px]">
                                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10 shadow-lg">
                                    <tr>
                                        <th className="p-4 w-10 bg-slate-950">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer accent-emerald-500"
                                                checked={projects.length > 0 && selectedIds.size === projects.length}
                                                onChange={selectAll}
                                            />
                                        </th>
                                        <th className="p-4 font-medium bg-slate-950">Status</th>
                                        <th className="p-4 font-medium bg-slate-950">Project Name</th>
                                        <th className="p-4 font-medium bg-slate-950">Tier</th>
                                        <th className="p-4 font-medium text-right bg-slate-950">Verified</th>
                                        <th className="p-4 font-medium text-right bg-slate-950">LPM</th>
                                        <th className="p-4 font-medium bg-slate-950"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {projects.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-800/50 transition">
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox"
                                                    className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer accent-emerald-500"
                                                    checked={selectedIds.has(p.id)}
                                                    onChange={() => toggleSelection(p.id)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <button onClick={() => toggleProjectStatus(p.id)}>
                                                    {p.status === ProjectStatus.RUNNING ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                                                            <span className="relative flex h-2 w-2">
                                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                            RUNNING
                                                        </span>
                                                    ) : p.status === ProjectStatus.PAUSED ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                                                            <Pause size={10} fill="currentColor" />
                                                            PAUSED
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-400 border border-slate-600/50 text-xs font-semibold">
                                                            <Square size={10} fill="currentColor" />
                                                            STOPPED
                                                        </span>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-white">{p.name}</div>
                                                <div className="text-xs text-slate-500">{p.url}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${
                                                    p.tier === TierType.TIER_1 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                                                    p.tier === TierType.TIER_2 ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                                    'border-purple-500/30 text-purple-400 bg-purple-500/10'
                                                }`}>{p.tier}</span>
                                            </td>
                                            <td className="p-4 text-right font-mono">{p.verifiedLinks.toLocaleString()}</td>
                                            <td className="p-4 text-right font-mono text-emerald-400">{p.rpm}</td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => openEditProject(p)} className="text-slate-400 hover:text-white text-xs underline">Config</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Settings View */}
                {activeTab === 'settings' && (
                     <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Cpu className="text-amber-500" size={20}/> Hardware Acceleration
                            </h3>
                            
                            {/* Resource History Chart */}
                            <div className="h-64 flex flex-col mb-6">
                                <div className="flex justify-between items-center mb-2">
                                     <span className="text-sm text-slate-400">System Load History (CPU / RAM)</span>
                                </div>
                                <div className="flex-1 w-full min-h-0 relative bg-slate-950/50 rounded-lg border border-slate-800/50">
                                    <div className="absolute inset-0">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                            <AreaChart data={resourceData}>
                                                <defs>
                                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                                    </linearGradient>
                                                    <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="time" hide />
                                                <YAxis stroke="#475569" fontSize={10} domain={[0, 100]} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                                    itemStyle={{ fontSize: 12 }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="cpu" 
                                                    stroke="#f59e0b" 
                                                    fillOpacity={1} 
                                                    fill="url(#colorCpu)" 
                                                    isAnimationActive={false}
                                                    name="CPU %"
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="memory" 
                                                    stroke="#3b82f6" 
                                                    fillOpacity={1} 
                                                    fill="url(#colorMem)" 
                                                    isAnimationActive={false}
                                                    name="RAM %"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Max Threads</span>
                                        <span className="text-emerald-400">450</span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full w-3/4"></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>HTML Timeout (ms)</span>
                                        <span className="text-blue-400">30000</span>
                                    </div>
                                    <div className="w-full bg-slate-950 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full w-1/2"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Shield className="text-blue-500" size={20}/> CAPTCHA Services
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">2Captcha API Key</label>
                                    <input type="password" value="************************" readOnly className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-400" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Anti-Captcha Key</label>
                                    <input type="password" value="************************" readOnly className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-400" />
                                </div>
                                <div className="col-span-2 flex items-center gap-3 mt-2">
                                    <div className="w-10 h-5 bg-emerald-600 rounded-full relative cursor-pointer">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                    <span className="text-sm">Auto-Retry Failed Captchas (Max 3)</span>
                                </div>
                            </div>
                        </div>
                     </div>
                )}
            </div>

            {/* Right Column: Terminal */}
            <div className="lg:col-span-1 h-full flex flex-col gap-4">
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex-1 flex flex-col min-h-0">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <TerminalIcon size={14} /> Live Execution Log
                    </h3>
                    <div className="flex-1 min-h-0">
                        <Terminal logs={logs} onClear={clearLogs} />
                    </div>
                </div>

                {/* AI Status */}
                <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 rounded-xl p-4 border border-blue-500/20">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-500/10 rounded-lg">
                             <BotIcon />
                         </div>
                         <div>
                             <div className="text-sm font-bold text-blue-100">Gemini 2.5 Active</div>
                             <div className="text-xs text-blue-300/60">Content Generation Ready</div>
                         </div>
                     </div>
                </div>
            </div>

        </main>
      </div>

      <ProjectModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onSave={handleSaveProject} 
        existingProject={editingProject}
      />
    </div>
  );
};

const BotIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4Z" fill="currentColor" fillOpacity="0.2"/>
        <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z" fill="currentColor"/>
    </svg>
);

export default App;