"use client";

import { Label } from "@/types";
import { useState } from "react";

interface LabelColumnProps {
  labels: Label[];
  category: "content" | "music";
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

export default function LabelColumn({
  labels,
  category,
  onAddLabel,
  onUpdateLabel,
  onDeleteLabel,
}: LabelColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#86efac");

  const handleAdd = () => {
    if (newName.trim()) {
      onAddLabel(newName.trim(), newColor, category);
      setNewName("");
      setNewColor("#86efac");
      setShowAddModal(false);
    }
  };

  const handleUpdate = () => {
    if (newName.trim() && editingLabel) {
      onUpdateLabel(editingLabel.id, newName.trim(), newColor, category);
      setEditingLabel(null);
      setNewName("");
      setNewColor("#86efac");
      setShowEditModal(false);
    }
  };

  // Filter labels by category
  const filteredLabels = labels.filter((label) => label.category === category);

  const startEdit = (label: Label) => {
    setEditingLabel(label);
    setNewName(label.name);
    setNewColor(label.color);
    setShowEditModal(true);
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 transition-all ${
        isCollapsed ? "p-2" : "p-4 min-w-[220px] max-w-[250px]"
      }`}
      style={{ position: "sticky", top: "1rem", alignSelf: "flex-start" }}
    >
      <div className="flex items-center justify-between mb-3">
        {!isCollapsed && (
          <h3 className="text-sm font-semibold text-gray-700 capitalize">
            {category} Labels
          </h3>
        )}
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <button
              onClick={() => setShowAddModal(true)}
              className="text-blue-500 active:text-blue-600 p-1"
              title="Add label"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 active:text-gray-700 p-1"
            title={isCollapsed ? "Expand" : "Collapse"}
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
                d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
              />
            </svg>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2">
          {filteredLabels.map((label) => (
            <div key={label.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded shrink-0"
                style={{ backgroundColor: label.color }}
              />
              <span className="text-sm text-gray-700 flex-1 truncate">
                {label.name}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(label)}
                  className="text-gray-400 active:text-blue-500 p-1"
                  title="Edit"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteLabel(label.id)}
                  className="text-gray-400 active:text-red-500 p-1"
                  title="Delete"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Label Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Add {category} Label
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name"
                className="w-full text-base border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                className="flex-1 text-base bg-blue-500 text-white py-3 px-6 rounded-lg active:bg-blue-600 font-medium"
              >
                Add Label
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewName("");
                  setNewColor("#86efac");
                }}
                className="flex-1 text-base bg-gray-200 text-gray-700 py-3 px-6 rounded-lg active:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Label Modal */}
      {showEditModal && editingLabel && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Label</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Label name"
                className="w-full text-base border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 text-base bg-blue-500 text-white py-3 px-6 rounded-lg active:bg-blue-600 font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingLabel(null);
                  setNewName("");
                  setNewColor("#86efac");
                }}
                className="flex-1 text-base bg-gray-200 text-gray-700 py-3 px-6 rounded-lg active:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
