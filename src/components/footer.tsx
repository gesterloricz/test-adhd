import { Brain } from "lucide-react"
const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-border mt-auto bg-background">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground text-center sm:text-left">
          <Brain className="w-4 h-4 hidden sm:block" />
          <span>University of Mindanao - BS Computer Science {currentYear} </span>
        </div>
      </div>
    </footer>
  )
}