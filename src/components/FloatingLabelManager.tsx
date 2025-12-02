"use client";

import { Label } from "@/types";
import { useState } from "react";

interface FloatingLabelManagerProps {
  labels: Label[];
  onAddLabel: (
    name: string,
    color: string,
    category: "content" | "music"
  ) => void;
  onUpdateLabel: (
    id: string,
    name: string,
    color: string,
    category: "content" | "music"
  ) => void;
  onDeleteLabel: (id: string) => void;
}

export default function FloatingLabelManager({
  labels,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
}: FloatingLabelManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#86efac");
  const [newCategory, setNewCategory] = useState<"content" | "music">(
    "content"
  );
  const contentLabels = labels.filter((l) => l.category === "content");
  const musicLabels = labels.filter((l) => l.category === "music");

  const handleAdd = () => {
    if (newName.trim()) {
      onAddLabel(newName.trim(), newColor, newCategory);
      setNewName("");
      setNewColor("#86efac");
      setNewCategory("content");
      setShowAddForm(false);
    }
  };

  const handleUpdate = (id: string) => {
    if (newName.trim()) {
      onUpdateLabel(id, newName.trim(), newColor, newCategory);
      setEditingId(null);
      setNewName("");
      setNewColor("#86efac");
      setNewCategory("content");
    }
  };

  const startEdit = (label: Label) => {
    setEditingId(label.id);
    setNewName(label.name);
    setNewColor(label.color);
    setNewCategory(label.category);
  };

  const LabelSection = ({
    title,
    labels,
  }: {
    title: string;
    labels: Label[];
  }) => (
    <div className="mb-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="space-y-2">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center gap-2 group">
            {editingId === label.id ? (
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as "content" | "music")
                    }
                    className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="content">Content</option>
                    <option value="music">Music</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(label.id)}
                    className="flex-1 text-xs bg-blue-500 text-white py-1 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewName("");
                      setNewColor("#86efac");
                      setNewCategory("content");
                    }}
                    className="flex-1 text-xs bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="w-4 h-4 rounded shrink-0"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm text-gray-700 flex-1 truncate">
                  {label.name}
                </span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={() => startEdit(label)}
                    className="text-gray-400 hover:text-blue-500"
                    title="Edit"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDeleteLabel(label.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center z-50"
        title="Manage Labels"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sliding Panel */}
      {isOpen && (
        <div
          className="fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Label Manager</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {/* Add Label Form */}
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors mb-6"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Label
              </button>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Label name"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value as "content" | "music")
                    }
                    className="flex-1 text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="content">Content</option>
                    <option value="music">Music</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 text-sm bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Add Label
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewName("");
                      setNewColor("#86efac");
                      setNewCategory("content");
                    }}
                    className="flex-1 text-sm bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Label Lists */}
            <LabelSection title="Content Labels" labels={contentLabels} />
            <LabelSection title="Music Labels" labels={musicLabels} />
          </div>
        </div>
      )}
    </>
  );
}
