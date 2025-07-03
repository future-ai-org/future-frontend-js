import { NextRequest, NextResponse } from "next/server";
import { generateChartHash } from "@/utils/chartUtils";
import { API_ERRORS } from "@/config/routes";

export async function GET() {
  try {
    // TODO: In a production environment, you would store this mapping in a database

    return new NextResponse(null, { status: 404 });
  } catch {
    return NextResponse.json(
      { error: API_ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { birthDate, birthTime, city } = await request.json();

    if (!birthDate || !birthTime || !city) {
      return NextResponse.json(
        { error: API_ERRORS.MISSING_REQUIRED_FIELDS },
        { status: 400 },
      );
    }

    const hash = generateChartHash(birthDate, birthTime, city);

    // TODO: In a production environment, you would store this mapping in a database

    return NextResponse.json({ hash });
  } catch {
    return NextResponse.json(
      { error: API_ERRORS.INTERNAL_SERVER_ERROR },
      { status: 500 },
    );
  }
}
