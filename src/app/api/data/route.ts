import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Database } from "@/types";

const DATA_DOC_ID = "main";

// Initialize empty database structure
function createEmptyDatabase(): Database {
  return {
    labels: [],
    tables: {
      content: { clients: [] },
      music: { clients: [] },
    },
  };
}

async function readDatabase(): Promise<Database> {
  const docRef = doc(db, "weekOfYears", DATA_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Database;
  } else {
    const emptyDb = createEmptyDatabase();
    await setDoc(docRef, emptyDb);
    return emptyDb;
  }
}

async function writeDatabase(data: Database): Promise<void> {
  const docRef = doc(db, "weekOfYears", DATA_DOC_ID);
  await setDoc(docRef, data);
}

export async function GET() {
  try {
    const data = await readDatabase();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Firebase GET error:", error);
    return NextResponse.json(
      { error: "Failed to read database" },
      { status: 500 }
    );
  }
}
