import { useState } from "react"
import { CheckCircle2, AlertTriangle, RotateCcw, TrendingUp, FileText, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { ClassificationResult } from "../types"

interface ResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function ResultsView({ onNewAnalysis, results }: ResultsViewProps) {
  const [selectedResult, setSelectedResult] = useState<ClassificationResult | null>(null)

  const adhdCount = results.filter((r) => r.classification === "ADHD Detected").length
  const controlCount = results.filter((r) => r.classification === "Control (No ADHD)").length

  return (
    <div className="w-full">
      <Card className="p-4 sm:p-6 bg-card border-border shadow-sm">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-foreground">Output / Results Section</h2>
          <Button variant="outline" size="sm" onClick={onNewAnalysis} className="w-full sm:w-auto">
            <RotateCcw className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </div>

        {/* Responsive Grid for Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-muted/50 border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Files</p>
            <p className="text-2xl font-bold text-foreground">{results.length}</p>
          </Card>
          <Card className="p-4 bg-orange-500/10 border-orange-200 dark:border-orange-900/30">
            <p className="text-xs text-muted-foreground mb-1">ADHD Detected</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{adhdCount}</p>
          </Card>
          <Card className="p-4 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/30">
            <p className="text-xs text-muted-foreground mb-1">Control (No ADHD)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{controlCount}</p>
          </Card>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Batch Classification Results</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {results.map((result, idx) => {
              const isADHD = result.classification === "ADHD Detected"
              const isSelected = selectedResult?.filename === result.filename

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedResult(result)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${isSelected
                      ? "bg-primary/5 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-muted-foreground mt-1 sm:mt-0 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-[250px]">
                          {result.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">Confidence: {result.confidence.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pl-8 sm:pl-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isADHD
                            ? "bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                          }`}
                      >
                        {result.classification}
                      </span>
                      <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {!selectedResult && (
          <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed border-border">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select a file from the batch results above to view detailed analysis
            </p>
          </div>
        )}

        {selectedResult && (
          <div className="animate-in fade-in zoom-in-95 duration-300 space-y-6">

            <div
              className={`p-4 sm:p-6 rounded-lg border-2 ${selectedResult.classification === "ADHD Detected"
                  ? "bg-orange-50/50 border-orange-100 dark:bg-orange-950/10 dark:border-orange-900/30"
                  : "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30"
                }`}
            >
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div
                  className={`p-3 rounded-full ${selectedResult.classification === "ADHD Detected" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"
                    }`}
                >
                  {selectedResult.classification === "ADHD Detected" ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{selectedResult.classification}</h3>
                  <p className="text-sm text-muted-foreground mb-4 break-all">
                    Detailed analysis for <span className="font-mono text-foreground">{selectedResult.filename}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Confidence Score:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-foreground">{selectedResult.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-lg border border-border bg-card">
              <h3 className="text-sm font-semibold text-foreground mb-4">Confidence Visualization</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <Progress value={selectedResult.confidence} className="h-4" />
                <div className="flex justify-between text-xs font-medium pt-1">
                  <span className="text-foreground">Confidence</span>
                  <span className="text-muted-foreground">Uncertainty</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 p-4 sm:p-6 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">Top Influential Features (SHAP)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedResult.topFeatures.map((feature, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-md border border-border flex justify-between sm:block items-center">
                      <p className="text-xs text-muted-foreground sm:mb-1">{feature.name}</p>
                      <p className="text-lg font-mono font-semibold text-foreground">{feature.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 sm:p-6 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2">Model Architecture</p>
                <p className="text-lg font-semibold text-foreground">{selectedResult.modelUsed}</p>
              </div>

              <div className="p-4 sm:p-6 rounded-lg border border-border bg-card">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Model Accuracy
                </p>
                <p className="text-2xl font-bold text-foreground">{selectedResult.accuracy}%</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}