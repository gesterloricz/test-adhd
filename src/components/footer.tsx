import { Brain } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <Brain className="hidden h-4 w-4 sm:block" />
          <span>University of Mindanao - BS Computer Science {currentYear}</span>
        </div>
      </div>
    </footer>
  )
}