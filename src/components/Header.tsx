import { Brain } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 bg-muted rounded-lg p-2">
            <Brain size={32} className="text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              ADHD Classification
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Prototype Interface</p>
          </div>
        </div>
      </div>
    </header>
  )
}
