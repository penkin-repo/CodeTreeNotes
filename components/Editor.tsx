
import React, { useState, useEffect } from 'react';
import type { NoteData } from '../types';
import SimpleEditor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { CopyIcon, CheckIcon, SpinnerIcon } from './icons';

// Import languages for syntax highlighting.
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

interface EditorProps {
  note: NoteData | undefined;
  onUpdate: (id: string, updates: Partial<NoteData>) => Promise<void>;
}

const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markup', label: 'HTML/XML' },
    { value: 'bash', label: 'Bash/Shell' },
];

const highlightCode = (code: string, language: string) => {
    const prismLanguage = Prism.languages[language];
    if (prismLanguage) {
        return Prism.highlight(code, prismLanguage, language);
    }
    return code; // Fallback if language is not loaded
};

const Editor: React.FC<EditorProps> = ({ note, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [comment, setComment] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isDirty, setIsDirty] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setCode(note.code);
      setComment(note.comment);
      setLanguage(note.language);
      setIsDirty(false);
      setIsCopied(false);
      setIsSaving(false);
    }
  }, [note]);

  useEffect(() => {
      if (!note || isSaving) return;
      const hasChanges =
        note.title !== title ||
        note.code !== code ||
        note.comment !== comment ||
        note.language !== language;
      setIsDirty(hasChanges);
  }, [title, code, comment, language, note, isSaving]);

  const handleSave = async () => {
    if (note && isDirty) {
      setIsSaving(true);
      await onUpdate(note.id, { title, code, comment, language });
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy code: ", err);
    });
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
            <h2 className="text-2xl font-semibold">Welcome to CodeTree Notes</h2>
            <p className="mt-2">Select a note from the tree to view or edit.</p>
            <p>Or, create a new note to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-6 space-y-4 overflow-y-auto">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-400 mb-1">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-lg"
          />
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-slate-400 mb-1">Comment / Description</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment or description..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>
        <div className="flex-grow flex flex-col min-h-[200px]">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="code-editor" className="block text-sm font-medium text-slate-400">Code Snippet</label>
            <div className="flex items-center gap-2">
                <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-md py-1 px-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>
                <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors text-xs ${
                        isCopied
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    aria-label="Copy code to clipboard"
                    disabled={isCopied}
                >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
            </div>
          </div>
          <div className="w-full h-full flex-grow bg-slate-950 border border-slate-700 rounded-md focus-within:ring-2 focus-within:ring-cyan-500 editor-container">
            <SimpleEditor
                value={code}
                onValueChange={newCode => setCode(newCode)}
                highlight={code => highlightCode(code, language)}
                padding={16}
                textareaId="code-editor"
                className="editor"
                spellCheck="false"
            />
          </div>
        </div>
      </div>
      <footer className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="px-6 py-2 rounded-md font-semibold text-white w-fit transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed bg-cyan-600 hover:bg-cyan-700 h-10 flex justify-center items-center"
          >
            {isSaving ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : isDirty ? 'Save Changes' : 'Saved'}
          </button>
      </footer>
    </div>
  );
};

export default Editor;
