import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Database } from "@/types";

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
    const { tableType, clientId, weekKey, color, note } = body;

    const data = await readDatabase();
    const client = data.tables[tableType as "content" | "music"].clients.find(
      (c) => c.id === clientId
    );

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (!client.weeks[weekKey]) {
      client.weeks[weekKey] = { color: "", note: "" };
    }

    if (color !== undefined) {
      client.weeks[weekKey].color = color;
    }

    if (note !== undefined) {
      client.weeks[weekKey].note = note;
    }

    await writeDatabase(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update week" },
      { status: 500 }
    );
  }
}
