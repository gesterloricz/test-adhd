import { Link } from "react-router-dom"
import { ArrowRight, Github } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col">
      <section className="flex flex-1 flex-col justify-center border-b bg-muted/30 py-21 px-4 md:px-8 md:py-32">
        <div className="mx-auto max-w-5xl space-y-10 px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <h1 className="animate-in fade-in slide-in-from-bottom-4 duration-800 ease-out text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl md:text-6xl">
              Optimized XGBoost EEG Classification with DART and Influence-Balanced Loss
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-4 duration-800 delay-200 ease-out mx-auto max-w-3xl leading-relaxed text-muted-foreground text-sm sm:text-md fill-mode-both">
              An optimized <strong>XGBoost ADHD classification</strong> using EEG data by integrating <strong>Dropout Additive Regression Trees (DART) </strong> and <strong>Influence-Balanced Loss(IBL)</strong>, improving generalization to nonlinear patterns, reducing overfitting and enhancing the performance under class-imbalance datasets.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-800 delay-300 ease-out flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row fill-mode-both">
              <Button size="lg" className="h-12 w-full gap-2 px-8 text-base transition-transform hover:scale-105 sm:w-auto" asChild>
                <Link to="/demo">
                  Try Demo <ArrowRight className="h-4 w-4" />
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
        <div className="mx-auto max-w-4xl sm:px-6 lg:px-8  px-4 md:px-8 md:py-32">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 space-y-6 fill-mode-both">
            <h3 className="border-l-4 border-primary pl-4 text-xl font-bold tracking-tight sm:text-2xl">Overview</h3>
            <p className=" leading-loose text-muted-foreground text-sm sm:text-md ">
              Attention-Deficit/Hyperactivity Disorder (ADHD) is a neurodevelopmental condition characterized by persistent patterns of inattention, hyperactivity, and impulsivity. Despite its prevalence, diagnosis often relies on subjective assessments, highlighting the need for more objective and reliable methods. This study aims to improve the generalization performance of XGBoost for more accurate ADHD classification using <strong>Electroencephalography (EEG)</strong> data. To achieve this, the model integrates <strong>Dropout Meet Multiple Additive Regression Trees (DART)</strong> and <strong>Influence-Balanced Loss (IBL)</strong>. This approach addresses key limitations of traditional XGBoost in EEG classification, including inadequate generalization to highly nonlinear EEG patterns, overfitting in noisy conditions, and decreased performance on class-imbalanced datasets. By overcoming these challenges, the proposed framework enhances the reliability and effectiveness of ADHD detection.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}