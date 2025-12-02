"use client";

import { Client, Label } from "@/types";
import WeekBox from "./WeekBox";
import { useEffect, useRef, useState } from "react";

interface ClientRowProps {
  client: Client;
  labels: Label[];
  weekKeys: string[];
  currentWeekKey: string;
  tableType: "content" | "music";
  onWeekUpdate: (
    clientId: string,
    weekKey: string,
    color?: string,
    note?: string
  ) => void;
  onDelete: (clientId: string) => void;
  onUpdateName: (clientId: string, name: string) => void;
}

export default function ClientRow({
  client,
  labels,
  weekKeys,
  currentWeekKey,
  tableType,
  onWeekUpdate,
  onDelete,
  onUpdateName,
}: ClientRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedName, setEditedName] = useState(client.name);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // Filter labels by the same category as the table
  const categoryLabels = labels.filter((l) => l.category === tableType);

  // Find the furthest future week with a non-default status
  const getMostRecentStatus = () => {
    const currentWeekIndex = weekKeys.indexOf(currentWeekKey);
    if (currentWeekIndex === -1) return null;

    let furthestWeek = null;
    let furthestIndex = -1;

    // Look through all weeks and find the furthest one with a status
    for (let i = currentWeekIndex; i < weekKeys.length; i++) {
      const weekKey = weekKeys[i];
      const weekData = client.weeks[weekKey];
      if (
        weekData &&
        weekData.color &&
        weekData.color !== "" &&
        weekData.color !== "#f3f4f6"
      ) {
        furthestIndex = i;
        const label = categoryLabels.find((l) => l.color === weekData.color);
        furthestWeek = {
          weekKey,
          weekData,
          label,
          weekNumber: parseInt(weekKey.split("-")[1]),
        };
      }
    }
    return furthestWeek;
  };

  // Find the next future week with a status (for planning display)
  const getNextPlannedWeek = () => {
    const currentWeekIndex = weekKeys.indexOf(currentWeekKey);
    if (currentWeekIndex === -1) return null;

    // Look forward from current week to find next planned status
    for (let i = currentWeekIndex + 1; i < weekKeys.length; i++) {
      const weekKey = weekKeys[i];
      const weekData = client.weeks[weekKey];
      if (
        weekData &&
        weekData.color &&
        weekData.color !== "" &&
        weekData.color !== "#f3f4f6"
      ) {
        const label = categoryLabels.find((l) => l.color === weekData.color);
        return {
          weekKey,
          weekData,
          label,
          weekNumber: parseInt(weekKey.split("-")[1]),
        };
      }
    }
    return null;
  };

  const recentStatus = getMostRecentStatus();
  const plannedWeek = getNextPlannedWeek();

  // On first render, scroll horizontally so the current week is at the left edge,
  // while still allowing the user to scroll back to previous weeks.
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const currentEl = container.querySelector<HTMLElement>(
      `[data-week-key="${currentWeekKey}"]`
    );

    if (currentEl) {
      const containerRect = container.getBoundingClientRect();
      const currentRect = currentEl.getBoundingClientRect();
      const delta = currentRect.left - containerRect.left;
      container.scrollLeft += delta;
    }
  }, [currentWeekKey, weekKeys]);

  return (
    <div className="space-y-2">
      {/* Client Name Header - Always Visible */}
      <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg border justify-between w-full border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-lg font-medium text-gray-700 truncate">
            {client.name}
          </span>
          <button
            onClick={() => {
              setEditedName(client.name);
              setShowEditModal(true);
            }}
            className="text-gray-400 active:text-blue-500 p-1"
            title="Edit name"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>
        {recentStatus && (
          <div className="flex items-center gap-2">
            <div
              className="px-3 py-1 rounded-md text-lg font-medium flex items-center gap-2"
              style={{
                backgroundColor: recentStatus.weekData.color,
                border: `2px solid ${recentStatus.weekData.color}`,
                color: "#1f2937",
              }}
            >
              <span>Week {recentStatus.weekNumber}</span>
              {recentStatus.label && <span>• {recentStatus.label.name}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Main Row */}
      <div className="flex flex-col items-center gap-3 py-2 border-b border-gray-100 hover:bg-gray-50/50 group">
        <div
          className="flex items-center w-full  gap-2 overflow-x-auto pb-1 scrollbar-thin"
          ref={scrollContainerRef}
        >
          {weekKeys.map((weekKey) => {
            const weekNumber = parseInt(weekKey.split("-")[1]);
            const weekData = client.weeks[weekKey] || { color: "", note: "" };

            return (
              <div key={weekKey} data-week-key={weekKey}>
                <WeekBox
                  weekKey={weekKey}
                  weekNumber={weekNumber}
                  color={weekData.color}
                  note={weekData.note}
                  labels={categoryLabels}
                  isCurrentWeek={weekKey === currentWeekKey}
                  onColorChange={(color) =>
                    onWeekUpdate(client.id, weekKey, color, weekData.note)
                  }
                  onNoteChange={(note) =>
                    onWeekUpdate(client.id, weekKey, weekData.color, note)
                  }
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-gray-400 active:text-red-500 p-2"
              title="Delete client"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(client.id)}
                className="text-sm bg-red-500 text-white px-3 py-2 rounded-lg active:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-2 rounded-lg active:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Name Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Edit Client Name</h3>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && editedName.trim()) {
                  onUpdateName(client.id, editedName.trim());
                  setShowEditModal(false);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-lg"
              placeholder="Client name"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (editedName.trim()) {
                    onUpdateName(client.id, editedName.trim());
                    setShowEditModal(false);
                  }
                }}
                className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-lg active:bg-blue-600 font-medium text-lg"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg active:bg-gray-300 font-medium text-lg"
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
