
import React, { useState } from 'react';
import type { Note } from '../types';
import TreeView from './TreeView';
import { ChevronRightIcon, ChevronDownIcon, PlusIcon, TrashIcon, CopyIcon, FileIcon } from './icons';

interface TreeNodeProps {
  node: Note;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddChildNote: (parentId: string) => void;
  onDeleteNote: (id: string) => void;
  onCopyNote: (id: string) => void;
}

const ActionButton: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="p-1 rounded-md text-slate-400 hover:bg-slate-600 hover:text-slate-100 transition-colors"
  >
    {children}
  </button>
);

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedNoteId, onSelectNote, onAddChildNote, onDeleteNote, onCopyNote }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedNoteId;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    onSelectNote(node.id);
  };
  
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded) setIsExpanded(true);
    onAddChildNote(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteNote(node.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyNote(node.id);
  };

  const baseClasses = "flex items-center w-full text-left py-1.5 px-2 rounded-md transition-colors text-sm group";
  const selectedClasses = "bg-cyan-500/20 text-cyan-200";
  const hoverClasses = "hover:bg-slate-700";

  return (
    <div>
      <div
        onClick={handleSelect}
        className={`${baseClasses} ${isSelected ? selectedClasses : hoverClasses}`}
        role="button"
        tabIndex={0}
      >
        <div className="flex items-center flex-grow truncate">
          <span onClick={handleToggleExpand} className="mr-1 cursor-pointer">
            {hasChildren ? (isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : <span className="inline-block w-4 h-4 mr-1 ml-1" />}
          </span>
          <FileIcon />
          <span className="ml-2 truncate">{node.title}</span>
        </div>
        <div className={`flex items-center gap-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <ActionButton onClick={handleAddChild} label={`Add note to ${node.title}`}><PlusIcon /></ActionButton>
          <ActionButton onClick={handleCopy} label={`Copy ${node.title}`}><CopyIcon /></ActionButton>
          <ActionButton onClick={handleDelete} label={`Delete ${node.title}`}><TrashIcon /></ActionButton>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-6 border-l border-slate-700 ml-2">
          <TreeView
            nodes={node.children}
            selectedNoteId={selectedNoteId}
            onSelectNote={onSelectNote}
            onAddChildNote={onAddChildNote}
            onDeleteNote={onDeleteNote}
            onCopyNote={onCopyNote}
          />
        </div>
      )}
    </div>
  );
};

export default TreeNode;
