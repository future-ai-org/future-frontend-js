import { NextResponse } from "next/server";
import strings from "../../../i18n/api.json";
import { ASTRO_NOW_ENDPOINT, REQUEST_TIMEOUT, CACHE_DURATION, SECURITY_HEADERS, USER_AGENT } from "../../../config/routes";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_ASTRO_SERVICE_URL) {
    console.error(strings.en.astro.missingEnvVar);
    return NextResponse.json(
      { error: strings.en.astro.error },
      { status: 500 },
    );
  }

  const url = `${process.env.NEXT_PUBLIC_ASTRO_SERVICE_URL}${ASTRO_NOW_ENDPOINT}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMessage = strings.en.astro.httpError.replace(
        "{status}",
        response.status.toString(),
      );
      console.error(errorMessage, { status: response.status, url });
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_DURATION}`,
        ...SECURITY_HEADERS,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.error(strings.en.astro.timeoutLog, { url });
        return NextResponse.json(
          { error: strings.en.astro.timeoutError },
          { status: 408 },
        );
      }
      
      console.error(strings.en.astro.consoleError, {
        error: error.message,
        url,
        stack: error.stack,
      });
    } else {
      console.error(strings.en.astro.consoleError, { error, url });
    }
    
    return NextResponse.json(
      { error: strings.en.astro.error },
      { status: 500 },
    );
  }
}
