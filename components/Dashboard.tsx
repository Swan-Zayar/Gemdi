
import React, { useRef, useState } from 'react';
import { StudySession } from '../types';

interface DashboardProps {
  sessions: StudySession[];
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newName: string) => void;
  neuralInsight: string;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, onUpload, onOpenSession, onDeleteSession, onRenameSession, neuralInsight }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEditing = (e: React.MouseEvent, session: StudySession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingName(session.sessionName || session.fileName);
  };

  const saveEdit = (sessionId: string) => {
    if (editingName.trim()) {
      onRenameSession(sessionId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-fadeIn py-4 px-1 sm:px-2">
      <div className="relative group">
        <div className="bg-slate-900 dark:bg-black rounded-4xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden shadow-2xl transition-all duration-700">
          <div className="relative z-10 max-w-xl text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-indigo-300 text-[9px] font-black uppercase tracking-[0.15em] mb-4 sm:mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]"></span>
              Powered By Gemini
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-[1.1] sm:leading-[0.9]">
              Learn with <br /><span className="text-indigo-500">New Depth.</span>
            </h2>
          

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 mt-8">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto relative bg-indigo-600 text-white px-6 sm:px-8 py-4 rounded-xl sm:rounded-2xl font-black hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-3 chic-shadow text-sm sm:text-base active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                Drop Study Material
              </button>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] sm:text-[10px] font-black text-indigo-300 uppercase tracking-widest">
                PDF or DOCX only
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={onUpload} 
              className="hidden" 
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            />
          </div>
          
          <div className="absolute top-0 right-0 h-full w-1/4 pointer-events-none hidden lg:block overflow-hidden">
             <div className="absolute top-1/2 right-4 w-48 h-48 border-20 border-white/5 rounded-[3rem] rotate-45"></div>
          </div>
        </div>
      </div>

      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 px-2 sm:px-4 gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Study Vault</h3>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] sm:text-xs mt-0.5">Architectural knowledge assets</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 chic-shadow text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
            {sessions.length} sessions
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/20 rounded-4xl sm:rounded-[2.5rem] p-10 sm:p-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 chic-shadow mx-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <p className="text-slate-900 dark:text-slate-100 text-lg sm:text-xl font-black mb-1">Vault is empty</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs sm:text-sm font-bold">Start by processing a document.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={`group relative p-5 sm:p-6 rounded-2xl sm:rounded-4xl border transition-all md:tilt-card chic-shadow cursor-pointer flex flex-col min-h-50 sm:min-h-62.5 ${session.drillCompleted ? 'bg-indigo-50/30 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                onClick={() => onOpenSession(session)}
              >
                <div className="mb-auto">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${session.drillCompleted ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.isPotentiallyInvalid && (
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400" title="AI found this document unusual for study material.">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  {editingId === session.id ? (
                    <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(session.id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="flex-1 font-black text-lg sm:text-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50 px-2 py-1 rounded-lg border-2 border-indigo-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(session.id)}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-50 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight flex-1">
                        {session.sessionName || session.fileName}
                      </h4>
                      <button
                        onClick={(e) => startEditing(e, session)}
                        className="p-1 text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all opacity-0 group-hover:opacity-100"
                        title="Rename session"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] sm:text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-900/30 px-1.5 sm:px-2 py-0.5 rounded-full">{session.fileType.split('/')[1]?.toUpperCase() || 'DOC'}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500">{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="w-full flex items-center justify-between py-3 sm:py-4 border-t border-slate-50 dark:border-slate-700 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-all mt-4 sm:mt-6">
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] sm:text-[11px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest">Enter Roadmap</span>
                    {session.studyPlan && session.studyPlan.steps.length > 0 && (
                      <div className="mt-2 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[7px] sm:text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress</span>
                          <span className="text-[8px] sm:text-[9px] font-black text-indigo-600 dark:text-indigo-400">
                            {Math.round(((session.completedSteps?.length || 0) / session.studyPlan.steps.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all duration-500"
                            style={{ width: `${((session.completedSteps?.length || 0) / session.studyPlan.steps.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all group-hover:translate-x-1 ml-4 shrink-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
