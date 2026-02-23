
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings as SettingsIcon, Upload, FileText, Edit3, Maximize2, HelpCircle, ExternalLink, Trash2, Clock } from 'lucide-react';
import { Room, RoomType, ProjectPost } from './types';
import { Logo } from './constants';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';
import ChatRoom from './components/ChatRoom';
import CalendarRoom from './components/CalendarRoom';
import TodoRoom from './components/TodoRoom';
import ProjectRoom from './components/ProjectRoom';

const App: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  
  // Blueprint Engine State
  const [editingPost, setEditingPost] = useState<ProjectPost | null>(null);
  const [isRenderPoppedOut, setIsRenderPoppedOut] = useState(false);
  const [showCodex, setShowCodex] = useState(false);

  // Window Physics (Pickup & Drop)
  const [editorPos, setEditorPos] = useState({ x: 100, y: 80 });
  const [editorSize, setEditorSize] = useState({ width: 550, height: 650 });
  const [isEditorFollowing, setIsEditorFollowing] = useState(false);
  const [isEditorResizing, setIsEditorResizing] = useState(false);

  const [renderPos, setRenderPos] = useState({ x: 700, y: 80 });
  const [renderSize, setRenderSize] = useState({ width: 450, height: 650 });
  const [isRenderFollowing, setIsRenderFollowing] = useState(false);
  const [isRenderResizing, setIsRenderResizing] = useState(false);

  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Wiki Hover State
  const [hoverImage, setHoverImage] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Modal State
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);

  // Global Movement Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isEditorFollowing) {
        setEditorPos({ x: e.clientX - 100, y: e.clientY - 20 });
      }
      if (isRenderFollowing) {
        setRenderPos({ x: e.clientX - 100, y: e.clientY - 20 });
      }
      if (isEditorResizing) {
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;
        setEditorSize({
          width: Math.max(400, resizeStartRef.current.w + dx),
          height: Math.max(300, resizeStartRef.current.h + dy)
        });
      }
      if (isRenderResizing) {
        const dx = e.clientX - resizeStartRef.current.x;
        const dy = e.clientY - resizeStartRef.current.y;
        setRenderSize({
          width: Math.max(300, resizeStartRef.current.w + dx),
          height: Math.max(300, resizeStartRef.current.h + dy)
        });
      }
    };

    const handleMouseUp = () => {
      setIsEditorResizing(false);
      setIsRenderResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isEditorFollowing, isRenderFollowing, isEditorResizing, isRenderResizing]);

  const handleConnectRoom = (type: RoomType) => {
    const id = Date.now().toString();
    const newRoom: Room = {
      id,
      type,
      name: type === RoomType.CHAT ? 'Neural Link' : 
            type === RoomType.KALANDER ? 'Temporal Node' :
            type === RoomType.TODO ? 'Action Registry' : 'Project Blueprint',
      messages: [],
      calendarEntries: [],
      todoItems: [],
      projectPosts: []
    };
    setRooms([...rooms, newRoom]);
    setActiveRoomId(id);
    setIsConnectOpen(false);
  };

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  const updateActiveRoom = (updated: Room) => {
    setRooms(rooms.map(r => r.id === updated.id ? updated : r));
  };

  const saveBlueprintChanges = () => {
    if (!editingPost) return;
    const targetRoom = rooms.find(r => r.projectPosts?.some(p => p.id === editingPost.id));
    if (targetRoom) {
      const updatedPosts = targetRoom.projectPosts?.map(p => p.id === editingPost.id ? editingPost : p);
      updateActiveRoom({ ...targetRoom, projectPosts: updatedPosts });
    }
    setEditingPost(null);
    setIsRenderPoppedOut(false);
    setIsEditorFollowing(false);
    setIsRenderFollowing(false);
  };

  const renderRichText = (text: string, images: string[] = []) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;
      let className = "text-sm text-slate-300 mb-1 leading-relaxed";

      if (line.startsWith('+++ ')) {
        content = line.replace('+++ ', '');
        className = "text-5xl font-black text-white mt-8 mb-4 tracking-tighter uppercase font-tech";
      } else if (line.startsWith('++ ')) {
        content = line.replace('++ ', '');
        className = "text-2xl font-bold text-indigo-400 mt-5 mb-2 tracking-tight";
      } else if (line.startsWith('+ ')) {
        content = line.replace('+ ', '');
        className = "text-lg font-semibold text-slate-200 mt-3 mb-1";
      } else if (line.startsWith('- ')) {
        content = line.replace('- ', '');
        className = "text-xs text-slate-500 italic mb-1 opacity-70";
      }

      const parts = String(content).split(/(\[\[.*?\]\])/g);
      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const inner = part.slice(2, -2);
          const [displayText, link] = inner.split('|');
          let imageUrl = link;
          if (!isNaN(Number(link)) && images[Number(link)]) {
            imageUrl = images[Number(link)];
          }
          return (
            <span 
              key={pIdx}
              className="text-indigo-400 underline decoration-indigo-500/30 underline-offset-4 cursor-help font-bold"
              onMouseEnter={(e) => {
                setHoverImage(imageUrl);
                setHoverPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoverImage(null)}
            >
              {displayText}
            </span>
          );
        }
        return part;
      });

      return <div key={idx} className={className}>{parsedParts}</div>;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0b14] text-slate-200">
      <Sidebar 
        rooms={rooms} 
        activeRoomId={activeRoomId} 
        onSelectRoom={id => { setActiveRoomId(id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
        onConnectFunctions={() => setIsConnectOpen(true)}
        onOpenSettings={() => setIsGlobalSettingsOpen(true)}
        onReorderRooms={setRooms}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`relative flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && window.innerWidth >= 1024 ? 'pl-72' : 'pl-0'}`}>
        <div className="lg:hidden absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 safe-pt">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-[#111422]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
            <Menu size={22} className="text-purple-400" />
          </button>
        </div>

        {activeRoom ? (
          <div className="flex-1 h-full overflow-hidden">
            {activeRoom.type === RoomType.CHAT && <ChatRoom room={activeRoom} onUpdateRoom={updateActiveRoom} onOpenSettings={() => {}} />}
            {activeRoom.type === RoomType.KALANDER && <CalendarRoom room={activeRoom} onUpdateRoom={updateActiveRoom} />}
            {activeRoom.type === RoomType.TODO && <TodoRoom room={activeRoom} onUpdateRoom={updateActiveRoom} onOpenSettings={() => {}} />}
            {activeRoom.type === RoomType.PROJECT && <ProjectRoom room={activeRoom} onUpdateRoom={updateActiveRoom} onOpenSettings={() => {}} onEditPost={setEditingPost} />}
          </div>
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center p-8">
            <Logo className="w-32 h-32 md:w-48 md:h-48 animate-subtle-pulse" />
            <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tighter uppercase font-tech text-white drop-shadow-2xl">AI wire</h1>
          </div>
        )}

        {/* --- BLUEPRINT EDITOR WINDOW (PICKUP/DROP) --- */}
        {editingPost && (
          <div 
            className={`fixed z-[100] bg-[#111422] border border-white/10 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ${isEditorFollowing ? 'ring-2 ring-indigo-500 shadow-indigo-500/30 scale-[1.02]' : ''}`}
            style={{ 
              left: `${editorPos.x}px`, 
              top: `${editorPos.y}px`, 
              width: `${editorSize.width}px`, 
              height: `${editorSize.height}px`,
              transition: (isEditorFollowing || isEditorResizing) ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Header: One-click pickup/drop */}
            <div 
              onClick={() => setIsEditorFollowing(!isEditorFollowing)}
              className={`flex items-center justify-between px-6 py-4 border-b border-white/5 cursor-pointer select-none transition-colors ${isEditorFollowing ? 'bg-indigo-600' : 'bg-[#1a1d2e]'}`}
            >
              <div className="flex items-center gap-3">
                <Edit3 size={16} className="text-white" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                  {isEditorFollowing ? 'TRANSPORTING UNIT...' : 'EDITOR TERMINAL'}
                </span>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <button 
                  onMouseEnter={() => setShowCodex(true)} 
                  onMouseLeave={() => setShowCodex(false)} 
                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
                >
                  <HelpCircle size={16} />
                </button>
                <button 
                  onClick={() => setIsRenderPoppedOut(!isRenderPoppedOut)} 
                  className={`p-2 rounded-lg transition-all ${isRenderPoppedOut ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-white/10 text-slate-400'}`}
                  title="Pop out Live Render"
                >
                  <ExternalLink size={16} />
                </button>
                <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
               {/* Asset Registry Sidebar */}
               <div className="w-20 bg-black/20 border-r border-white/5 p-2 overflow-y-auto custom-scrollbar space-y-2">
                  {editingPost.imageUrls?.map((url, i) => (
                    <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-white/5 shadow-inner">
                       <img src={url} className="w-full h-full object-cover" />
                       <div className="absolute top-0.5 right-0.5 bg-black/80 px-1 rounded text-[7px] font-bold text-white z-10 border border-white/10 shadow-lg">#{i}</div>
                       <button 
                         onClick={() => setEditingPost({...editingPost, imageUrls: editingPost.imageUrls?.filter((_, idx) => idx !== i)})} 
                         className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                       >
                         <Trash2 size={12} className="text-white" />
                       </button>
                    </div>
                  ))}
                  <div 
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files) {
                                Array.from(files).forEach(file => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setEditingPost(prev => prev ? {...prev, imageUrls: [...(prev.imageUrls || []), reader.result as string]} : null);
                                    };
                                    reader.readAsDataURL(file);
                                });
                            }
                        };
                        input.click();
                    }}
                    className="aspect-square border border-dashed border-white/10 rounded-lg flex items-center justify-center text-slate-700 hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                     <Upload size={14} />
                  </div>
               </div>

               {/* Editor Workspace */}
               <div className="flex-1 flex flex-col p-6 bg-[#0d0f1b] overflow-hidden">
                  <input 
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full bg-transparent border-none outline-none text-2xl font-black text-white mb-4 placeholder-slate-800 tracking-tight"
                  />
                  <textarea 
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    className="w-full h-full bg-black/30 border border-white/5 rounded-2xl p-6 text-slate-300 text-sm leading-relaxed resize-none focus:outline-none focus:border-indigo-500/30 transition-all custom-scrollbar font-mono"
                    placeholder="+++ TITLE_NODE\n[[PART_NAME|0]]"
                  />
                  {!isRenderPoppedOut && (
                    <div className="mt-6 border-t border-white/5 pt-6 overflow-y-auto max-h-[30%] opacity-40 hover:opacity-100 transition-opacity">
                       {renderRichText(editingPost.content, editingPost.imageUrls)}
                    </div>
                  )}
               </div>
            </div>

            {/* Resizer */}
            <div 
              onMouseDown={(e) => {
                setIsEditorResizing(true);
                resizeStartRef.current = { x: e.clientX, y: e.clientY, w: editorSize.width, h: editorSize.height };
                e.preventDefault();
              }}
              className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-center justify-center text-slate-800"
            >
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/20 mb-1 mr-1"></div>
            </div>

            <div className="p-4 bg-[#1a1d2e]/50 border-t border-white/5 flex items-center justify-between shrink-0">
               <span className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em]">Protocol OS v4.1</span>
               <button onClick={saveBlueprintChanges} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/20">Sync Blueprint</button>
            </div>

            {/* COMMAND CODEX OVERLAY */}
            {showCodex && (
              <div className="absolute inset-x-6 top-16 bottom-16 bg-[#1a1d2e]/98 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 z-[110] shadow-2xl animate-in fade-in slide-in-from-top-4 border-indigo-500/20">
                 <h4 className="text-lg font-black text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
                        <HelpCircle size={20} className="text-indigo-400" />
                    </div>
                    Command Codex
                 </h4>
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">Typographic Prefixes</div>
                        <div className="flex gap-4 items-center group">
                           <code className="text-indigo-400 bg-black/40 px-2.5 py-1 rounded-md text-xs font-mono">+++</code>
                           <span className="text-xs text-slate-400 font-bold">Colossal System Header</span>
                        </div>
                        <div className="flex gap-4 items-center group">
                           <code className="text-indigo-400 bg-black/40 px-2.5 py-1 rounded-md text-xs font-mono">++</code>
                           <span className="text-xs text-slate-400 font-bold">Command Sub-Header</span>
                        </div>
                        <div className="flex gap-4 items-center group">
                           <code className="text-indigo-400 bg-black/40 px-2.5 py-1 rounded-md text-xs font-mono">+</code>
                           <span className="text-xs text-slate-400 font-bold">Standard Section</span>
                        </div>
                        <div className="flex gap-4 items-center group">
                           <code className="text-indigo-400 bg-black/40 px-2.5 py-1 rounded-md text-xs font-mono">-</code>
                           <span className="text-xs text-slate-400 italic">Meta/Sub-script Note</span>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">Neural Asset Linking</div>
                        <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                            <code className="text-emerald-400 text-xs font-mono">[[Label|Index]]</code>
                            <p className="text-[11px] text-slate-400 leading-relaxed mt-3 font-medium">
                               Creates a hover-link in the Render view. Set Index to the ID shown on your sidebar assets (e.g. #0).
                            </p>
                        </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* --- DETACHED RENDER DISPLAY (PICKUP/DROP) --- */}
        {editingPost && isRenderPoppedOut && (
          <div 
            className={`fixed z-[101] bg-[#0d101b] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden ${isRenderFollowing ? 'ring-2 ring-emerald-500 scale-[1.01] shadow-emerald-500/20 cursor-move' : ''}`}
            style={{ 
              left: `${renderPos.x}px`, 
              top: `${renderPos.y}px`, 
              width: `${renderSize.width}px`, 
              height: `${renderSize.height}px`,
              transition: (isRenderFollowing || isRenderResizing) ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div 
              onClick={() => setIsRenderFollowing(!isRenderFollowing)}
              className={`flex items-center justify-between px-6 py-3 border-b border-white/5 select-none transition-colors cursor-pointer ${isRenderFollowing ? 'bg-emerald-600' : 'bg-[#1a1d2e]'}`}
            >
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white tracking-widest">
                <Clock size={12} /> {isRenderFollowing ? 'LOCATING...' : 'LIVE RENDER DISPLAY'}
              </div>
              <button onClick={() => setIsRenderPoppedOut(false)} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white">
                <Maximize2 size={12} />
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                {renderRichText(editingPost.content, editingPost.imageUrls)}
            </div>
            {/* Resizer */}
            <div 
              onMouseDown={(e) => {
                setIsRenderResizing(true);
                resizeStartRef.current = { x: e.clientX, y: e.clientY, w: renderSize.width, h: renderSize.height };
                e.preventDefault();
              }}
              className="absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize flex items-center justify-center text-slate-800"
            >
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 mb-1 mr-1"></div>
            </div>
          </div>
        )}

        {/* --- WIKI-HOVER PORTAL --- */}
        {hoverImage && (
          <div 
            className="fixed z-[300] pointer-events-none animate-in fade-in zoom-in duration-300"
            style={{ left: hoverPos.x + 25, top: hoverPos.y - 140 }}
          >
            <div className="bg-[#111422] border border-indigo-500/50 p-2 rounded-2xl shadow-[0_0_60px_rgba(79,70,229,0.5)] w-80 overflow-hidden ring-1 ring-white/10">
               <img src={hoverImage} className="w-full h-48 object-cover rounded-xl" alt="Preview" />
               <div className="mt-3 text-[9px] text-center font-black text-slate-500 uppercase tracking-[0.4em] px-2 pb-1">
                  Asset Reference Link Active
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Protocol Selection Modal */}
      <Modal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} title="Select Protocol">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleConnectRoom(RoomType.CHAT)} className="group flex flex-col items-center gap-6 p-8 rounded-3xl bg-[#1a1d2e] border border-white/5 hover:bg-purple-600/20 hover:border-purple-500/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl group-active:scale-90 transition-transform">
              <Logo className="w-8 h-8 text-white" />
            </div>
            <p className="font-tech font-black text-sm uppercase tracking-widest text-white">Chat</p>
          </button>
          <button onClick={() => handleConnectRoom(RoomType.PROJECT)} className="group flex flex-col items-center gap-6 p-8 rounded-3xl bg-[#1a1d2e] border border-white/5 hover:bg-amber-600/20 hover:border-amber-500/30 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-600 flex items-center justify-center shadow-xl group-active:scale-90 transition-transform">
              <FileText size={28} className="text-white" />
            </div>
            <p className="font-tech font-black text-sm uppercase tracking-widest text-white">Project</p>
          </button>
        </div>
      </Modal>

      <Modal isOpen={isGlobalSettingsOpen} onClose={() => setIsGlobalSettingsOpen(false)} title="System Core">
         <div className="flex flex-col items-center gap-6 py-6 text-center">
            <Logo className="w-20 h-20" />
            <div>
               <h3 className="text-xl font-tech font-black uppercase text-white tracking-tighter">AI wire v4.1</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Neural Interface Protocol</p>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default App;
