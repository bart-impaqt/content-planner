import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Database, Label } from "@/types";

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
    const { name, color, category } = body;

    const data = await readDatabase();
    const newLabel: Label = {
      id: String(Date.now()),
      name,
      color,
      category: category || "content",
    };

    data.labels.push(newLabel);

    await writeDatabase(data);
    return NextResponse.json(newLabel);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add label" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, color, category } = body;

    const data = await readDatabase();
    const label = data.labels.find((l) => l.id === id);

    if (!label) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 });
    }

    if (name !== undefined) label.name = name;
    if (color !== undefined) label.color = color;
    if (category !== undefined) label.category = category;

    await writeDatabase(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update label" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    const data = await readDatabase();

    // Find the label to get its color before deletion
    const labelToDelete = data.labels.find((l) => l.id === id);

    if (labelToDelete) {
      const colorToReset = labelToDelete.color;

      // Reset all week colors that match this label's color to default
      ["content", "music"].forEach((tableType) => {
        data.tables[tableType as "content" | "music"].clients.forEach(
          (client) => {
            Object.keys(client.weeks).forEach((weekKey) => {
              if (client.weeks[weekKey].color === colorToReset) {
                client.weeks[weekKey].color = "";
              }
            });
          }
        );
      });
    }

    // Remove the label
    data.labels = data.labels.filter((l) => l.id !== id);

    await writeDatabase(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete label" },
      { status: 500 }
    );
  }
}
