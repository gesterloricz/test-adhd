import { useState } from "react"
import {
  CheckCircle2, AlertTriangle, RotateCcw, FileText, Users,
  Loader2, TrendingUp, Activity, BarChart3, BrainCircuit, ArrowUpRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"

import type { ClassificationResult } from "../types"
import { cn } from "@/lib/utils"

// static baseline results

const MODEL_STATS = {
  baseline: {
    accuracy: 96.75,
    precision: 95.48,
    recall: 98.89,
    f1: 97.16,
    matrix: { tp: 444, tn: 331, fp: 21, fn: 5 },
    missedCases: 5,
  },
  proposed: {
    accuracy: 98.63,
    precision: 98.24,
    recall: 99.33,
    f1: 98.78,
    matrix: { tp: 446, tn: 344, fp: 8, fn: 3 },
    missedCases: 3,
  },
}

const COMPARISON_METRICS = [
  { key: "accuracy", label: "Accuracy" },
  { key: "precision", label: "Precision" },
  { key: "recall", label: "Recall" },
  { key: "f1", label: "F1-Score" },
] as const

const BASELINE_RESULTS_STATIC: ClassificationResult[] = [
  {
    filename: "sample001.pdf",
    classification: "ADHD Detected",
    confidence: 92.5,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.75,
    topFeatures: [
      { name: "Theta/Beta Ratio", value: 0.45 },
      { name: "Delta Power", value: 0.32 },
      { name: "Spectral Entropy", value: 0.18 },
    ],
  },
  {
    filename: "sample002.pdf",
    classification: "Control (No ADHD)",
    confidence: 89.2,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.75,
    topFeatures: [
      { name: "Alpha Peak", value: 0.41 },
      { name: "Beta Power", value: 0.28 },
      { name: "Theta Power", value: 0.15 },
    ],
  },
]

interface ResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function ResultsView({ onNewAnalysis, results }: ResultsViewProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isRerunning, setIsRerunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalCount = results.length
  const adhdCount = results.filter((r) => r.classification === "ADHD Detected").length
  const controlCount = results.filter((r) => r.classification === "Control (No ADHD)").length

  const getProposedResult = () => {
    if (!selectedFileName) return null
    const res = results.find((r) => r.filename === selectedFileName)
    return res ? { ...res, accuracy: MODEL_STATS.proposed.accuracy } : null
  }

  const getBaselineResult = () => {
    if (!selectedFileName) return null
    const match = BASELINE_RESULTS_STATIC.find((r) => r.filename === selectedFileName)
    
    // Fallback logic if exact match not found in static baseline set
    const index = results.findIndex((r) => r.filename === selectedFileName)
    const fallback = BASELINE_RESULTS_STATIC[index % BASELINE_RESULTS_STATIC.length] || BASELINE_RESULTS_STATIC[0]
    
    return match 
      ? { ...match, accuracy: MODEL_STATS.baseline.accuracy }
      : { ...fallback, accuracy: MODEL_STATS.baseline.accuracy }
  }

  const handleConfirmRerun = () => {
    setConfirmOpen(false)
    setIsRerunning(true)
    setTimeout(() => {
      setSelectedFileName(null)
      setIsRerunning(false)
      onNewAnalysis()
    }, 1200)
  }

  return (
    <div className={cn("w-full space-y-6 transition-opacity", isRerunning && "opacity-60 pointer-events-none")}>
      
      {/* classification summary */}
      <Card className="border-2 border-primary/10 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Classification Summary
          </CardTitle>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8" disabled={results.length === 0 || isRerunning}>
                {isRerunning ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-2 h-3.5 w-3.5" />}
                New Analysis
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start new analysis?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all current results and selected files. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmRerun}>Yes, continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryStatBox label="Total Processed" value={totalCount} />
            <SummaryStatBox label="ADHD Detected" value={adhdCount} variant="orange" />
            <SummaryStatBox label="Control Group" value={controlCount} variant="emerald" />
          </div>
        </CardContent>
      </Card>

      {/* file section */}
      <Card className="border p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Select File for Detailed Comparison</h3>
        <div className="custom-scrollbar flex max-h-[120px] flex-wrap gap-2 overflow-y-auto">
          {results.map((r) => (
            <Button
              key={r.filename}
              variant={selectedFileName === r.filename ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFileName(r.filename)}
              className="h-8 text-xs"
            >
              {r.filename}
            </Button>
          ))}
        </div>
      </Card>

      {/* model comparison grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ResultColumn
          title="Baseline Model"
          description="Standard XGBoost"
          selectedResult={getBaselineResult()}
          isBaseline={true}
          stats={MODEL_STATS.baseline}
        />
        <ResultColumn
          title="Proposed Model"
          description="Optimized XGBoost (DART + IBL)"
          selectedResult={getProposedResult()}
          isBaseline={false}
          stats={MODEL_STATS.proposed}
        />
      </div>

      {/* metrics comparison section */}
      {selectedFileName && (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-3 border-t pt-4 duration-500">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Performance Metrics Comparison</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COMPARISON_METRICS.map((metric) => {
              const baselineVal = MODEL_STATS.baseline[metric.key]
              const proposedVal = MODEL_STATS.proposed[metric.key]
              const improvement = (proposedVal - baselineVal).toFixed(2)
              
              return (
                <Card key={metric.key} className="border bg-card/50 shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <span className="font-semibold text-muted-foreground">{metric.label}</span>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <ArrowUpRight className="h-3 w-3" />
                        +{improvement}%
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-muted-foreground">Baseline</span>
                          <span className="font-mono">{baselineVal}%</span>
                        </div>
                        <Progress value={baselineVal} className="h-2 bg-muted" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold">Proposed</span>
                          <span className="font-mono font-bold">{proposedVal}%</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                           <div className="h-full rounded-full bg-primary/90" style={{ width: `${proposedVal}%` }} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryStatBox({ label, value, variant = "default" }: { label: string, value: number, variant?: "default" | "orange" | "emerald" }) {
    const styles = {
        default: { bg: "bg-muted/50", text: "text-muted-foreground", val: "" },
        orange: { bg: "bg-orange-500/10 border-orange-200/50 dark:border-orange-900/30", text: "text-orange-600 dark:text-orange-400", val: "text-orange-700 dark:text-orange-400" },
        emerald: { bg: "bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", val: "text-emerald-700 dark:text-emerald-400" },
    }
    const s = styles[variant]
    
    return (
        <div className={cn("rounded-xl border p-4 text-center", s.bg)}>
            <p className={cn("text-xs uppercase font-semibold tracking-wider", s.text)}>{label}</p>
            <p className={cn("mt-1 text-3xl font-bold", s.val)}>{value}</p>
        </div>
    )
}

interface ResultColumnProps {
  title: string
  description: string
  selectedResult: ClassificationResult | null
  isBaseline: boolean
  stats: typeof MODEL_STATS.baseline
}

function ResultColumn({ title, description, selectedResult, isBaseline, stats }: ResultColumnProps) {
  return (
    <Card className={cn("flex h-full flex-col border-2 bg-card shadow-sm transition-all", isBaseline ? "border-muted" : "border-primary/20")}>
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg text-foreground/90">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {!selectedResult ? (
          <div className="flex h-[350px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/5 p-6 text-center text-muted-foreground">
            <FileText className="mb-3 h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No File Selected</p>
            <p className="mt-1 max-w-[200px] text-xs">Click a file name above to view analysis metrics.</p>
          </div>
        ) : (
          <Tabs defaultValue="result" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="result">Result</TabsTrigger>
              <TabsTrigger value="analysis">Model Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="animate-in fade-in zoom-in-95 space-y-6 duration-200">
              {/* Classification Result Badge */}
              <div className={cn(
                  "flex items-center gap-3 rounded-lg border p-4",
                  selectedResult.classification === "ADHD Detected"
                    ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20"
                    : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                )}>
                {selectedResult.classification === "ADHD Detected" ? (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                <div>
                  <p className="text-sm font-bold">{selectedResult.classification}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{selectedResult.filename}</p>
                </div>
              </div>

              {/* confidence score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Confidence Score</span>
                  <span className="font-bold">{selectedResult.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={selectedResult.confidence} className="h-2" />
              </div>

              {/* top features */}
              <div className="space-y-2">
                <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <BrainCircuit className="h-3 w-3"/> Top Contributing Features
                </p>
                <div className="grid gap-2">
                  {selectedResult.topFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border bg-muted/40 p-2.5 text-xs">
                      <span className="truncate font-medium">{feature.name}</span>
                      <span className="font-mono font-bold text-primary">{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* accuracy footer */}
              <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Model Accuracy</span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{stats.accuracy}%</p>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">Performance Metrics</span>
                </div>
                
                <div className="space-y-3">
                    {/* metric bars */}
                    {[{l: "Precision", v: stats.precision}, {l: "Recall", v: stats.recall}, {l: "F1-Score", v: stats.f1}].map((m) => (
                         <div key={m.l} className="space-y-1">
                            <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{m.l}</span>
                            <span className="font-mono font-medium">{m.v}%</span>
                            </div>
                            <Progress value={m.v} className="h-1.5 opacity-80" />
                        </div>
                    ))}
                </div>
              </div>

              <div className="space-y-3">
                  <div className="mt-2 flex items-center gap-2 border-b pb-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold">Clinical Reliability</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <ReliabilityBox value={stats.matrix.tp} label="True Positives" color="emerald" />
                    <ReliabilityBox value={stats.matrix.tn} label="True Negatives" color="emerald" />
                    <ReliabilityBox value={stats.matrix.fn} label="False Negatives" color="red" />
                    <ReliabilityBox value={stats.matrix.fp} label="False Positives" color="orange" />
                </div>
                
                <div className="rounded bg-muted p-2 text-center text-[10px] italic text-muted-foreground">
                    {stats.missedCases} missed ADHD diagnoses in test set
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}

function ReliabilityBox({ value, label, color }: { value: number, label: string, color: "emerald" | "red" | "orange" }) {
    const colorStyles = {
        emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
        red: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400",
        orange: "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400"
    }

    return (
        <div className={cn("rounded border p-2 text-center", colorStyles[color])}>
            <div className="text-lg font-bold">{value}</div>
            <div className="text-[10px] uppercase text-muted-foreground">{label}</div>
        </div>
    )
}