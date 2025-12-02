export interface Label {
  id: string;
  name: string;
  color: string;
  category: "content" | "music";
}

export interface WeekData {
  color: string;
  note: string;
}

export interface Client {
  id: string;
  name: string;
  labelId: string;
  weeks: Record<string, WeekData>; // key format: "YYYY-WW"
}

export interface Table {
  clients: Client[];
}

export interface Database {
  labels: Label[];
  tables: {
    content: Table;
    music: Table;
  };
}

export type TableType = "content" | "music";
