
import React from 'react';
import type { Note } from '../types';
import TreeNode from './TreeNode';

interface TreeViewProps {
  nodes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onAddChildNote: (parentId: string) => void;
  onDeleteNote: (id: string) => void;
  onCopyNote: (id: string) => void;
}

const TreeView: React.FC<TreeViewProps> = ({ nodes, selectedNoteId, onSelectNote, onAddChildNote, onDeleteNote, onCopyNote }) => {
  return (
    <div>
      {nodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          onAddChildNote={onAddChildNote}
          onDeleteNote={onDeleteNote}
          onCopyNote={onCopyNote}
        />
      ))}
    </div>
  );
};

export default TreeView;
