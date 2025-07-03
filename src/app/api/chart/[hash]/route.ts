import { NextRequest, NextResponse } from "next/server";
import { generateChartHash } from "@/utils/chartUtils";

export async function GET() {
  try {
    // In a production environment, you would store this mapping in a database
    // For now, we'll return a 404 since we don't have server-side storage
    // The client-side implementation in the page component will handle this

    return NextResponse.json({ error: "Chart not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { birthDate, birthTime, city } = await request.json();

    if (!birthDate || !birthTime || !city) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const hash = generateChartHash(birthDate, birthTime, city);

    // In a production environment, you would store this mapping in a database
    // For now, we'll just return the hash

    return NextResponse.json({ hash });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
