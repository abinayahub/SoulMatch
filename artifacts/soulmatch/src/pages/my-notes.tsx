import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pin, Trash2, Search, Edit3, X, Save } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTime } from "@/lib/utils";

export interface Note {
  id: string;
  content: string;
  updatedAt: number;
  isPinned: boolean;
}

export default function MyNotesPage() {
  const [, navigate] = useLocation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load notes on mount
  useEffect(() => {
    const saved = localStorage.getItem("soulmatch_notes");
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Save notes whenever they change
  useEffect(() => {
    localStorage.setItem("soulmatch_notes", JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      updatedAt: Date.now(),
      isPinned: false,
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleUpdateNote = (content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteId ? { ...n, content, updatedAt: Date.now() } : n
      )
    );
  };

  const handleTogglePin = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const filteredNotes = notes
    .filter((n) => n.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return b.updatedAt - a.updatedAt;
      }
      return a.isPinned ? -1 : 1;
    });

  if (activeNoteId !== null && activeNote) {
    return (
      <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col bg-[#FDF8FA]">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#F6A8B7]/20 bg-white/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveNoteId(null)} className="h-9 w-9 rounded-full text-[#252525]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <span className="font-bold text-[#252525] text-lg">Edit Note</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleTogglePin(activeNote.id)}
              className={`h-9 w-9 rounded-full transition-colors ${activeNote.isPinned ? "text-[#F6A8B7] bg-[#F6A8B7]/10" : "text-[#8A8A8A]"}`}
            >
              <Pin className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteNote(activeNote.id)}
              className="h-9 w-9 rounded-full text-red-400 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-5 overflow-y-auto">
          <textarea
            autoFocus
            placeholder="Write something..."
            value={activeNote.content}
            onChange={(e) => handleUpdateNote(e.target.value)}
            className="w-full h-full min-h-[300px] resize-none bg-transparent border-0 focus:ring-0 p-0 text-[16px] text-[#252525] placeholder:text-[#8A8A8A] leading-relaxed"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] max-w-md mx-auto flex flex-col relative" style={{ background: 'linear-gradient(135deg, #F8F3F7 0%, #FAF1ED 35%, #F4F1FF 70%, #FFFDFC 100%)' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/chat")} className="h-9 w-9 rounded-full bg-white/40 text-[#252525]">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-[24px] font-bold text-[#252525]">My Notes</h1>
      </div>

      <div className="px-5 mb-4 shrink-0">
        <p className="text-[14px] text-[#707070] font-medium">A private space for your thoughts.</p>
      </div>

      {/* Search Bar */}
      {notes.length > 0 && (
        <div className="px-5 mb-5 shrink-0">
          <div className="relative flex items-center h-[46px] rounded-[20px] border border-white/40 px-4" style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 16px rgba(246,168,183,0.10)' }}>
            <Search className="w-4 h-4 text-[#8A8A8A] shrink-0" />
            <Input 
              placeholder="Search notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-3 h-full text-[15px] text-[#252525] placeholder:text-[#8A8A8A]"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full" onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-[#8A8A8A]" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-70">
            <Edit3 className="w-12 h-12 text-[#F6A8B7] mb-4" />
            <p className="text-[16px] font-bold text-[#252525] mb-1">{searchQuery ? "No notes found" : "No notes yet"}</p>
            <p className="text-[14px] text-[#707070]">
              {searchQuery ? "Try a different search." : "Write your first note..."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {filteredNotes.map((note) => {
              const lines = note.content.split("\n").filter((l) => l.trim() !== "");
              const title = lines[0] || "New Note";
              const body = lines.slice(1).join(" ");
              
              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className="rounded-[20px] p-4 flex flex-col justify-between cursor-pointer active:scale-95 transition-all border border-white/40 relative group"
                  style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}
                >
                  <div>
                    <h3 className="font-bold text-[#252525] text-[15px] line-clamp-2 leading-snug mb-1">{title}</h3>
                    {body && <p className="text-[13px] text-[#707070] line-clamp-3 leading-snug mb-2">{body}</p>}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F6A8B7]/10">
                    <span className="text-[11px] font-medium text-[#8A8A8A]">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    {note.isPinned && <Pin className="w-3.5 h-3.5 text-[#F6A8B7] fill-[#F6A8B7]/20" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {activeNoteId === null && (
        <Button
          onClick={handleCreateNote}
          className="absolute bottom-6 right-5 w-14 h-14 rounded-full shadow-lg p-0 flex items-center justify-center transform active:scale-90 transition-all border border-white/30 z-10"
          style={{ background: 'linear-gradient(135deg, #F6A8B7, #F8C7C8, #F8D9D2)', boxShadow: '0 6px 20px rgba(246,168,183,0.4)', color: '#252525' }}
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </Button>
      )}
    </div>
  );
}
