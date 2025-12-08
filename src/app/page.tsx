"use client";

import { useEffect, useState, useRef } from "react";
import { Database, Client, TableType, Label } from "@/types";
import ClientRow from "@/components/ClientRow";
import LabelColumn from "@/components/LabelColumn";
import AddClientButton from "@/components/AddClientButton";
import {
  getCurrentWeekKey,
  generateWeekRange,
  getCurrentWeek,
  getCurrentYear,
} from "@/utils/weekUtils";

interface TableSectionProps {
  title: string;
  tableType: TableType;
  clients: Client[];
  labels: Label[];
  weekKeys: string[];
  currentWeekKey: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  updateWeek: (
    tableType: TableType,
    clientId: string,
    weekKey: string,
    color?: string,
    note?: string
  ) => void;
  deleteClient: (tableType: TableType, clientId: string) => void;
  updateClient: (
    tableType: TableType,
    clientId: string,
    name: string
  ) => void;
  addClient: (tableType: TableType, name: string) => void;
}

function TableSection({
  title,
  tableType,
  clients,
  labels,
  weekKeys,
  currentWeekKey,
  scrollRef,
  updateWeek,
  deleteClient,
  updateClient,
  addClient,
}: TableSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col max-h-[75vh]">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
      </div>

      <div className="p-6 space-y-3 overflow-y-auto flex-1" ref={scrollRef}>
        {clients.map((client) => (
          <ClientRow
            key={client.id}
            client={client}
            labels={labels}
            weekKeys={weekKeys}
            currentWeekKey={currentWeekKey}
            tableType={tableType}
            onWeekUpdate={(clientId, weekKey, color, note) =>
              updateWeek(tableType, clientId, weekKey, color, note)
            }
            onDelete={(clientId) => deleteClient(tableType, clientId)}
            onUpdateName={(clientId, name) =>
              updateClient(tableType, clientId, name)
            }
          />
        ))}

        <AddClientButton onAdd={(name) => addClient(tableType, name)} />
      </div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<Database | null>(null);
  const [currentWeekKey, setCurrentWeekKey] = useState("");
  const [weekKeys, setWeekKeys] = useState<string[]>([]);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const musicScrollRef = useRef<HTMLDivElement>(null);
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(
    new Set()
  );

  const loadData = async () => {
    const response = await fetch("/api/data");

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    
    const data = await response.json();
    setData(data);
  };

  useEffect(() => {
    loadData();
    const weekKey = getCurrentWeekKey();
    setCurrentWeekKey(weekKey);

    // Load dismissed toasts from localStorage
    const today = new Date().toDateString();
    const stored = localStorage.getItem(`dismissedToasts-${today}`);
    if (stored) {
      setDismissedToasts(new Set(JSON.parse(stored)));
    }

    // Generate weeks: current week first, then future weeks, then past weeks
    const currentWeek = getCurrentWeek();
    const currentYear = getCurrentYear();

    // Generate current + 10 future weeks
    const futureWeeks = generateWeekRange(currentWeek, currentYear, 11);

    // Generate 10 past weeks (in reverse, then reverse the array)
    const startWeek = currentWeek - 10;
    const startYear = startWeek < 1 ? currentYear - 1 : currentYear;
    const adjustedStartWeek = startWeek < 1 ? 52 + startWeek : startWeek;
    const pastWeeks = generateWeekRange(adjustedStartWeek, startYear, 10);

    // Combine: past weeks first (oldest -> recent), then current + future weeks
    const weeks = [...pastWeeks, ...futureWeeks];
    setWeekKeys(weeks);
  }, []);

  const updateWeek = async (
    tableType: TableType,
    clientId: string,
    weekKey: string,
    color?: string,
    note?: string
  ) => {
    // Optimistically update local state so the whole UI
    // doesn't feel like it "refreshes" on each click.
    setData((prev) => {
      if (!prev) return prev;

      const table = prev.tables[tableType];
      const clientIndex = table.clients.findIndex((c) => c.id === clientId);
      if (clientIndex === -1) return prev;

      const client = table.clients[clientIndex];
      const weeks = { ...client.weeks };
      const currentWeek = weeks[weekKey] || { color: "", note: "" };

      const updatedWeek = {
        ...currentWeek,
        ...(color !== undefined ? { color } : {}),
        ...(note !== undefined ? { note } : {}),
      };

      weeks[weekKey] = updatedWeek;

      const updatedClient = { ...client, weeks };
      const updatedClients = [...table.clients];
      updatedClients[clientIndex] = updatedClient;

      return {
        ...prev,
        tables: {
          ...prev.tables,
          [tableType]: {
            ...table,
            clients: updatedClients,
          },
        },
      };
    });

    await fetch("/api/week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableType, clientId, weekKey, color, note }),
    });
  };

  const addClient = async (tableType: TableType, name: string) => {
    await fetch("/api/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableType, name }),
    });
    loadData();
  };

  const deleteClient = async (tableType: TableType, clientId: string) => {
    await fetch("/api/client", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableType, clientId }),
    });
    loadData();
  };

  const addLabel = async (
    name: string,
    color: string,
    category: "content" | "music"
  ) => {
    await fetch("/api/label", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color, category }),
    });
    loadData();
  };

  const updateLabel = async (
    id: string,
    name: string,
    color: string,
    category: "content" | "music"
  ) => {
    await fetch("/api/label", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, color, category }),
    });
    loadData();
  };

  const deleteLabel = async (id: string) => {
    await fetch("/api/label", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadData();
  };

  const updateClient = async (
    tableType: TableType,
    clientId: string,
    name: string
  ) => {
    await fetch("/api/client", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableType, clientId, name }),
    });
    loadData();
  };

  // Get clients without status for next week
  const getClientsWithoutCurrentWeekStatus = () => {
    if (!data) return [];

    const clientsWithoutStatus: { client: Client; tableType: TableType }[] = [];

    // Calculate next week key
    const [year, week] = currentWeekKey.split("-").map(Number);
    const nextWeek = week + 1;
    const nextYear = nextWeek > 52 ? year + 1 : year;
    const nextWeekNumber = nextWeek > 52 ? 1 : nextWeek;
    const nextWeekKey = `${nextYear}-${String(nextWeekNumber).padStart(
      2,
      "0"
    )}`;

    ["content", "music"].forEach((type) => {
      const tableType = type as TableType;
      data.tables[tableType].clients.forEach((client) => {
        const nextWeekData = client.weeks[nextWeekKey];
        const hasStatus =
          nextWeekData &&
          nextWeekData.color &&
          nextWeekData.color !== "" &&
          nextWeekData.color !== "#f3f4f6";

        if (!hasStatus && !dismissedToasts.has(client.id)) {
          clientsWithoutStatus.push({ client, tableType });
        }
      });
    });

    return clientsWithoutStatus;
  };

  const dismissToast = (clientId: string) => {
    const newDismissed = new Set(dismissedToasts);
    newDismissed.add(clientId);
    setDismissedToasts(newDismissed);

    // Store in localStorage with today's date
    const today = new Date().toDateString();
    localStorage.setItem(
      `dismissedToasts-${today}`,
      JSON.stringify(Array.from(newDismissed))
    );
  };

  const clientsWithoutStatus = data ? getClientsWithoutCurrentWeekStatus() : [];

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Get today's date information
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="h-screen bg-linear-to-br overflow-hidden from-gray-50 to-gray-100">
      <div className="max-w-[2000px] mx-auto p-8 h-full">
        {/* Prominent Date Display */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                Week {getCurrentWeek()}
              </h1>
              <p className="text-2xl font-light opacity-90">{dateString}</p>
              <p className="text-lg font-medium mt-1 opacity-75">
                Year {getCurrentYear()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-7xl font-bold opacity-20">
                {getCurrentWeek()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 h-full">
          <LabelColumn
            labels={data.labels}
            category="content"
            onAddLabel={addLabel}
            onUpdateLabel={updateLabel}
            onDeleteLabel={deleteLabel}
          />

          <TableSection
            title="Content"
            tableType="content"
            clients={data.tables.content.clients}
            scrollRef={contentScrollRef}
            labels={data.labels}
            weekKeys={weekKeys}
            currentWeekKey={currentWeekKey}
            updateWeek={updateWeek}
            deleteClient={deleteClient}
            updateClient={updateClient}
            addClient={addClient}
          />

          <TableSection
            title="Music"
            tableType="music"
            clients={data.tables.music.clients}
            scrollRef={musicScrollRef}
            labels={data.labels}
            weekKeys={weekKeys}
            currentWeekKey={currentWeekKey}
            updateWeek={updateWeek}
            deleteClient={deleteClient}
            updateClient={updateClient}
            addClient={addClient}
          />

          <LabelColumn
            labels={data.labels}
            category="music"
            onAddLabel={addLabel}
            onUpdateLabel={updateLabel}
            onDeleteLabel={deleteLabel}
          />
        </div>
      </div>

      {/* Toast Notifications */}
      {clientsWithoutStatus.length > 0 && (
        <div
          className="fixed bottom-8 right-8 space-y-3"
          style={{ zIndex: 9999 }}
        >
          {clientsWithoutStatus.map(({ client, tableType }) => (
            <div
              key={client.id}
              onClick={() => dismissToast(client.id)}
              className="bg-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl cursor-pointer hover:bg-orange-600 transition-colors flex items-center gap-4 min-w-[320px]"
            >
              <div className="flex-1">
                <div className="font-bold text-lg mb-1">{client.name}</div>
                <div className="text-sm opacity-90">
                  Geen status voor week {getCurrentWeek() + 1} ({tableType})
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Klik om te sluiten
                </div>
              </div>
              <svg
                className="w-6 h-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
