
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTree } from './hooks/useTree';
import TreeView from './components/TreeView';
import Editor from './components/Editor';
import ConfirmationModal from './components/ConfirmationModal';
import type { NoteData } from './types';
import { PlusIcon, SpinnerIcon } from './components/icons';
import { supabase } from './supabase/client';
import type { Session } from '@supabase/supabase-js';
import { Auth } from './components/Auth';

const FullScreenLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center h-screen bg-slate-900">
    <div className="flex flex-col items-center gap-4">
      <SpinnerIcon className="w-12 h-12 animate-spin text-cyan-500" />
      <p className="text-slate-400">{message}</p>
    </div>
  </div>
);

const ErrorDisplay = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
  <div className="flex items-center justify-center h-screen bg-slate-900">
    <div className="text-center p-8 bg-slate-800 rounded-lg shadow-xl border border-red-500/30">
      <h2 className="text-2xl font-semibold text-red-400">Connection Error</h2>
      <p className="mt-2 text-slate-300">Could not fetch notes from the database.</p>
      <p className="mt-1 text-xs text-slate-500 max-w-md">{error.message}</p>
      <p className="mt-4 text-slate-400">Please check your Supabase URL, Key, and RLS policies from <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-400 text-xs">schema.sql</code>.</p>
      <button
        onClick={onRetry}
        className="mt-6 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

function MainApp({ session }: { session: Session }) {
  const { tree, getNoteById, addNote, updateNote, deleteNote, copyNote, isLoading, error, fetchNotes } = useTree();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<NoteData | null>(null);

  const selectedNote = useMemo(() => getNoteById(selectedNoteId), [selectedNoteId, getNoteById]);

  // When a note is deleted, if it was the selected one, deselect it.
  useEffect(() => {
    if (selectedNoteId && !getNoteById(selectedNoteId)) {
      setSelectedNoteId(null);
    }
  }, [tree, selectedNoteId, getNoteById]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  const handleUpdateNote = useCallback(async (id: string, updates: Partial<NoteData>) => {
    await updateNote(id, updates);
  }, [updateNote]);

  const handleAddRootNote = async () => {
    const newId = await addNote(null);
    if (newId) {
      setSelectedNoteId(newId);
    }
  };

  const handleAddChildNote = useCallback(async (parentId: string) => {
    const newId = await addNote(parentId);
    if (newId) {
      setSelectedNoteId(newId);
    }
  }, [addNote]);

  const handleDeleteRequest = useCallback((id: string) => {
    const note = getNoteById(id);
    if (note) {
      setNoteToDelete(note);
    }
  }, [getNoteById]);

  const handleConfirmDelete = async () => {
    if (noteToDelete) {
      await deleteNote(noteToDelete.id);
      setNoteToDelete(null);
    }
  };

  const handleCopyNote = useCallback(async (id: string) => {
    const newId = await copyNote(id);
    if (newId) {
      setSelectedNoteId(newId);
    }
  }, [copyNote]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  }

  // Initial loading state
  if (isLoading && !tree.length && !error) {
    return <FullScreenLoader message="Loading your notes..." />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchNotes} />;
  }

  return (
    <div className="flex h-screen font-sans">
      <aside className="w-1/3 max-w-sm min-w-[200px] md:min-w-[300px] bg-slate-800 flex flex-col border-r border-slate-700">
        <header className="p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-white">CodeTree Notes</h1>
          <button
            onClick={handleAddRootNote}
            className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 text-sm"
            aria-label="Add new root note"
          >
            <PlusIcon />
            <span className="hidden md:inline">New Note</span>
          </button>
        </header>
        <div className="flex-grow overflow-y-auto relative p-2">
          {isLoading && tree.length > 0 && (
            <div className="absolute top-2 right-4 text-xs text-slate-400 flex items-center gap-2 z-10">
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
          <TreeView
            nodes={tree}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
            onAddChildNote={handleAddChildNote}
            onDeleteNote={handleDeleteRequest}
            onCopyNote={handleCopyNote}
          />
        </div>
        <footer className="p-2 border-t border-slate-700">
          <div className="text-sm text-slate-400 truncate px-2 mb-2">
            Signed in as: <strong className="text-slate-300">{session.user.email}</strong>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors text-sm"
          >
            Logout
          </button>
        </footer>
      </aside>

      <main className="w-2/3 flex-grow bg-slate-900">
        <Editor
          key={selectedNote?.id || 'empty'}
          note={selectedNote}
          onUpdate={handleUpdateNote}
        />
      </main>

      <ConfirmationModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${noteToDelete?.title}" and all its children? This action cannot be undone.`}
      />
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <FullScreenLoader message="Initializing..." />;
  }

  if (!session) {
    return <Auth />;
  }

  return <MainApp session={session} />;
}
