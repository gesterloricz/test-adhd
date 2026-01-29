import { useState } from "react"
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileText,
  Users,
  Loader2,
  TrendingUp,
  Activity,
  BarChart3,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ClassificationResult } from "../types"

// --- STATIC DATA FOR MODELS (Derived from your Colab Output) ---
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

// static data for baseline results
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
  {
    filename: "sample003.pdf",
    classification: "ADHD Detected",
    confidence: 94.1,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.75,
    topFeatures: [
      { name: "Theta/Beta Ratio", value: 0.48 },
      { name: "Delta Power", value: 0.29 },
      { name: "Coherence", value: 0.12 },
    ],
  },
  {
    filename: "sample004.pdf",
    classification: "ADHD Detected",
    confidence: 85.4,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.75,
    topFeatures: [
      { name: "Theta/Beta Ratio", value: 0.38 },
      { name: "Delta Power", value: 0.25 },
      { name: "Coherence", value: 0.19 },
    ],
  },
  {
    filename: "sample005.pdf",
    classification: "Control (No ADHD)",
    confidence: 98.0,
    modelUsed: "Standard XGBoost (Baseline)",
    accuracy: 96.75,
    topFeatures: [
      { name: "Alpha Peak", value: 0.55 },
      { name: "Beta Power", value: 0.22 },
      { name: "Theta Power", value: 0.11 },
    ],
  },
]

interface ResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function ResultsView({
  onNewAnalysis,
  results,
}: ResultsViewProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isRerunning, setIsRerunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalCount = results.length
  const adhdCount = results.filter(
    (r) => r.classification === "ADHD Detected"
  ).length
  const controlCount = results.filter(
    (r) => r.classification === "Control (No ADHD)"
  ).length

  const getProposedResult = () => {
    if (!selectedFileName) return null
    const res = results.find((r) => r.filename === selectedFileName)
    if (res) return { ...res, accuracy: MODEL_STATS.proposed.accuracy }
    return null
  }

  const getBaselineResult = () => {
    if (!selectedFileName) return null
    const match = BASELINE_RESULTS_STATIC.find(
      (r) => r.filename === selectedFileName
    )
    if (match) return { ...match, accuracy: MODEL_STATS.baseline.accuracy }

    const index = results.findIndex((r) => r.filename === selectedFileName)
    const fallback =
      BASELINE_RESULTS_STATIC[index % BASELINE_RESULTS_STATIC.length]
    return { ...fallback, accuracy: MODEL_STATS.baseline.accuracy }
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

  // Comparison Metrics Configuration
  const COMPARISON_METRICS = [
    { key: "accuracy", label: "Accuracy" },
    { key: "precision", label: "Precision" },
    { key: "recall", label: "Recall" },
    { key: "f1", label: "F1-Score" },
  ] as const

  return (
    <div
      className={`w-full space-y-6 transition-opacity ${
        isRerunning ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Classification Summary */}
      <Card className="border-2 border-primary/10 bg-card shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Classification Summary
          </CardTitle>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                disabled={results.length === 0 || isRerunning}
              >
                {isRerunning ? (
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 mr-2" />
                )}
                New Analysis
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start new analysis?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all current results and selected files. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmRerun}>
                  Yes, continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-xl border text-center">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                Total Processed
              </p>
              <p className="text-3xl font-bold mt-1">{totalCount}</p>
            </div>
            <div className="p-4 bg-orange-500/10 border border-orange-200/50 dark:border-orange-900/30 rounded-xl text-center">
              <p className="text-xs text-orange-600 dark:text-orange-400 uppercase font-semibold tracking-wider">
                ADHD Detected
              </p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-400 mt-1">
                {adhdCount}
              </p>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl text-center">
              <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-semibold tracking-wider">
                Control Group
              </p>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {controlCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File selection */}
      <Card className="p-4 border shadow-sm">
        <h3 className="text-sm font-medium mb-3 text-muted-foreground">
          Select File for Detailed Comparison
        </h3>
        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar">
          {results.map((r) => (
            <Button
              key={r.filename}
              variant={selectedFileName === r.filename ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFileName(r.filename)}
              className="text-xs h-8"
            >
              {r.filename}
            </Button>
          ))}
        </div>
      </Card>

      {/* Detailed Comparison Grid (Results) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResultColumn
          title="Baseline Model"
          description="Standard XGBoost"
          selectedResult={getBaselineResult()}
          isBaseline
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

      {/* --- MOVED SECTION: PERFORMANCE METRICS COMPARISON (Now at Bottom) --- */}
      {selectedFileName && (
        <div className="space-y-3 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Performance Metrics Comparison</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COMPARISON_METRICS.map((metric) => {
              const baselineVal = MODEL_STATS.baseline[metric.key];
              const proposedVal = MODEL_STATS.proposed[metric.key];
              const improvement = (proposedVal - baselineVal).toFixed(2);
              
              return (
                <Card key={metric.key} className="bg-card/50 border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-semibold text-muted-foreground">
                        {metric.label}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        +{improvement}%
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Baseline Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Baseline</span>
                          <span className="font-mono">{baselineVal}%</span>
                        </div>
                        <Progress value={baselineVal} className="h-2 bg-muted" />
                      </div>

                      {/* Proposed Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold">Proposed</span>
                          <span className="font-mono font-bold">{proposedVal}%</span>
                        </div>
                        {/* Custom styled progress to match image black bar */}
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-primary/90 rounded-full" 
                              style={{ width: `${proposedVal}%` }} 
                           />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
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

function ResultColumn({
  title,
  description,
  selectedResult,
  isBaseline,
  stats,
}: ResultColumnProps) {
  return (
    <Card
      className={`flex flex-col h-full border-2 shadow-sm transition-all bg-card ${
        isBaseline ? "border-muted" : "border-primary/20"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg text-foreground/90">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {!selectedResult ? (
          <div className="h-[350px] flex flex-col items-center justify-center text-center p-6 border-2 border-dashed rounded-lg bg-muted/5 text-muted-foreground">
            <FileText className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">No File Selected</p>
            <p className="text-xs mt-1 max-w-[200px]">
              Click a file name above to view analysis metrics.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="result" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="result">Result</TabsTrigger>
              <TabsTrigger value="analysis">Model Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              {/* Classification Result Box */}
              <div
                className={`p-4 rounded-lg border flex items-center gap-3 ${
                  selectedResult.classification === "ADHD Detected"
                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50"
                    : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50"
                }`}
              >
                {selectedResult.classification === "ADHD Detected" ? (
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <p className="text-sm font-bold">
                    {selectedResult.classification}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {selectedResult.filename}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-muted-foreground">
                    Confidence Score
                  </span>
                  <span className="font-bold">
                    {selectedResult.confidence.toFixed(1)}%
                  </span>
                </div>
                <Progress value={selectedResult.confidence} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3"/> Top Contributing Features
                </p>
                <div className="grid gap-2">
                  {selectedResult.topFeatures.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-md bg-muted/40 border text-xs"
                    >
                      <span className="font-medium truncate">
                        {feature.name}
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {feature.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Accuracy Footer */}
              <div className="mt-4 rounded-xl bg-muted/40 p-4 border">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Model Accuracy
                  </span>
                </div>
                <p className="text-3xl font-bold tracking-tight">
                  {stats.accuracy}%
                </p>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Performance Metrics Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Performance Metrics</span>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Precision</span>
                      <span className="font-mono font-medium">{stats.precision}%</span>
                    </div>
                    <Progress value={stats.precision} className="h-1.5 opacity-80" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Recall</span>
                      <span className="font-mono font-medium">{stats.recall}%</span>
                    </div>
                    <Progress value={stats.recall} className="h-1.5 opacity-80" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">F1-Score</span>
                      <span className="font-mono font-medium">{stats.f1}%</span>
                    </div>
                    <Progress value={stats.f1} className="h-1.5 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Clinical Reliability / Confusion Matrix Data */}
              <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b mt-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Clinical Reliability</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-center">
                      <div className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{stats.matrix.tp}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">True Positives</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded text-center">
                      <div className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{stats.matrix.tn}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">True Negatives</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-center">
                      <div className="font-bold text-lg text-red-700 dark:text-red-400">{stats.matrix.fn}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">False Negatives</div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded text-center">
                      <div className="font-bold text-lg text-orange-700 dark:text-orange-400">{stats.matrix.fp}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">False Positives</div>
                    </div>
                </div>
                
                <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded italic text-center">
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