import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Check, AlertTriangle, FileCode, Eye, FileText } from 'lucide-react';
import { CaseStatus, ViewerData } from '../types';

// --- Content Viewer Modal ---
interface ViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ViewerData | null;
}

export const ViewerModal: React.FC<ViewerModalProps> = ({ isOpen, onClose, data }) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (data?.type === 'preview' && data.content) {
      const blob = new Blob([data.content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setIframeUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setIframeUrl(null);
    }
  }, [data]);

  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] border border-slate-700 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
             {data.type === 'code' ? <FileCode className="text-indigo-400" /> : 
              data.type === 'preview' ? <Eye className="text-green-400" /> : 
              <FileText className="text-orange-400" />}
            <h3 className="text-lg font-semibold text-slate-100">{data.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden relative bg-[#0d1117]">
          {data.type === 'preview' && iframeUrl ? (
            <iframe 
              src={iframeUrl} 
              className="w-full h-full border-none bg-white" 
              title="Preview"
            />
          ) : (
            <pre className="w-full h-full p-6 overflow-auto text-sm font-mono text-slate-300 leading-relaxed">
              {data.content}
            </pre>
          )}
        </div>
        
        <div className="p-3 border-t border-slate-700 bg-[#151e2d] text-xs text-slate-500 flex justify-between">
           <span>{data.content.length} chars</span>
           <span>Mode: {data.type.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

// --- Upload Modal ---
interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, prompt: string, code: string, html: string, status: CaseStatus) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [html, setHtml] = useState('');
  const [status, setStatus] = useState<CaseStatus>(CaseStatus.Success);
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        setHtml(content);
        // If code is empty, populate it with the full HTML content instead of a snippet
        if (!code) setCode(content); 
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = () => {
    if (!title) return alert('Title is required');
    onSubmit(title, prompt, code, html, status);
    // Reset
    setTitle('');
    setPrompt('');
    setCode('');
    setHtml('');
    setFileName('No file chosen');
    setStatus(CaseStatus.Success);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e293b] border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-slate-100">Upload Test Case</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Case Title *</label>
            <input 
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/20 border border-slate-600 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
              placeholder="e.g., Image Generation Test"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Prompt</label>
            <textarea 
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-black/20 border border-slate-600 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none h-20"
              placeholder="Enter the prompt used..."
            />
          </div>
          
           <div>
            <label className="block text-sm text-slate-400 mb-1">Code Snippet</label>
            <textarea 
              value={code} onChange={(e) => setCode(e.target.value)}
              className="w-full bg-black/20 border border-slate-600 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none h-20 font-mono text-xs"
              placeholder="Paste relevant code snippet..."
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">HTML Preview File</label>
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm text-white flex items-center gap-2 transition-colors"
                >
                    <Upload size={14} /> Choose HTML
                </button>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">{fileName}</span>
                <input 
                    type="file" 
                    accept=".html,.htm" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                />
            </div>
             <textarea 
              value={html} onChange={(e) => setHtml(e.target.value)}
              className="w-full mt-2 bg-black/20 border border-slate-600 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none h-24 font-mono text-xs"
              placeholder="Or paste full HTML here..."
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Status</label>
            <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value as CaseStatus)}
                className="w-full bg-black/20 border border-slate-600 rounded p-2 text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
                <option value={CaseStatus.Success}>✅ Success</option>
                <option value={CaseStatus.Fail}>❌ Fail</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
            <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors flex items-center gap-2">
                <Check size={16} /> Add Case
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Delete Confirm Modal ---
interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isGroup: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, isGroup }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-[#1e293b] border border-slate-700 rounded-xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <AlertTriangle size={28} />
                    <h3 className="text-xl font-bold">Confirm Deletion</h3>
                </div>
                <p className="text-slate-300 mb-6">
                    Are you sure you want to delete this {isGroup ? 'Group and all its cases' : 'Test Case'}? 
                    This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-slate-300 rounded transition-colors">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors">Delete</button>
                </div>
             </div>
        </div>
    )
}