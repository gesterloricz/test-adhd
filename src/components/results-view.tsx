import { useState } from "react"
import { CheckCircle2, AlertTriangle, RotateCcw, TrendingUp, FileText, ChevronRight, BarChart3, BrainCircuit } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { ClassificationResult } from "../types"

// static data for basline results
const BASELINE_RESULTS_STATIC: ClassificationResult[] = [
  {
    filename: "sample001.pdf",
    classification: "ADHD Detected",
    confidence: 92.5,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.89,
    topFeatures: [
      { name: "Theta/Beta Ratio", value: 0.45 },
      { name: "Delta Power", value: 0.32 },
      { name: "Spectral Entropy", value: 0.18 }
    ]
  },
  {
    filename: "sample002.pdf",
    classification: "Control (No ADHD)",
    confidence: 89.2,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.89,
    topFeatures: [
      { name: "Alpha Peak", value: 0.41 },
      { name: "Beta Power", value: 0.28 },
      { name: "Theta Power", value: 0.15 }
    ]
  },
  {
    filename: "sample003.pdf",
    classification: "ADHD Detected",
    confidence: 94.1,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.89,
    topFeatures: [
      { name: "Theta/Beta Ratio", value: 0.48 },
      { name: "Delta Power", value: 0.29 },
      { name: "Coherence", value: 0.12 }
    ]
  },
  {
    filename: "sample004.pdf",
    classification: "ADHD Detected",
    confidence: 85.4,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.89,
    topFeatures: [
      { name: "Theta/Beta Ratio", value: 0.38 },
      { name: "Delta Power", value: 0.25 },
      { name: "Coherence", value: 0.19 }
    ]
  },
  {
    filename: "sample005.pdf",
    classification: "Control (No ADHD)",
    confidence: 98.0,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.89,
    topFeatures: [
      { name: "Alpha Peak", value: 0.55 },
      { name: "Beta Power", value: 0.22 },
      { name: "Theta Power", value: 0.11 }
    ]
  }
]

interface ResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function ResultsView({ onNewAnalysis, results }: ResultsViewProps) {
  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ResultColumn
          title="Baseline Model"
          description="Standard XGBoost (n_estimators=100)"
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
          results={BASELINE_RESULTS_STATIC}
          isBaseline={true}
        />

        <ResultColumn
          title="Proposed Model"
          description="Optimized XGBoost (DART + IBL)"
          icon={<BrainCircuit className="w-5 h-5 text-primary" />}
          results={results}
          isBaseline={false}
          onNewAnalysis={onNewAnalysis}
        />

      </div>
    </div>
  )
}

interface ResultColumnProps {
  title: string
  description: string
  icon: React.ReactNode
  results: ClassificationResult[]
  isBaseline: boolean
  onNewAnalysis?: () => void
}

function ResultColumn({ title, description, icon, results, onNewAnalysis }: ResultColumnProps) {
  const [selectedResult, setSelectedResult] = useState<ClassificationResult | null>(null)

  const adhdCount = results.filter((r) => r.classification === "ADHD Detected").length
  const controlCount = results.filter((r) => r.classification === "Control (No ADHD)").length

  return (
    <Card className="flex flex-col h-full border-2 shadow-sm transition-all bg-card border-primary/20">
      <CardHeader className="pb-4 min-h-[88px] flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {onNewAnalysis ? (
          <Button size="sm" onClick={onNewAnalysis} className="shrink-0 ml-2">
            <RotateCcw className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        ) : (
          <div className="h-9 w-0" />
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg border text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
            <p className="text-2xl font-bold">{results.length}</p>
          </div>
          <div className="p-3 bg-orange-500/10 border border-orange-200/50 dark:border-orange-900/30 rounded-lg text-center">
            <p className="text-[10px] text-orange-600/80 dark:text-orange-400 uppercase tracking-wider font-semibold">ADHD</p>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{adhdCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-lg text-center">
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400 uppercase tracking-wider font-semibold">Control</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{controlCount}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground/80 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Analyzed Files
          </h3>
          <div className="h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {results.map((result, idx) => {
              const isSelected = selectedResult?.filename === result.filename
              const isADHD = result.classification === "ADHD Detected"

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedResult(result)}
                  className={`w-full p-3 rounded-md border text-left transition-all hover:bg-muted/50 ${isSelected
                    ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                    : "bg-background border-border"
                    }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium truncate max-w-[150px]">{result.filename}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isADHD
                      ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                      }`}>
                      {isADHD ? "ADHD" : "Control"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Conf: {result.confidence.toFixed(1)}%</span>
                    {isSelected && <ChevronRight className="w-3 h-3 text-primary animate-in slide-in-from-left-1" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-4 border-t">
          {!selectedResult ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">Select a file to view feature analysis</p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className={`p-3 rounded-md border flex items-center gap-3 ${selectedResult.classification === "ADHD Detected"
                ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50"
                : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                }`}>
                {selectedResult.classification === "ADHD Detected"
                  ? <AlertTriangle className="w-5 h-5 text-orange-600" />
                  : <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                }
                <div>
                  <p className="text-sm font-bold leading-none text-foreground">
                    {selectedResult.classification}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Detailed analysis for {selectedResult.filename}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Confidence</span>
                  <span className="font-bold">{selectedResult.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={selectedResult.confidence} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Top Features (SHAP)</p>
                <div className="grid gap-2">
                  {selectedResult.topFeatures.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/40 border text-xs">
                      <span className="text-muted-foreground truncate max-w-[120px]" title={feature.name}>
                        {feature.name}
                      </span>
                      <span className="font-mono font-medium">{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Model Accuracy
                </p>
                <p className="text-2xl font-bold text-foreground">{selectedResult.accuracy}%</p>
              </div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  )
}