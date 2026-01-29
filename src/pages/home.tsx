import { Link } from "react-router-dom"
import { ArrowRight, Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col">
      <section className="flex flex-1 flex-col justify-center border-b bg-muted/30 py-16 md:py-32">
        <div className="mx-auto max-w-5xl space-y-10 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-800 ease-out text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-6xl">
              Optimized XGBoost with DART and <br className="hidden lg:block" />
              Influence-Balanced Loss
            </h1>
            
            <p className="animate-in fade-in slide-in-from-bottom-4 duration-800 delay-200 ease-out mx-auto max-w-3xl leading-relaxed text-muted-foreground text-lg sm:text-xl fill-mode-both">
              An advanced machine learning approach for <strong>ADHD Classification</strong> utilizing EEG signals, designed to reduce overfitting and handle class imbalance effectively.
            </p>
            
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-800 delay-300 ease-out flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row fill-mode-both">
              <Button size="lg" className="h-12 w-full gap-2 px-8 text-base transition-transform hover:scale-105 sm:w-auto" asChild>
                <Link to="/demo">
                  Try the Demo <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 w-full gap-2 px-8 text-base transition-transform hover:scale-105 sm:w-auto" asChild>
                <a href="https://github.com/gesterloricz/test-adhd" target="_blank" rel="noreferrer">
                  GitHub Repository <Github className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="animate-in fade-in zoom-in-95 duration-1000 delay-500 pt-8 fill-mode-both">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Research Team</p>
            <div className="flex flex-wrap items-center justify-center gap-4 gap-y-2 text-sm font-medium text-foreground/80 sm:gap-x-6">
              <span className="hover:text-primary transition-colors cursor-default">Abunda, K.</span>
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              <span className="hover:text-primary transition-colors cursor-default">Gerona, R.</span>
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              <span className="hover:text-primary transition-colors cursor-default">Lorica, G.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-12 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 space-y-6 fill-mode-both">
            <h3 className="border-l-4 border-primary pl-4 text-xl font-bold tracking-tight sm:text-2xl">Overview</h3>
            <p className="text-base leading-loose text-muted-foreground sm:text-lg">
              Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder characterized by persistent patterns of inattention, hyperactivity, and impulsivity. Despite its prevalence, diagnosis remains largely subjective. This study introduces a robust classification framework using <strong>Electroencephalogram (EEG)</strong> data. By integrating <strong>Dropout Additive Regression Trees (DART)</strong> within the XGBoost architecture and employing <strong>Influence-Balanced Loss (IBL)</strong>, our model addresses key challenges in medical data analysis: overfitting and dataset imbalance.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}