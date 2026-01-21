import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github } from "lucide-react"
import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)]">

      <section className="py-16 md:py-32 bg-muted/30 border-b flex-1 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
              Optimized XGBoost with DART and <br className="hidden lg:block" />
              Influence-Balanced Loss
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              An advanced machine learning approach for <strong>ADHD Classification</strong> utilizing EEG signals, designed to reduce overfitting and handle class imbalance effectively.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base gap-2" asChild>
                <Link to="/demo">
                  Try the Demo <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base gap-2" asChild>
                <a href="https://github.com/gesterloricz/test-adhd" target="_blank" rel="noreferrer">
                  GitHub Repository <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Research Team</p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
              <span>Abunda, K.</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>Gerona, R.</span>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <span>Lorica, G.</span>
            </div>
          </div>

        </div>
      </section>

      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight border-l-4 border-primary pl-4">Overview</h3>
            <p className="text-muted-foreground leading-loose text-base sm:text-lg">
              Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental disorder characterized by persistent patterns of inattention, hyperactivity, and impulsivity. Despite its prevalence, diagnosis remains largely subjective. This study introduces a robust classification framework using <strong>Electroencephalogram (EEG)</strong> data. By integrating <strong>Dropout Additive Regression Trees (DART)</strong> within the XGBoost architecture and employing <strong>Influence-Balanced Loss (IBL)</strong>, our model addresses key challenges in medical data analysis: overfitting and dataset imbalance.
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}