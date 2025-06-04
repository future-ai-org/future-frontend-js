import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASTRO_SERVICE_URL}/v1/now`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching astro data:", error);
    return NextResponse.json(
      { error: "Failed to fetch astrological data" },
      { status: 500 },
    );
  }
}
