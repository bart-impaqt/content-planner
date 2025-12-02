"use client";

import { useState } from "react";

interface AddClientButtonProps {
  onAdd: (name: string) => void;
}

export default function AddClientButton({ onAdd }: AddClientButtonProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-5 py-3 text-base text-blue-500 active:text-blue-600 bg-blue-50 active:bg-blue-100 rounded-lg"
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
        Add Row
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Client</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Client name"
          className="w-full text-base border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="flex-1 text-base bg-blue-500 text-white py-3 px-6 rounded-lg active:bg-blue-600 font-medium"
          >
            Add Client
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setName("");
            }}
            className="flex-1 text-base bg-gray-200 text-gray-700 py-3 px-6 rounded-lg active:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
