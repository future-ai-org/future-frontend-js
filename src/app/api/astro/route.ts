import { NextResponse } from "next/server";
import strings from "../../../i18n/api.json";

const ASTRO_NOW_ENDPOINT = "/v1/now";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ASTRO_SERVICE_URL}` + ASTRO_NOW_ENDPOINT,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        strings.en.astro.httpError.replace(
          "{status}",
          response.status.toString(),
        ),
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(strings.en.astro.consoleError, error);
    return NextResponse.json(
      { error: strings.en.astro.error },
      { status: 500 },
    );
  }
}
