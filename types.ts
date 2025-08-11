// The flat data structure, ideal for storing in a database like Supabase.
export interface NoteData {
  id: string;
  parentId: string | null; // Mapped from parent_id in Supabase
  title: string;
  code: string;
  comment: string;
  language: string; // e.g., 'javascript', 'typescript', 'css'
  created_at: string;
}

// The nested structure, derived from the flat data for easy rendering in the UI.
export interface Note extends NoteData {
  children: Note[];
}
