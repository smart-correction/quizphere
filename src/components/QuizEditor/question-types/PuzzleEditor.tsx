import React, { useState } from 'react';
import { GripVertical, Plus, Trash } from 'lucide-react';
import type { Choice } from '../../../types/quiz';

interface PuzzleEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export default function PuzzleEditor({ choices, onChange }: PuzzleEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddChoice = () => {
    const newChoice: Choice = {
      id: crypto.randomUUID(),
      text: '',
      isCorrect: true,
      order: choices.length
    };
    onChange([...choices, newChoice]);
  };

  const handleDeleteChoice = (choiceId: string) => {
    onChange(
      choices
        .filter(choice => choice.id !== choiceId)
        .map((choice, index) => ({ ...choice, order: index }))
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Add a subtle transparency to the dragged item
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const newChoices = [...choices];
    const [draggedChoice] = newChoices.splice(draggedIndex, 1);
    newChoices.splice(dropIndex, 0, draggedChoice);

    // Update the order of all choices
    onChange(newChoices.map((choice, index) => ({ ...choice, order: index })));
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Puzzle Pieces (drag to reorder)
        </label>
        <button
          type="button"
          onClick={handleAddChoice}
          className="flex items-center px-3 py-1.5 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Piece
        </button>
      </div>

      <div className="space-y-2">
        {choices.map((choice, index) => (
          <div
            key={choice.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className={`flex items-center gap-3 bg-white p-3 rounded-lg border ${
              draggedIndex === index
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-200'
            } transition-colors cursor-move hover:border-purple-200`}
          >
            <div className="flex items-center gap-2">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <span className="w-8 text-sm font-medium text-gray-500">
                {index + 1}
              </span>
            </div>
            <input
              type="text"
              value={choice.text}
              onChange={(e) => {
                const newChoices = choices.map(c =>
                  c.id === choice.id ? { ...c, text: e.target.value } : c
                );
                onChange(newChoices);
              }}
              placeholder="Enter puzzle piece text"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => handleDeleteChoice(choice.id)}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        ))}

        {choices.length === 0 && (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            Add puzzle pieces to create your sequence
          </div>
        )}
      </div>
    </div>
  );
}