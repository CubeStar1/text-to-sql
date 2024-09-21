// import NaturalLanguageQueryInput from "./components/NaturalLanguageQueryInput";
import NaturalLanguageQueryInput from "./components/QueryInput";

export default function Home() {
  return (
    <div className="container mx-auto py-8 max-w-10xl">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Natural Language Database Query</h1>
        <p className="text-xl">Query your database using natural language</p>
      </header>
      
      <main className="space-y-8">
        <NaturalLanguageQueryInput />
      </main>
      
      <footer className="text-center mt-8 text-sm text-muted-foreground">
        Powered by Next.js, SQLite, and OpenAI
      </footer>
    </div>
  );
}
