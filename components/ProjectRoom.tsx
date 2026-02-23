
import React, { useState, useRef } from 'react';
// Added Plus icon to imports
import { FileText, ImagePlus, MessageSquare, X, MoreVertical, Trash2, Plus } from 'lucide-react';
import { Room, ProjectPost } from '../types';

interface ProjectRoomProps {
  room: Room;
  onUpdateRoom: (room: Room) => void;
  onOpenSettings: () => void;
  onEditPost: (post: ProjectPost) => void;
}

const ProjectRoom: React.FC<ProjectRoomProps> = ({ room, onUpdateRoom, onOpenSettings, onEditPost }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeSelectedImage = (idx: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePost = () => {
    if (!newTitle.trim() || !newMessage.trim()) return;

    const newPost: ProjectPost = {
      id: Date.now().toString(),
      title: newTitle,
      content: newMessage,
      timestamp: Date.now(),
      author: 'K',
      imageUrls: selectedImages.length > 0 ? selectedImages : undefined
    };

    onUpdateRoom({
      ...room,
      projectPosts: [newPost, ...(room.projectPosts || [])]
    });

    setNewTitle('');
    setNewMessage('');
    setSelectedImages([]);
  };

  const deletePost = (id: string) => {
    onUpdateRoom({
      ...room,
      projectPosts: (room.projectPosts || []).filter(p => p.id !== id)
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return '1m ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0b14] safe-pt overflow-hidden relative">
      <header className="px-6 py-4 border-b border-white/5 bg-[#0d101b]/40 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-slate-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-tight">{room.name}</h2>
        </div>
        <button onClick={onOpenSettings} className="p-2 text-slate-500 hover:text-white transition-colors">
          <MoreVertical size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-10 pb-20">
          
          {/* Post Composer */}
          <div className="bg-[#111422] rounded-xl border border-white/5 p-5 shadow-2xl">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 group focus-within:text-white transition-colors">
                    <X size={16} className="cursor-pointer hover:text-red-400 shrink-0" onClick={() => setNewTitle('')} />
                    <input 
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Blueprint Title..."
                      className="bg-transparent border-none outline-none w-full text-base font-bold placeholder-slate-600"
                    />
                  </div>
                  <textarea 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Describe the objective..."
                    className="bg-transparent border-none outline-none w-full h-24 text-sm placeholder-slate-700 resize-none pt-2"
                  />
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-slate-600 hover:text-slate-400 cursor-pointer transition-colors group overflow-hidden relative shrink-0"
                >
                  <ImagePlus size={28} className="group-hover:scale-110 transition-transform" />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </div>
              </div>

              {selectedImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {selectedImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={img} className="w-full h-full object-cover" />
                      <button onClick={() => removeSelectedImage(i)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 shrink-0 border border-dashed border-white/10 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 cursor-pointer"
                  >
                    {/* Fixed error: Plus icon was used but not imported */}
                    <Plus size={18} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-white/5 mt-4">
              <button 
                onClick={handlePost}
                disabled={!newTitle.trim() || !newMessage.trim()}
                className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
              >
                <MessageSquare size={16} />
                Deploy
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(room.projectPosts || []).map((post) => (
              <div 
                key={post.id} 
                onClick={() => onEditPost({ ...post })}
                className="bg-[#111422] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all group relative flex flex-col h-full cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0">
                      {post.author}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Deployed {formatTimeAgo(post.timestamp)}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
                    className="p-2 text-slate-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="text-lg font-black text-white mb-4 tracking-tight leading-tight group-hover:text-indigo-400 transition-colors uppercase font-tech">{post.title}</h3>
                
                <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex-1 mb-2">
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap line-clamp-3 mb-4">{post.content}</p>
                  
                  {post.imageUrls && post.imageUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {post.imageUrls.slice(0, 3).map((url, i) => (
                        <div key={i} className="rounded-lg overflow-hidden border border-white/5 aspect-square relative">
                          <img src={url} className="w-full h-full object-cover" alt="attachment" />
                          {i === 2 && post.imageUrls!.length > 3 && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-bold text-white">
                              +{post.imageUrls!.length - 3}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectRoom;
