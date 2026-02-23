
import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, Circle, ListTodo, MoreVertical, Zap, Activity, Target, Layout } from 'lucide-react';
import { Room, TodoItem } from '../types';
import Modal from './Modal';

interface TodoRoomProps {
  room: Room;
  onUpdateRoom: (room: Room) => void;
  onOpenSettings: () => void;
}

const TodoRoom: React.FC<TodoRoomProps> = ({ room, onUpdateRoom, onOpenSettings }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;

    setIsSyncing(true);
    
    // Simulate n8n relay sync delay
    setTimeout(() => {
      const newItem: TodoItem = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        priority: priority
      };

      onUpdateRoom({
        ...room,
        todoItems: [newItem, ...(room.todoItems || [])]
      });
      setNewTodo('');
      setIsSyncing(false);
      setIsAddModalOpen(false);
    }, 800);
  };

  const toggleTodo = (id: string) => {
    onUpdateRoom({
      ...room,
      todoItems: (room.todoItems || []).map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    });
  };

  const deleteTodo = (id: string) => {
    onUpdateRoom({
      ...room,
      todoItems: (room.todoItems || []).filter(item => item.id !== id)
    });
  };

  const filteredItems = (room.todoItems || []).filter(item => {
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  const priorityColors = {
    high: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
    medium: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
    low: 'text-blue-500 border-blue-500/20 bg-blue-500/5'
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0b14] safe-pt relative">
      
      {/* FIXED HUB: These controls stay locked at the top */}
      <div className="z-30 bg-[#0a0b14]/95 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <header className="px-6 py-4 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center border border-indigo-500/20">
              <ListTodo size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-sm font-tech font-black tracking-tighter uppercase text-white">Registry Gateway</h2>
          </div>
          <button onClick={onOpenSettings} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-500">
            <MoreVertical size={18} />
          </button>
        </header>

        <div className="flex flex-col items-center gap-8 pb-8 pt-4 px-6">
          {/* Main Action Hub */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="group relative flex items-center justify-center gap-6 w-full max-w-md py-7 rounded-[36px] bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-[1.01] transition-all duration-300 shadow-2xl shadow-indigo-900/50 active:scale-95 border border-white/10"
          >
            <div className="absolute -inset-1 bg-indigo-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md shrink-0">
               <Plus size={28} className="group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="text-left">
                <span className="block text-xl font-tech font-black uppercase tracking-[0.2em] text-white leading-none">New Protocol</span>
                <span className="text-[10px] font-bold text-indigo-200/50 uppercase tracking-widest mt-1.5">Initialize Node</span>
            </div>
          </button>

          {/* Segmented Grid Controls */}
          <div className="w-full max-w-sm p-1.5 bg-white/[0.03] border border-white/5 rounded-[24px] flex items-center gap-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f 
                  ? 'bg-white text-black shadow-xl shadow-black/40 scale-105 z-10' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SCROLLABLE GRID: The tasks flow beneath the fixed hub */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 custom-scrollbar scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-4 pb-32">
          
          <div className="flex items-center justify-between px-2 mb-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
               <Activity size={12} className="text-indigo-500" />
               <span>{(room.todoItems || []).filter(i => !i.completed).length} Nodes Pending</span>
            </div>
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full">
                <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Relay Sync Active</span>
            </div>
          </div>

          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className={`group relative flex items-center gap-4 p-6 rounded-[32px] bg-[#0d101b] border border-white/5 hover:border-white/10 transition-all shadow-xl active:scale-[0.99] ${item.completed ? 'opacity-30 grayscale' : ''}`}
            >
              <button 
                onClick={() => toggleTodo(item.id)}
                className={`shrink-0 transition-all active:scale-90 ${item.completed ? 'text-emerald-500' : 'text-slate-700 hover:text-indigo-400'}`}
              >
                {item.completed ? <CheckCircle size={28} /> : <Circle size={28} />}
              </button>

              <div className="flex-1 min-w-0">
                <span className={`text-lg font-semibold truncate block transition-all ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {item.text}
                </span>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.priority === 'high' ? 'bg-orange-500' : item.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.priority} Urgency</span>
                </div>
              </div>

              <button 
                onClick={() => deleteTodo(item.id)}
                className="p-3 text-slate-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center opacity-10">
              <div className="w-16 h-16 border-2 border-dashed border-white rounded-[32px] flex items-center justify-center mb-4">
                <ListTodo size={32} />
              </div>
              <span className="text-[10px] font-tech font-black uppercase tracking-[0.4em]">Grid Empty</span>
            </div>
          )}
        </div>
      </div>

      {/* CLEAN ACTION MODAL: No diagnostics, just focus and execution */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Initialize Node"
      >
        <div className="space-y-10 py-4">
          {/* Metadata Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Protocol Parameters</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Active Relay</span>
                </div>
            </div>
            <textarea
              value={newTodo}
              autoFocus
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Inject node metadata..."
              className="w-full h-48 bg-black/40 border border-white/5 rounded-[32px] p-8 text-white text-base placeholder-slate-800 focus:outline-none focus:border-indigo-500/40 transition-all resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Urgency Matrix */}
          <div className="space-y-5">
             <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-1 text-center block">Urgency Tier</label>
             <div className="grid grid-cols-3 gap-3 p-2 bg-black/20 rounded-[28px] border border-white/5">
               {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex flex-col items-center gap-2 py-6 rounded-2xl transition-all border ${
                      priority === p 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-900/40' 
                      : 'bg-transparent border-transparent text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${p === 'high' ? 'bg-orange-500' : p === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'} ${priority === p ? 'ring-4 ring-white/20 scale-125' : ''} transition-all`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{p}</span>
                  </button>
               ))}
             </div>
          </div>

          {/* MASSIVE COMMIT BUTTON */}
          <button
            onClick={handleAddTodo}
            disabled={isSyncing || !newTodo.trim()}
            className="w-full h-28 bg-white text-black hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-700 font-tech font-black uppercase tracking-[0.4em] text-sm rounded-[32px] transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 group overflow-hidden border-b-8 border-slate-300 disabled:border-transparent active:border-b-0"
          >
            {isSyncing ? (
              <>
                <Zap size={24} className="animate-spin text-indigo-600" />
                Relaying Signal...
              </>
            ) : (
              <>
                <Target size={24} className="group-hover:scale-110 transition-transform" />
                Commit Node
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* FOOTER: Fixed at bottom */}
      <footer className="hidden md:flex p-6 md:px-10 bg-[#0a0b14] border-t border-white/5 safe-pb z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between w-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
           <div className="flex gap-6">
              <span>Relay: Optimal</span>
              <span>Encrypted</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
             Node: {room.name}
           </div>
        </div>
      </footer>
    </div>
  );
};

export default TodoRoom;
