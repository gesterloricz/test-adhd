import { useState } from "react"
import { CheckCircle2, AlertTriangle, RotateCcw, TrendingUp, FileText, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { ClassificationResult } from "../App"

interface ResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function ResultsView({ onNewAnalysis, results }: ResultsViewProps) {

  const [selectedResult, setSelectedResult] = useState<ClassificationResult | null>(null)
  const adhdCount = results.filter((r) => r.result === "ADHD Detected").length
  const controlCount = results.filter((r) => r.result === "Control (No ADHD)").length

  const MOCK_METADATA = {
    modelUsed: "XGBoost",
    accuracy: 95.6,
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Output / Results Section</h2>
        <Button variant="outline" size="sm" onClick={onNewAnalysis}>
          <RotateCcw className="w-4 h-4 mr-2" /> New Analysis
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-muted/50 border-border">
          <p className="text-xs text-muted-foreground mb-1">Total Files Processed</p>
          <p className="text-2xl font-bold text-foreground">{results.length}</p>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30">
          <p className="text-xs text-muted-foreground mb-1">ADHD Detected</p>
          <p className="text-2xl font-bold text-yellow-600">{adhdCount}</p>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30">
          <p className="text-xs text-muted-foreground mb-1">Control (No ADHD)</p>
          <p className="text-2xl font-bold text-green-600">{controlCount}</p>
        </Card>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Batch Classification Results</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {results.map((result, idx) => {
            const isADHD = result.result === "ADHD Detected"
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                        {result.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">Confidence: {result.confidence.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${isADHD
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                          : "bg-green-100 text-green-700 border border-green-200"
                        }`}
                    >
                      {result.result}
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
        <>
          <div
            className={`p-6 rounded-lg border-2 mb-6 ${selectedResult.result === "ADHD Detected"
                ? "bg-yellow-50/50 border-yellow-100"
                : "bg-green-50/50 border-green-100"
              }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-full ${selectedResult.result === "ADHD Detected" ? "bg-yellow-100" : "bg-green-100"
                  }`}
              >
                {selectedResult.result === "ADHD Detected" ? (
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                ) : (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground mb-2">{selectedResult.result}</h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed analysis for {selectedResult.filename}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Confidence Score:</span>
                  <span className="text-2xl font-bold text-foreground">{selectedResult.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-sm font-semibold text-foreground mb-4">Confidence Visualization</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Certainty ({selectedResult.confidence.toFixed(1)}%)</span>
                <span>Uncertainty ({(100 - selectedResult.confidence).toFixed(1)}%)</span>
              </div>
              <Progress value={selectedResult.confidence} className="h-4" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Parameter</p>
                <p className="text-sm font-semibold text-foreground">Classification Result</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <p className="text-sm font-semibold text-foreground">{selectedResult.result}</p>
              </div>
            </div>

             <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Parameter</p>
                <p className="text-sm font-semibold text-foreground">Top Influential Features</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <div className="space-y-1">
                  {selectedResult.topFeatures.map((feature, idx) => (
                    <p key={idx} className="text-sm font-medium text-foreground">
                      {feature.name} ({feature.value}%)
                    </p>
                  ))}
                </div>
              </div>
            </div> 

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Parameter</p>
                <p className="text-sm font-semibold text-foreground">Model Used</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <p className="text-sm font-semibold text-foreground">{MOCK_METADATA.modelUsed}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Parameter</p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Accuracy (Cross-Val)
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <p className="text-sm font-bold text-primary">{MOCK_METADATA.accuracy}%</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}