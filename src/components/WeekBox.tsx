"use client";

import { Label } from "@/types";
import { useState, useRef, useEffect } from "react";

interface WeekBoxProps {
  weekKey: string;
  weekNumber: number;
  color?: string;
  note?: string;
  labels: Label[];
  onColorChange: (color: string) => void;
  onNoteChange: (note: string) => void;
  isCurrentWeek?: boolean;
}

export default function WeekBox({
  weekKey,
  weekNumber,
  color = "",
  note = "",
  labels,
  onColorChange,
  onNoteChange,
  isCurrentWeek = false,
}: WeekBoxProps) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState(note);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  useEffect(() => {
    setNoteText(note);
  }, [note]);

  const handleSaveNote = () => {
    onNoteChange(noteText);
    setShowNoteModal(false);
  };

  const handleCancelNote = () => {
    setNoteText(note);
    setShowNoteModal(false);
  };

  const handleTap = () => {
    if (isLongPressing) {
      setIsLongPressing(false);
      return;
    }
    // Find current label index
    const currentLabelIndex = labels.findIndex((l) => l.color === color);

    // Cycle to next label, or clear if at the end
    if (currentLabelIndex === -1) {
      // No color set, use first label
      if (labels.length > 0) {
        onColorChange(labels[0].color);
      }
    } else if (currentLabelIndex === labels.length - 1) {
      // Last label, clear the color
      onColorChange("");
    } else {
      // Move to next label
      onColorChange(labels[currentLabelIndex + 1].color);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setShowNoteModal(true);
      // Haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleNoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNoteModal(true);
  };

  const getCurrentLabel = () => {
    return labels.find((l) => l.color === color);
  };

  const currentLabel = getCurrentLabel();

  // Determine border color based on label color or current week
  const getBorderColor = () => {
    if (isCurrentWeek) return "border-blue-500";
    if (color && color !== "#f3f4f6") {
      return "";
    }
    return "border-gray-200";
  };

  const borderStyle =
    color && color !== "#f3f4f6" && !isCurrentWeek
      ? { borderColor: color }
      : {};

  return (
    <>
      <div className="relative">
        <button
          className={`w-20 h-12 rounded-t-lg border-2 border-b-0 flex items-center justify-center text-base font-medium transition-colors active:scale-95 relative ${getBorderColor()}`}
          style={{ backgroundColor: color || "#f3f4f6", ...borderStyle }}
          onClick={handleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <span
            className={
              color && color !== "#f3f4f6" ? "text-gray-800" : "text-gray-400"
            }
          >
            {weekNumber}
          </span>
          {note && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
          )}
        </button>
        <button
          onClick={handleNoteClick}
          style={{ backgroundColor: color || "#f3f4f6", ...borderStyle }}
          className={`w-20 h-8 text-xs bg-gray-100 active:bg-gray-200 text-gray-600 rounded-b-lg border-2 border-t-0 flex items-center justify-center gap-1 ${getBorderColor()}`}
        >
          <svg
            className="w-3 h-3"
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
          Note
        </button>
      </div>

      {/* Modal Overlay */}
      {showNoteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Week {weekNumber} Note
              </h3>
              {currentLabel && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: currentLabel.color }}
                  />
                  <span>{currentLabel.name}</span>
                </div>
              )}
            </div>
            <textarea
              className="w-full text-base border-2 border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={6}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note for this week..."
              autoFocus
            />
            <div className="flex gap-3">
              <button
                className="flex-1 text-base bg-blue-500 text-white py-3 px-6 rounded-lg active:bg-blue-600 font-medium"
                onClick={handleSaveNote}
              >
                Save Note
              </button>
              <button
                className="flex-1 text-base bg-gray-200 text-gray-700 py-3 px-6 rounded-lg active:bg-gray-300 font-medium"
                onClick={handleCancelNote}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
