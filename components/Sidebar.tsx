
import React, { useState } from 'react';
import { Plus, MessageSquare, Calendar, CheckSquare, FileText, Settings, Layers, X, GripVertical } from 'lucide-react';
import { Room, RoomType } from '../types';
import { Logo } from '../constants';

interface SidebarProps {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (id: string) => void;
  onConnectFunctions: () => void;
  onOpenSettings: () => void;
  onReorderRooms: (newRooms: Room[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  rooms, 
  activeRoomId, 
  onSelectRoom, 
  onConnectFunctions, 
  onOpenSettings,
  onReorderRooms,
  isOpen,
  onToggle
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getIcon = (type: RoomType) => {
    switch (type) {
      case RoomType.CHAT: return <MessageSquare size={18} />;
      case RoomType.KALANDER: return <Calendar size={18} />;
      case RoomType.TODO: return <CheckSquare size={18} />;
      case RoomType.PROJECT: return <FileText size={18} />;
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Visual feedback for ghost image
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newRooms = [...rooms];
    const draggedItem = newRooms[draggedIndex];
    newRooms.splice(draggedIndex, 1);
    newRooms.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    onReorderRooms(newRooms);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0d101b]/95 backdrop-blur-3xl border-r border-white/5 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full safe-pt safe-pb">
        
        {/* Header with Logo and Close (Mobile Only) */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8" />
            <span className="font-tech font-bold text-xl tracking-tight text-white uppercase">AI Wire</span>
          </div>
          <button 
            onClick={onToggle}
            className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Deploy Button */}
        <div className="px-6 pb-6">
            <button 
              onClick={onConnectFunctions}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white font-tech font-bold py-4 px-4 rounded-2xl transition-all shadow-xl shadow-purple-900/20 active:scale-[0.98]"
            >
              <Plus size={20} />
              <span className="uppercase tracking-widest text-xs">Deploy Agent</span>
            </button>
        </div>

        {/* Scrollable Node List */}
        <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 mb-4 opacity-50">
              <Layers size={12} className="text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">Neural Segments</span>
            </div>
            
            <div className="space-y-1">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className={`group relative flex items-center gap-1 transition-all rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing ${
                    draggedIndex === index ? 'opacity-50 scale-95' : ''
                  }`}
                >
                   {/* Reorder Grip Indicator (Visible on hover) */}
                  <div className="absolute left-1 opacity-0 group-hover:opacity-40 text-slate-400 transition-opacity z-10 pointer-events-none">
                    <GripVertical size={14} />
                  </div>

                  <button
                    onClick={() => onSelectRoom(room.id)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all relative ${
                      activeRoomId === room.id 
                      ? 'bg-purple-600/15 text-white border border-purple-500/20 shadow-lg' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    {activeRoomId === room.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-r-full shadow-lg shadow-purple-500/50"></div>
                    )}
                    <div className={`flex-shrink-0 ${activeRoomId === room.id ? 'text-purple-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                      {room.icon ? (
                        <img src={room.icon} className="w-5 h-5 rounded-md object-cover" />
                      ) : (
                        getIcon(room.type)
                      )}
                    </div>
                    <span className="font-semibold text-sm truncate tracking-tight">{room.name}</span>
                  </button>
                </div>
              ))}

              {rooms.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center opacity-20">
                   <div className="w-12 h-12 border-2 border-dashed border-slate-500 rounded-2xl flex items-center justify-center mb-2">
                      <Plus size={16} />
                   </div>
                   <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting Nodes</p>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto">
            <button 
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group active:scale-[0.98]"
            >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-purple-400 transition-colors">
                    <Settings size={20} />
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-white uppercase tracking-tight">Core Settings</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Protocol V3.1.2</p>
                </div>
            </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
