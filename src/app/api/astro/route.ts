import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://service-advanced-astro.vercel.app/api/v1/now",
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
