import { useEffect, useState } from "react"
import { Loader2, CheckCircle2, Circle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const PROCESSING_STEPS = [
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

interface ProcessingStatusPanelProps {
  onComplete: () => void
}

export default function ProcessingStatusPanel({ onComplete }: ProcessingStatusPanelProps) {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (currentStep < PROCESSING_STEPS.length) {
      const duration = PROCESSING_STEPS[currentStep]?.duration || 1000
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
      }, duration)
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
      <Card className="border-border bg-card p-4 shadow-sm sm:p-8">
        <div className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Processing Status</h2>
          </div>
          <p className="text-sm text-muted-foreground">Running classification pipeline on uploaded EEG data</p>
        </div>

        <div className="space-y-3">
          {PROCESSING_STEPS.map((step, index) => {
            const isComplete = index < currentStep
            const isCurrent = index === currentStep
            const isPending = index > currentStep

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-all sm:gap-4 sm:p-4",
                  isCurrent ? "bg-primary/5 border-primary" : "bg-muted/20 border-border"
                )}
              >
                <div className="mt-0.5 w-8 flex-shrink-0 text-center">
                  {isComplete && <CheckCircle2 className="mx-auto h-6 w-6 text-green-500" />}
                  {isCurrent && <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}
                  {isPending && <Circle className="mx-auto h-6 w-6 text-muted-foreground" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Step {step.id}</span>
                    <p
                      className={cn(
                        "font-semibold text-sm",
                        isComplete && "text-green-600",
                        isCurrent && "text-primary",
                        isPending && "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </p>
                  </div>
                  <p className="break-words text-xs text-muted-foreground">{step.description}</p>
                </div>

                <div className="flex-shrink-0">
                  {isComplete && (
                    <span className="hidden rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 sm:inline-block">
                      ✓ Complete
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Processing...
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-foreground">
              {Math.round((currentStep / PROCESSING_STEPS.length) * 100)}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / PROCESSING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}