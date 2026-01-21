import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, CheckCircle2, Circle } from "lucide-react"

const processingSteps = [
  {
    id: 1,
    name: "Preprocessing", 
    description: "Band-pass Filter & Sub-band Decomposition", 
    duration: 1200,
  },
  {
    id: 2,
    name: "Feature Extraction",
    description: "Power Spectral Density & Spectral Entropy",
    duration: 1500,
  },
  {
    id: 3,
    name: "Normalization", 
    description: "Z-score Feature Scaling", 
    duration: 1000,
  },
  {
    id: 4,
    name: "Classification",
    description: "Optimized XGBoost (DART + IBL)", 
    duration: 1300,
  },
  {
    id: 5,
    name: "Result Generation",
    description: "ADHD / Control Prediction",
    duration: 1000,
  },
]

interface Props {
  onComplete: () => void
}

export default function ProcessingStatusPanel({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (currentStep < processingSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, processingSteps[currentStep]?.duration || 1000)

      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep, onComplete])

  return (
    <div className="w-full">
      <Card className="p-4 sm:p-8 bg-card border-border shadow-sm">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Processing Status</h2>
          </div>
          <p className="text-sm text-muted-foreground">Running classification pipeline on uploaded EEG data</p>
        </div>

        <div className="space-y-3">
          {processingSteps.map((step, index) => {
            const isComplete = index < currentStep
            const isCurrent = index === currentStep
            const isPending = index > currentStep

            return (
              <div
                key={step.id}
                className={`
                  flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border transition-all
                  ${isCurrent ? "bg-primary/5 border-primary" : "bg-muted/20 border-border"}
                `}
              >
                <div className="flex-shrink-0 w-8 text-center mt-0.5">
                  {isComplete && <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />}
                  {isCurrent && <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />}
                  {isPending && <Circle className="w-6 h-6 text-muted-foreground mx-auto" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Step {step.id}</span>
                    <p
                      className={`
                        font-semibold text-sm
                        ${isComplete ? "text-green-600" : ""}
                        ${isCurrent ? "text-primary" : ""}
                        ${isPending ? "text-muted-foreground" : ""}
                      `}
                    >
                      {step.name}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground break-words">{step.description}</p>
                </div>

                <div className="flex-shrink-0">
                  {isComplete && (
                    <span className="hidden sm:inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">✓ Complete</span>
                  )}
                  {isCurrent && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-foreground">
              {Math.round((currentStep / processingSteps.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / processingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}