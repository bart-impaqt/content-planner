import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, runTransaction } from "firebase/firestore";
import { Database } from "@/types";

const DATA_DOC_ID = "main";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableType, clientId, weekKey, color, note } = body;

    const docRef = doc(db, "weekOfYears", DATA_DOC_ID);

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef);

      if (!docSnap.exists()) {
        throw new Error("Database not found");
      }

      const data = docSnap.data() as Database;
      const client = data.tables[tableType as "content" | "music"].clients.find(
        (c) => c.id === clientId
      );

      if (!client) {
        throw new Error("Client not found");
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

      transaction.set(docRef, data);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Client not found") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update week" },
      { status: 500 }
    );
  }
}
