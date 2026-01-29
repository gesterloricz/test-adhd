import { 
  Activity, Settings, BarChart3, FileText, Waves, Database 
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const FEATURES = [
  {
    icon: Activity,
    title: "DART Optimization",
    description: "Uses Dropout Additive Regression Trees (DART) to prevent overfitting by randomly dropping trees during the training process.",
  },
  {
    icon: Settings,
    title: "Influence-Balanced Loss",
    description: "Incorporates IBL to re-weight training samples based on difficulty, addressing the severe class imbalance in ADHD datasets.",
  },
  {
    icon: BarChart3,
    title: "Spectral Feature Extraction",
    description: "Calculates Power Spectral Density (PSD) and Spectral Entropy to capture the complexity and energy distribution of signals.",
  },
  {
    icon: Waves,
    title: "Sub-band Decomposition",
    description: "Decomposes raw EEG signals into five standard frequency bands (Delta, Theta, Alpha, Beta, Gamma) using Butterworth filters.",
  },
  {
    icon: Database,
    title: "Dual-Dataset Validation",
    description: "Validated on both the controlled IEEE DataPort dataset and the large-scale, highly imbalanced Healthy Brain Network (HBN) dataset.",
  },
  {
    icon: FileText,
    title: "Model Interpretability",
    description: "Provides feature importance scores (SHAP-based) to explain which brain regions and frequency bands influenced the diagnosis.",
  },
]

export default function Features() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-muted/50 py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 mb-10 text-center md:mb-12">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">Technical Contributions</h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
            Key innovations implemented in this study to improve classification accuracy and robustness.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <Card 
              key={index} 
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-background shadow-sm transition-all hover:-translate-y-1 hover:shadow-md fill-mode-both"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}