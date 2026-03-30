import { useState } from "react"
import {
  CheckCircle2, AlertTriangle, RotateCcw, FileText,
  BarChart3, ArrowUpRight, ArrowDownRight,
  Loader2, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import type { ClassificationResult, ModelMetricEntry } from "../types"
import { cn } from "@/lib/utils"
import { data } from "react-router-dom"

const METRIC_KEYS = [
  { key: "accuracy" as const, label: "Accuracy" },
  { key: "precision" as const, label: "Precision" },
  { key: "recall" as const, label: "Recall" },
  { key: "f1" as const, label: "F1-Score" },
]

// ── Prediction card for one model ─────────────────────────────────────────────
function PredictionCard({
  title, description, isBaseline,
  label, confidence, adhd_epochs, total_epochs, filename,
}: {
  title: string; description: string; isBaseline: boolean
  label: string; confidence: number
  adhd_epochs: number; total_epochs: number; filename: string
}) {
  const isADHD = label === "ADHD Detected"
  return (
    <Card className={cn(
      "flex flex-col border-2 bg-card shadow-sm",
      isBaseline ? "border-muted" : "border-primary/20"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Classification result */}
        <div className={cn(
          "flex items-center gap-3 rounded-lg border p-4",
          isADHD
            ? "border-orange-200 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/20"
            : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
        )}>
          {isADHD
            ? <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0" />
            : <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />}
          <div>
            <p className="font-bold">{label}</p>
            <p className="text-[10px] font-mono text-muted-foreground">{filename}</p>
          </div>
        </div>

        {/* Confidence — this IS specific to the uploaded file */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-muted-foreground">Prediction Confidence</span>
            <span className="font-bold">{confidence.toFixed(1)}%</span>
          </div>
          <Progress value={confidence} className="h-2.5" />
          <p className="text-[10px] text-muted-foreground">
            How strongly the model leaned toward this classification across all epochs.
          </p>
        </div>

        {/* Epoch vote breakdown — specific to this file */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Epoch Vote Breakdown
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-2xl font-bold text-orange-600">{adhd_epochs}</p>
              <p className="text-muted-foreground">ADHD</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{total_epochs - adhd_epochs}</p>
              <p className="text-muted-foreground">Control</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{total_epochs}</p>
              <p className="text-muted-foreground">Total</p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900/30">
            <div
              className="h-full rounded-full bg-orange-400 transition-all"
              style={{ width: `${(adhd_epochs / total_epochs) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {((adhd_epochs / total_epochs) * 100).toFixed(0)}% of epochs voted ADHD.
            Final label = majority vote.
          </p>
        </div>

      </CardContent>
    </Card>
  )
}

// ── Training metrics section (model-level, NOT file-level) ────────────────────
function TrainingMetricsSection({
  baseline, proposed, trained_on,
}: {
  baseline: ModelMetricEntry; proposed: ModelMetricEntry; trained_on: string
}) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-5">

      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Model Performance on Training Test Set</h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">{trained_on}</Badge>
      </div>

      {/* Four metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_KEYS.map(({ key, label }) => {
          const bv = baseline[key]
          const pv = proposed[key]
          const diff = pv - bv
          return (
            <Card key={key} className="border bg-card shadow-sm">
              <CardContent className="p-4">
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{label}</span>
                  <span className={cn(
                    "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                    diff >= 0
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    {diff >= 0
                      ? <ArrowUpRight className="h-3 w-3" />
                      : <ArrowDownRight className="h-3 w-3" />}
                    {diff >= 0 ? "+" : ""}{diff.toFixed(2)}%
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Baseline</span>
                      <span className="font-mono">{bv}%</span>
                    </div>
                    <Progress value={bv} className="h-1.5 bg-muted" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold">Proposed</span>
                      <span className="font-mono font-bold">{pv}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/90" style={{ width: `${pv}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Confusion matrices */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Baseline XGBoost", stats: baseline },
          { label: "Proposed XGBoost (DART+IBL)", stats: proposed },
        ].map(({ label, stats }) => {
          const [[tn, fp], [fn, tp]] = stats.confusion_matrix
          return (
            <div key={label} className="rounded-lg border bg-card p-4">
              <p className="mb-3 text-xs font-semibold">{label} — Confusion Matrix</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded border bg-emerald-500/10 border-emerald-500/20 p-2 text-center">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{tp}</p>
                  <p className="text-[10px] text-muted-foreground">True Positives</p>
                  <p className="text-[9px] text-muted-foreground">(Correct ADHD)</p>
                </div>
                <div className="rounded border bg-emerald-500/10 border-emerald-500/20 p-2 text-center">
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{tn}</p>
                  <p className="text-[10px] text-muted-foreground">True Negatives</p>
                  <p className="text-[9px] text-muted-foreground">(Correct Control)</p>
                </div>
                <div className="rounded border bg-red-500/10 border-red-500/20 p-2 text-center">
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">{fn}</p>
                  <p className="text-[10px] text-muted-foreground">False Negatives</p>
                  <p className="text-[9px] text-muted-foreground">(Missed ADHD)</p>
                </div>
                <div className="rounded border bg-orange-500/10 border-orange-500/20 p-2 text-center">
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{fp}</p>
                  <p className="text-[10px] text-muted-foreground">False Positives</p>
                  <p className="text-[9px] text-muted-foreground">(Wrong ADHD)</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  result: ClassificationResult
  onNewAnalysis?: () => void
  standalone?: boolean
  showMetrics?: boolean  // false in batch mode — metrics shown once at batch level
}

export default function SingleResultView({
  result,
  onNewAnalysis,
  standalone = false,
  showMetrics = true,
}: Props) {
  const [isRerunning, setIsRerunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = () => {
    setConfirmOpen(false); setIsRerunning(true)
    setTimeout(() => { setIsRerunning(false); onNewAnalysis?.() }, 1200)
  }

  return (
    <div className={cn("w-full space-y-6 transition-opacity", isRerunning && "opacity-60 pointer-events-none")}>

      {/* File header */}
      {standalone && (
        <Card className="border-2 border-primary/10 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Classification Result</CardTitle>
                <CardDescription className="font-mono text-xs">{result.filename}</CardDescription>
              </div>
            </div>
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">
                  {isRerunning
                    ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    : <RotateCcw className="mr-2 h-3.5 w-3.5" />}
                  New Analysis
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start new analysis?</AlertDialogTitle>
                  <AlertDialogDescription>This will clear the current result.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirm}>Yes, continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
        </Card>
      )}

      {/* ── SECTION 1: This file's prediction (what actually matters) ── */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground">
          Prediction for this file
        </p>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PredictionCard
            title="Baseline Model" description="Standard XGBoost"
            isBaseline={true}
            label={result.baseline_label}
            confidence={result.baseline_confidence}
            adhd_epochs={result.baseline_adhd_epochs}
            total_epochs={result.total_epochs}
            filename={result.filename}
          />
          <PredictionCard
            title="Proposed Model" description="Optimized XGBoost (DART + IBL)"
            isBaseline={false}
            label={result.proposed_label}
            confidence={result.proposed_confidence}
            adhd_epochs={result.proposed_adhd_epochs}
            total_epochs={result.total_epochs}
            filename={result.filename}
          />
        </div>
      </div>

      {/* ── SECTION 2: Training metrics — only shown when showMetrics=true ── */}
      {showMetrics && result.metrics?.baseline && (
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">
            Model training performance on {result.dataset_label}
          </p>
          <TrainingMetricsSection
            baseline={result.metrics.baseline}
            proposed={result.metrics.proposed}
            trained_on={result.metrics.trained_on}
          />
        </div>
      )}

    </div>
  )
}
