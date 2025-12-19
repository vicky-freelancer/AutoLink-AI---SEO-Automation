import React, { useState } from 'react';
import { Project, ProjectStatus, TierType } from '../types';
import { X, Bot, Loader2, Save } from 'lucide-react';
import { generateSEOContent } from '../services/geminiService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  existingProject?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSave, existingProject }) => {
  const [name, setName] = useState(existingProject?.name || '');
  const [url, setUrl] = useState(existingProject?.url || '');
  const [tier, setTier] = useState<TierType>(existingProject?.tier || TierType.TIER_1);
  const [keywords, setKeywords] = useState(existingProject?.content?.keywords.join(', ') || '');
  const [contentTitle, setContentTitle] = useState(existingProject?.content?.title || '');
  const [contentBody, setContentBody] = useState(existingProject?.content?.body || '');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateContent = async () => {
    if (!keywords) return;
    setIsGenerating(true);
    try {
      const kwArray = keywords.split(',').map(k => k.trim());
      const result = await generateSEOContent(name || 'General', kwArray, 'informative');
      setContentTitle(result.title);
      setContentBody(result.body);
    } catch (e) {
      alert("Failed to generate content. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const newProject: Project = {
      id: existingProject?.id || Math.random().toString(36).substr(2, 9),
      name,
      url,
      tier,
      status: ProjectStatus.STOPPED,
      verifiedLinks: existingProject?.verifiedLinks || 0,
      submittedLinks: existingProject?.submittedLinks || 0,
      rpm: 0,
      engines: ['WordPress', 'Wiki', 'Forum'],
      content: {
        title: contentTitle,
        body: contentBody,
        keywords: keywords.split(',').map(k => k.trim())
      }
    };
    onSave(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-xl">
          <h2 className="text-lg font-semibold text-white">
            {existingProject ? 'Configure Project' : 'New Campaign'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-emerald-400 text-sm font-bold uppercase tracking-wider">Targeting</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                  placeholder="e.g. Money Site Boost"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Target URL</label>
                <input 
                  type="text" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" 
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tier Level</label>
              <select 
                value={tier} 
                onChange={(e) => setTier(e.target.value as TierType)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                {Object.values(TierType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Content Engine */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
               <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider">Content Engine</h3>
               <span className="text-xs text-slate-500">Powered by Gemini 2.5 Flash</span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Target Keywords (comma separated)</label>
              <input 
                type="text" 
                value={keywords} 
                onChange={e => setKeywords(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" 
                placeholder="seo, backlinks, digital marketing"
              />
            </div>

            <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 relative group">
              <button 
                onClick={handleGenerateContent}
                disabled={isGenerating || !keywords}
                className="absolute top-2 right-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                Generate with AI
              </button>
              
              <div className="space-y-3 mt-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Generated Title</label>
                    <input 
                      type="text" 
                      value={contentTitle} 
                      onChange={e => setContentTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Generated Body (Spinnable)</label>
                    <textarea 
                      value={contentBody} 
                      onChange={e => setContentBody(e.target.value)}
                      rows={6}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-slate-200 outline-none resize-none font-mono"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded text-sm font-medium text-slate-300 hover:text-white transition">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-2">
            <Save size={16} /> Save Campaign
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;