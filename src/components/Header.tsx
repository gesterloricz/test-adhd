import { useState } from "react"
import { Brain, Github, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function Header() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const getLinkClass = (path: string) => 
    cn(
      "hover:text-foreground transition-colors py-2",
      location.pathname === path ? "text-foreground font-semibold" : ""
    )

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 z-50 relative">
            <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2">
              <Brain size={26} className="text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">
                ADHD Classification
              </h1>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 hidden sm:block">
                Optimized XGBoost (DART & IBL)
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 md:gap-8">
            <nav className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link to="/" className={getLinkClass("/")}>Home</Link>
              <Link to="/features" className={getLinkClass("/features")}>Features</Link>
            </nav>

            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
              <a href="https://github.com/gesterloricz/test-adhd" target="_blank" rel="noreferrer">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-4 shadow-lg animate-in slide-in-from-top-5">
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