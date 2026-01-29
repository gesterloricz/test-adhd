import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Brain, Github, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Header() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const getLinkClass = (path: string) =>
    cn(
      "hover:text-foreground transition-colors py-2 relative",
      isActive(path) ? "text-foreground font-semibold" : ""
    )

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-top-full duration-500 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="relative z-50 flex items-center gap-3 transition-transform hover:scale-[1.02]">
            <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2">
              <Brain size={26} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">
                ADHD Classification
              </h1>
              <p className="hidden sm:block mt-1 text-[10px] font-medium text-muted-foreground">
                Optimized XGBoost (DART & IBL)
              </p>
            </div>
          </Link>

          {/* desktop navigation */}
          <div className="hidden md:flex items-center gap-6 md:gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link to="/" className={getLinkClass("/")}>Home</Link>
              <Link to="/features" className={getLinkClass("/features")}>Features</Link>
            </nav>

            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground transition-transform hover:rotate-12">
              <a href="https://github.com/gesterloricz/test-adhd" target="_blank" rel="noreferrer">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
          </div>

          {/* toggle */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* mobile navigation */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full w-full animate-in slide-in-from-top-5 border-b border-border bg-background p-4 shadow-lg md:hidden">
          <nav className="flex flex-col space-y-4 text-sm font-medium text-muted-foreground">
            <Link
              to="/"
              className={getLinkClass("/")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/features"
              className={getLinkClass("/features")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <a
              href="https://github.com/gesterloricz/test-adhd"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 py-2 hover:text-foreground"
            >
              <Github className="w-4 h-4" /> GitHub Repo
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}