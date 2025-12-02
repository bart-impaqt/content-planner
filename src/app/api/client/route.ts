import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Database, Client } from "@/types";

const DATA_DOC_ID = "main";

async function readDatabase(): Promise<Database> {
  const docRef = doc(db, "weekOfYears", DATA_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Database not found");
  }

  return docSnap.data() as Database;
}

async function writeDatabase(data: Database): Promise<void> {
  const docRef = doc(db, "weekOfYears", DATA_DOC_ID);
  await setDoc(docRef, data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableType, name, labelId = "" } = body;

    const data = await readDatabase();
    const newClient: Client = {
      id: `${tableType[0]}${Date.now()}`,
      name,
      labelId: labelId || "",
      weeks: {},
    };

    data.tables[tableType as "content" | "music"].clients.push(newClient);

    await writeDatabase(data);
    return NextResponse.json(newClient);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add client" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { tableType, clientId, name } = body;

    const data = await readDatabase();
    const table = data.tables[tableType as "content" | "music"];
    const client = table.clients.find((c) => c.id === clientId);

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    client.name = name;

    await writeDatabase(data);
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { tableType, clientId } = body;

    const data = await readDatabase();
    const table = data.tables[tableType as "content" | "music"];
    table.clients = table.clients.filter((c) => c.id !== clientId);

    await writeDatabase(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
