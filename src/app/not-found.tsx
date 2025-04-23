import strings from "../i18n/404.json";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-primary">
          {strings.en.title}
        </h1>
        <h2 className="text-2xl font-semibold mb-4 text-text-primary">
          {strings.en.subtitle}
        </h2>
      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
