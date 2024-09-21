import { ModeToggle } from "./ModeToggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 max-w-10xl mx-auto">
        <div className="flex items-center">
          <a className="flex items-center space-x-2" href="/">
            <span className="text-xl font-bold">
              NL to SQL Query
            </span>
          </a>
        </div>
        <nav className="flex items-center">
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}