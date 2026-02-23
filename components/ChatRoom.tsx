
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Paperclip, Mic, Send, MessageSquare } from 'lucide-react';
import { Room, ChatMessage } from '../types';

interface ChatRoomProps {
  room: Room;
  onUpdateRoom: (room: Room) => void;
  onOpenSettings: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ room, onUpdateRoom, onOpenSettings }) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const micTimeoutRef = useRef<any | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [room.messages]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    const updatedRoom = {
      ...room,
      messages: [...(room.messages || []), newMessage]
    };
    onUpdateRoom(updatedRoom);
    setInputText('');

    // Simulate system reply logic for n8n demo
    setTimeout(() => {
        const reply: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'system',
            text: `External signal acknowledged. Node ${room.name} processing protocol...`,
            timestamp: Date.now()
        };
        onUpdateRoom({
            ...updatedRoom,
            messages: [...(updatedRoom.messages || []), reply]
        });
    }, 1200);
  };

  const handleMicMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    micTimeoutRef.current = setTimeout(() => {
      startRecording();
    }, 700);
  };

  const handleMicMouseUp = () => {
    if (micTimeoutRef.current) clearTimeout(micTimeoutRef.current);
    if (isRecording) stopRecording();
  };

  const startRecording = () => {
    setIsRecording(true);
    const interval = setInterval(() => {
      setRecordingLevel(Math.random() * 100);
    }, 80);
    (window as any).levelInterval = interval;
  };

  const stopRecording = () => {
    setIsRecording(false);
    clearInterval((window as any).levelInterval);
    setRecordingLevel(0);
    // Mimic the requested countdown/timer logic
    setTimeout(() => {
        setInputText("Captured voice module...");
    }, (room.recordingTimer || 0.8) * 1000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0b14] relative">
      
      {/* Dynamic Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0d101b]/60 backdrop-blur-2xl z-20 safe-pt">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center border border-purple-500/20 overflow-hidden">
            {room.icon ? (
                <img src={room.icon} className="w-full h-full object-cover" />
            ) : (
                <MessageSquare className="text-purple-500" size={24} />
            )}
          </div>
          <div>
            <h3 className="font-tech font-black text-lg tracking-tight text-white uppercase leading-none">{room.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active Relay</p>
            </div>
          </div>
        </div>
        <button onClick={onOpenSettings} className="p-3 hover:bg-white/5 rounded-2xl transition-all active:scale-90">
          <MoreVertical size={20} className="text-slate-500" />
        </button>
      </header>

      {/* Message Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col custom-scrollbar"
      >
        {(room.messages || []).length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center px-12">
                <div className="w-16 h-16 border border-dashed border-slate-500 rounded-3xl flex items-center justify-center mb-6">
                    <MessageSquare size={32} />
                </div>
                <h4 className="font-tech font-bold uppercase tracking-widest text-sm mb-2">Neural Link Ready</h4>
                <p className="text-xs max-w-xs">Send signals to begin neural synchronization with external terminals.</p>
            </div>
        )}

        {(room.messages || []).map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col group ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-xl transition-all ${
              msg.sender === 'user' 
              ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-br-none' 
              : 'bg-[#111422] border border-white/5 text-slate-200 rounded-bl-none'
            }`}>
              <p className="text-[14px] leading-relaxed tracking-tight">{msg.text}</p>
            </div>
            <span className="text-[9px] text-slate-600 mt-2 font-bold uppercase tracking-widest px-1">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Input Controller */}
      <div className="p-4 md:p-6 bg-[#0a0b14]/80 backdrop-blur-xl border-t border-white/5 safe-pb">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button className="hidden sm:flex p-4 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all active:scale-95">
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 relative group">
            {isRecording ? (
              <div className="h-14 bg-purple-600/10 rounded-3xl border border-purple-500/40 flex items-center px-6 gap-3 shadow-2xl shadow-purple-900/20">
                <div className="flex items-end gap-1 h-6 flex-1">
                  {[...Array(24)].map((_, i) => (
                    <div 
                        key={i} 
                        className="w-1 bg-purple-500 rounded-full transition-all duration-100"
                        style={{ height: `${Math.random() * recordingLevel}%`, opacity: (i / 24) * 0.8 + 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-tech text-purple-400 font-black uppercase tracking-widest animate-pulse">Recording Signal</span>
              </div>
            ) : (
              <div className="relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Terminal record..."
                    className="w-full h-14 bg-[#111422] border border-white/5 rounded-3xl px-6 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-4 focus:ring-purple-500/5 transition-all"
                  />
                  <button className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500">
                    <Paperclip size={18} />
                  </button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
              <button 
                onMouseDown={handleMicMouseDown}
                onMouseUp={handleMicMouseUp}
                onTouchStart={handleMicMouseDown}
                onTouchEnd={handleMicMouseUp}
                className={`p-4 rounded-3xl transition-all shadow-xl active:scale-90 ${
                    isRecording 
                    ? 'bg-red-500 text-white shadow-red-900/20' 
                    : 'bg-[#1a1d2e] text-slate-400 border border-white/5 hover:text-white'
                }`}
              >
                <Mic size={22} />
              </button>

              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-3xl transition-all shadow-2xl shadow-purple-900/40 active:scale-90"
              >
                <Send size={22} />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
