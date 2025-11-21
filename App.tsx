import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Eye, Code, MessageSquare, LayoutDashboard, CheckCircle, Layers, Bot, X } from 'lucide-react';
import { INITIAL_GROUPS } from './constants';
import { TestCase, TestGroup, Stats, CaseStatus, ModalType, ViewerData } from './types';
import { UploadModal, ViewerModal, DeleteModal } from './components/Modals';

// --- Components (Inline for simplicity given "handful of files" constraint, but cleanly separated) ---

const StatCard: React.FC<{ label: string; value: number; type: 'total' | 'success' | 'groups' }> = ({ label, value, type }) => {
  const colorMap = {
    total: 'border-l-indigo-500',
    success: 'border-l-emerald-500',
    groups: 'border-l-amber-500',
  };

  return (
    <div className={`bg-[#1e293b] border border-slate-700 rounded-xl p-6 flex flex-col items-center relative overflow-hidden ${colorMap[type]} border-l-4 shadow-lg`}>
      <span className="text-4xl font-bold text-slate-100 mb-1">{value}</span>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
};

function App() {
  const [groups, setGroups] = useState<TestGroup[]>(INITIAL_GROUPS);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [viewerData, setViewerData] = useState<ViewerData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'group' | 'case'; groupId: string; caseId?: string } | null>(null);
  // Updated default avatar to a cat image
  const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/bottts/svg?seed=GeminiProV3");

  // --- Stats Calculation ---
  const stats: Stats = useMemo(() => {
    let total = 0;
    let success = 0;
    groups.forEach(g => {
      total += g.cases.length;
      success += g.cases.filter(c => c.status === CaseStatus.Success).length;
    });
    return { total, success, groups: groups.length };
  }, [groups]);

  // --- Actions ---
  const handleAddGroup = () => {
    const newGroup: TestGroup = {
      id: `g-${Date.now()}`,
      title: 'New Test Group',
      cases: []
    };
    setGroups([...groups, newGroup]);
  };

  const handleAddCase = (title: string, prompt: string, code: string, html: string, status: CaseStatus) => {
    if (groups.length === 0) return alert("Please create a group first.");
    
    const newCase: TestCase = {
      id: `c-${Date.now()}`,
      title,
      prompt,
      code,
      previewHtml: html,
      status
    };

    // Add to the first group by default for this demo
    const newGroups = [...groups];
    newGroups[0].cases.push(newCase);
    setGroups(newGroups);
  };

  const initiateDelete = (type: 'group' | 'case', groupId: string, caseId?: string) => {
    setDeleteTarget({ type, groupId, caseId });
    setActiveModal('delete');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    if (deleteTarget.type === 'group') {
        setGroups(groups.filter(g => g.id !== deleteTarget.groupId));
    } else if (deleteTarget.caseId) {
        setGroups(groups.map(g => {
            if (g.id === deleteTarget.groupId) {
                return { ...g, cases: g.cases.filter(c => c.id !== deleteTarget.caseId) };
            }
            return g;
        }));
    }
    setActiveModal(null);
    setDeleteTarget(null);
  };

  const openViewer = (type: 'code' | 'preview' | 'prompt', title: string, content: string) => {
    setViewerData({ type, title, content });
    setActiveModal('viewer');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- Drag and Drop (Simple HTML5 Implementation) ---
  const handleDragStart = (e: React.DragEvent, caseId: string, sourceGroupId: string) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ caseId, sourceGroupId }));
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;
    
    try {
        const { caseId, sourceGroupId } = JSON.parse(data);
        if (sourceGroupId === targetGroupId) return;

        // Move logic
        const sourceGroupIndex = groups.findIndex(g => g.id === sourceGroupId);
        const targetGroupIndex = groups.findIndex(g => g.id === targetGroupId);
        
        if (sourceGroupIndex === -1 || targetGroupIndex === -1) return;

        const newGroups = [...groups];
        const caseToMove = newGroups[sourceGroupIndex].cases.find(c => c.id === caseId);
        
        if (caseToMove) {
            newGroups[sourceGroupIndex].cases = newGroups[sourceGroupIndex].cases.filter(c => c.id !== caseId);
            newGroups[targetGroupIndex].cases.push(caseToMove);
            setGroups(newGroups);
        }

    } catch (err) {
        console.error("Drop failed", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto pt-10 pb-8 px-4 text-center">
        <div className="relative w-24 h-24 mx-auto mb-6 rounded-full border-4 border-indigo-500 overflow-hidden group cursor-pointer shadow-2xl shadow-indigo-500/20">
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
             Change
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAvatarChange} accept="image/*" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2 tracking-tight">
          Gemini 3.0 Pro Report
        </h1>
        <p className="text-slate-400 text-lg border-b-2 border-indigo-500 inline-block pb-1 mb-8">
          net flying AI group
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
             <div className="bg-[#1e293b] border border-slate-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm text-slate-300">
                <span>📅</span> <input type="text" defaultValue="2025-11-20" className="bg-transparent border-none focus:outline-none w-24 text-center"/>
             </div>
             <div className="bg-[#1e293b] border border-slate-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm text-slate-300">
                <span>🤖</span> <span className="text-indigo-400 font-mono">gemini-3-pro-preview</span>
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <StatCard label="Total Cases" value={stats.total} type="total" />
          <StatCard label="Success" value={stats.success} type="success" />
          <StatCard label="Groups" value={stats.groups} type="groups" />
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 mb-6 flex justify-end gap-3">
        <button 
          onClick={handleAddGroup}
          className="px-4 py-2 rounded-lg border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white transition flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> New Group
        </button>
        <button 
          onClick={() => setActiveModal('upload')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-500/20"
        >
          <Bot size={16} /> Add Test Case
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {groups.map((group) => (
          <div 
            key={group.id} 
            className="bg-[#151e2d] border border-slate-700 rounded-xl overflow-hidden transition-all"
            onDrop={(e) => handleDrop(e, group.id)}
            onDragOver={handleDragOver}
          >
            <div className="bg-white/5 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <input 
                defaultValue={group.title}
                className="bg-transparent text-lg font-semibold text-slate-100 focus:outline-none focus:border-b border-indigo-500 px-1"
              />
              <button 
                onClick={() => initiateDelete('group', group.id)}
                className="text-slate-500 hover:text-red-400 transition p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="p-6 min-h-[120px] flex flex-wrap gap-4">
               {group.cases.length === 0 && (
                 <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm italic pointer-events-none">
                   Drag items here or add new cases
                 </div>
               )}
               {group.cases.map((testCase) => (
                 <div 
                   key={testCase.id}
                   draggable
                   onDragStart={(e) => handleDragStart(e, testCase.id, group.id)}
                   className="group/card w-72 bg-[#1e293b] border border-slate-700 rounded-lg p-4 relative hover:-translate-y-1 hover:shadow-xl hover:border-indigo-500/50 transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col"
                 >
                   {/* Status Badge */}
                   <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${testCase.status === CaseStatus.Success ? 'bg-emerald-500 shadow-emerald-500' : 'bg-red-500 shadow-red-500'}`} />
                   
                   <h4 className="font-semibold text-slate-200 mb-4 pr-6 truncate" title={testCase.title}>
                     {testCase.title}
                   </h4>

                   <div className="mt-auto grid grid-cols-4 gap-2">
                      <button 
                        onClick={() => openViewer('code', testCase.title, testCase.code)}
                        className="bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white py-1.5 rounded text-xs font-medium transition flex justify-center items-center" title="View Code"
                      >
                        <Code size={14} />
                      </button>
                      <button 
                        onClick={() => openViewer('prompt', testCase.title, testCase.prompt)}
                        className="bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white py-1.5 rounded text-xs font-medium transition flex justify-center items-center" title="View Prompt"
                      >
                        <MessageSquare size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          if (testCase.previewHtml.startsWith('http')) {
                            window.open(testCase.previewHtml, '_blank');
                          } else {
                            openViewer('preview', testCase.title, testCase.previewHtml);
                          }
                        }}
                        className="bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white py-1.5 rounded text-xs font-medium transition flex justify-center items-center" title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => initiateDelete('case', group.id, testCase.id)}
                        className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white py-1.5 rounded text-xs font-medium transition flex justify-center items-center"
                      >
                        <X size={14} />
                      </button>
                   </div>

                   {/* Hidden Data Inputs as requested by user prompt logic, though state handles it in React, we render this to honor the 'structure' request in spirit or for debugging */}
                   <div className="hidden">
                      <input type="hidden" className="d-code" value={testCase.code} />
                      <input type="hidden" className="d-preview" value={testCase.previewHtml} />
                   </div>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <UploadModal 
        isOpen={activeModal === 'upload'} 
        onClose={() => setActiveModal(null)} 
        onSubmit={handleAddCase} 
      />
      <ViewerModal 
        isOpen={activeModal === 'viewer'} 
        onClose={() => setActiveModal(null)} 
        data={viewerData} 
      />
      <DeleteModal 
        isOpen={activeModal === 'delete'}
        onClose={() => setActiveModal(null)}
        onConfirm={confirmDelete}
        isGroup={deleteTarget?.type === 'group'}
      />
    </div>
  );
}

export default App;