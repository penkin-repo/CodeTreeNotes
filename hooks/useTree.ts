
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Note, NoteData } from '../types';
import { supabase } from '../supabase/client';

// Helper to map DB snake_case to JS camelCase for the parent ID
const fromSupabase = (note: any): NoteData => ({
    ...note,
    parentId: note.parent_id,
});

export const useTree = () => {
    const [notes, setNotes] = useState<NoteData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setNotes(data.map(fromSupabase));
        } catch (err: any) {
            setError(err);
            console.error("Error fetching notes:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const notesMap = useMemo(() => {
        const map = new Map<string, NoteData>();
        notes.forEach(note => map.set(note.id, note));
        return map;
    }, [notes]);

    const tree = useMemo(() => {
        const buildTree = (parentId: string | null): Note[] => {
            return notes
                .filter(note => note.parentId === parentId)
                .map(note => ({
                    ...note,
                    children: buildTree(note.id),
                }));
        };
        return buildTree(null);
    }, [notes]);

    const getNoteById = useCallback((id: string | null): NoteData | undefined => {
        if (!id) return undefined;
        return notesMap.get(id);
    }, [notesMap]);

    const addNote = useCallback(async (parentId: string | null) => {
        const { data, error } = await supabase
            .from('notes')
            .insert({
                parent_id: parentId,
                title: 'New Note',
                code: '',
                comment: '',
                language: 'javascript',
            })
            .select()
            .single();
        
        if (error) {
            console.error("Error adding note:", error);
            setError(error);
            return null;
        }
        
        if (data) {
            const newNote = fromSupabase(data);
            setNotes(prev => [...prev, newNote]);
            return newNote.id;
        }
        return null;
    }, []);

    const updateNote = useCallback(async (id: string, updates: Partial<Omit<NoteData, 'id' | 'parentId' | 'created_at'>>) => {
        const { data, error } = await supabase
            .from('notes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error("Error updating note:", error);
            setError(error);
            return;
        }
        if (data) {
            const updatedNote = fromSupabase(data);
            setNotes(prev => prev.map(note => note.id === id ? { ...note, ...updatedNote } : note));
        }
    }, []);
  
    const deleteNote = useCallback(async (noteId: string) => {
        const idsToDelete = new Set<string>();
        const queue = [noteId];
        idsToDelete.add(noteId);

        const allNotes = notes;
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            allNotes.forEach(note => {
                if (note.parentId === currentId) {
                    idsToDelete.add(note.id);
                    queue.push(note.id);
                }
            });
        }
        
        const { error } = await supabase
            .from('notes')
            .delete()
            .in('id', Array.from(idsToDelete));
        
        if (error) {
            console.error("Error deleting note(s):", error);
            setError(error);
            return;
        }

        setNotes(prev => prev.filter(note => !idsToDelete.has(note.id)));
    }, [notes]);
  
    const copyNote = useCallback(async (noteId: string) => {
        const notesToInsert: NoteData[] = [];

        const recursiveCopy = async (currentId: string, newParentId: string | null): Promise<string | null> => {
            const originalNote = notesMap.get(currentId);
            if (!originalNote) return null;

            const { id, created_at, parentId, ...noteToCopy } = originalNote;

            const { data: newNoteData, error } = await supabase
                .from('notes')
                .insert({
                    ...noteToCopy,
                    parent_id: newParentId,
                    title: newParentId === originalNote.parentId ? `${originalNote.title} (Copy)` : originalNote.title,
                })
                .select()
                .single();
            
            if (error || !newNoteData) {
                console.error("Error during recursive copy:", error);
                setError(error);
                return null;
            }
            
            const newNote = fromSupabase(newNoteData);
            notesToInsert.push(newNote);

            const children = notes.filter(note => note.parentId === currentId);
            for (const child of children) {
                await recursiveCopy(child.id, newNote.id);
            }

            return newNote.id;
        };

        const rootNoteToCopy = notesMap.get(noteId);
        if(rootNoteToCopy) {
            const newRootId = await recursiveCopy(noteId, rootNoteToCopy.parentId);
            if (newRootId) {
                setNotes(prev => [...prev, ...notesToInsert].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()));
            }
            return newRootId;
        }
        return undefined;
    }, [notes, notesMap]);

    return { notes, notesMap, tree, getNoteById, addNote, updateNote, deleteNote, copyNote, isLoading, error, fetchNotes };
};
