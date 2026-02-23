
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Room, CalendarEntry, CalendarCategory } from '../types';
import Modal from './Modal';

interface CalendarRoomProps {
  room: Room;
  onUpdateRoom: (room: Room) => void;
}

const CalendarRoom: React.FC<CalendarRoomProps> = ({ room, onUpdateRoom }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newCat, setNewCat] = useState<CalendarCategory>(CalendarCategory.OBLIGATION);
  const [newNotes, setNewNotes] = useState('');

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const today = new Date();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => setViewDate(new Date());

  const getEntriesForDay = (day: number) => {
    const dateStr = `${(currentMonth + 1).toString().padStart(2, '0')}.${day.toString().padStart(2, '0')}.${currentYear}`;
    return (room.calendarEntries || []).filter(e => e.date === dateStr);
  };

  const handleAddEntry = () => {
    if (!selectedDay || !newNotes.trim()) return;
    const dateStr = `${(currentMonth + 1).toString().padStart(2, '0')}.${selectedDay.toString().padStart(2, '0')}.${currentYear}`;
    const newEntry: CalendarEntry = {
      id: Date.now().toString(),
      date: dateStr,
      category: newCat,
      notes: newNotes
    };

    onUpdateRoom({
      ...room,
      calendarEntries: [...(room.calendarEntries || []), newEntry]
    });
    setNewNotes('');
    setIsAddOpen(false);
  };

  const handleDeleteEntry = (id: string) => {
    onUpdateRoom({
      ...room,
      calendarEntries: (room.calendarEntries || []).filter(e => e.id !== id)
    });
  };

  const categories = [
    { label: CalendarCategory.OBLIGATION, color: 'text-orange-500', dot: 'bg-orange-500', bg: 'bg-orange-500/10' },
    { label: CalendarCategory.SOCIAL, color: 'text-blue-500', dot: 'bg-blue-500', bg: 'bg-blue-500/10' },
    { label: CalendarCategory.ADMIN, color: 'text-yellow-500', dot: 'bg-yellow-500', bg: 'bg-yellow-500/10' },
    { label: CalendarCategory.PERSONAL, color: 'text-green-500', dot: 'bg-green-500', bg: 'bg-green-500/10' },
    { label: CalendarCategory.LOGISTICS, color: 'text-purple-500', dot: 'bg-purple-500', bg: 'bg-purple-500/10' },
  ];

  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

  return (
    <div className="flex flex-col h-full bg-[#0a0b14] safe-pt overflow-hidden">
      
      {/* Calendar Navigation Header */}
      <div className="flex flex-col px-6 pt-6 pb-8 md:px-10 md:pt-10">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
                <CalendarIcon size={24} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase font-tech text-white leading-none">
                  {monthNames[currentMonth]}
                </h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">{currentYear}</p>
              </div>
            </div>

            <button 
                onClick={handleToday}
                className="hidden md:block px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 transition-all active:scale-95"
            >
                Today
            </button>
        </div>

        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center bg-[#111422] border border-white/5 rounded-2xl p-1 shadow-2xl">
              <button onClick={handlePrevMonth} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white active:scale-90">
                <ChevronLeft size={20} />
              </button>
              <div className="w-px h-6 bg-white/5 mx-1" />
              <button onClick={handleNextMonth} className="p-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white active:scale-90">
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {categories.slice(0, 3).map(c => (
                    <div key={c.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                        <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        <span className="text-[8px] font-black uppercase tracking-tight text-slate-500 whitespace-nowrap">{c.label.split(' ')[0]}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="flex-1 px-4 pb-6 md:px-10 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1.5 md:gap-3">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-600 tracking-widest mb-4">{d}</div>
          ))}
          
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-white/[0.01]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
            const isPast = new Date(currentYear, currentMonth, day) < new Date(today.setHours(0,0,0,0));
            const entries = getEntriesForDay(day);

            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setIsDetailOpen(true); }}
                className={`relative aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center group active:scale-95 ${
                  isToday 
                  ? 'bg-purple-600 text-white border-purple-400 shadow-2xl shadow-purple-900/40' 
                  : 'bg-[#111422] border-white/5 hover:border-white/10'
                }`}
              >
                <span className={`text-base md:text-xl font-tech font-black ${isToday ? 'text-white' : isPast ? 'text-slate-700' : 'text-slate-300'}`}>
                  {day}
                </span>

                {isPast && !isToday && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[80%] h-[1px] bg-red-600/30 rotate-[35deg] transform"></div>
                  </div>
                )}

                <div className="absolute bottom-2 flex gap-1">
                  {entries.slice(0, 3).map(e => {
                    const catInfo = categories.find(c => c.label === e.category);
                    return <div key={e.id} className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isToday ? 'bg-white' : catInfo?.dot}`} />;
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail Panel Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${monthNames[currentMonth]} ${selectedDay}`}>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Chronos Log</span>
                </div>
                <button 
                    onClick={() => { setIsDetailOpen(false); setIsAddOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-900/20"
                >
                    <Plus size={14} /> Add Entry
                </button>
            </div>

            <div className="space-y-3">
              {selectedDay && getEntriesForDay(selectedDay).map(e => {
                const catInfo = categories.find(c => c.label === e.category);
                return (
                  <div key={e.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4 group">
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 shadow-lg ${catInfo?.dot}`} />
                    <div className="flex-1">
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${catInfo?.color}`}>{e.category}</p>
                      <p className="text-slate-200 text-sm leading-relaxed font-medium">{e.notes}</p>
                    </div>
                    <button onClick={() => handleDeleteEntry(e.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
              
              {selectedDay && getEntriesForDay(selectedDay).length === 0 && (
                <div className="py-20 flex flex-col items-center opacity-10">
                   <div className="w-16 h-16 border-2 border-dashed border-white rounded-3xl flex items-center justify-center mb-4">
                      <Clock size={32} />
                   </div>
                   <p className="text-xs font-tech font-black uppercase tracking-widest">Temporal Void</p>
                </div>
              )}
            </div>
        </div>
      </Modal>

      {/* Entry Creation Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="New Frequency">
        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 text-center">Protocol Class</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button
                  key={c.label}
                  onClick={() => setNewCat(c.label)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    newCat === c.label 
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                    : 'bg-[#1a1d2e] border-transparent text-slate-500'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                  {c.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Signal Data</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Record metadata..."
              className="w-full h-32 bg-black/20 border border-white/5 rounded-2xl p-4 text-white text-sm placeholder-slate-700 focus:outline-none focus:border-purple-500 transition-all resize-none"
            />
          </div>

          <button
            onClick={handleAddEntry}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold py-5 rounded-2xl transition-all shadow-2xl shadow-purple-900/40 uppercase tracking-widest active:scale-95"
          >
            Broadcast Entry
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarRoom;
