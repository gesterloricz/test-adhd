import { 
  Activity, 
  Settings, 
  BarChart3, 
  FileText, 
  Waves, 
  Database 
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Features() {
  const features = [
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

  return (
    <div className="py-12 md:py-24 bg-muted/50 min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Technical Contributions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
            Key innovations implemented in this study to improve classification accuracy and robustness.
          </p>
        </div>

        {/* Grid Layout Changes: 
            - Mobile: 1 column (grid-cols-1)
            - Tablet: 2 columns (md:grid-cols-2)
            - Desktop: 3 columns (lg:grid-cols-3) -> Changed from 4 to 3 to fit 6 items perfectly
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-background border-muted/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
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