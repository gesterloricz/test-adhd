import { useState } from "react"
import {
  CheckCircle2, AlertTriangle, RotateCcw, FileText,
  BarChart3, ArrowUpRight, ArrowDownRight,
  Loader2, Printer
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
import EEGViewer from "./eeg-viewer"

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
      isBaseline ? "border-muted print:hidden" : "border-primary/20 print:border-black print:shadow-none print:border"
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
                      <span className="font-bold">Optimized</span>
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
          { label: "Optimized XGBoost (DART+IBL)", stats: proposed },
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
  suppressPrintSections?: boolean  // true in batch mode — batch has its own print header/footer
}

export default function SingleResultView({
  result,
  onNewAnalysis,
  standalone = false,
  showMetrics = true,
  suppressPrintSections = false,
}: Props) {
  const [isRerunning, setIsRerunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirm = () => {
    setConfirmOpen(false); setIsRerunning(true)
    setTimeout(() => { setIsRerunning(false); onNewAnalysis?.() }, 1200)
  }

  return (
    <div className={cn("w-full space-y-6 transition-opacity print:space-y-8 print:bg-white print:text-black", isRerunning && "opacity-60 pointer-events-none")}>

      {/* ── PRINT-ONLY HEADER ── */}
      {!suppressPrintSections && <div className="hidden print:block space-y-4 pb-6 border-b-2 border-black">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-black tracking-tight">Clinical EEG Analysis Report</h1>
            <p className="text-muted-foreground font-medium mt-1">Automated ADHD Classification System</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm pt-4">
          <div>
            <p className="mb-2"><strong>Patient/Subject ID:</strong> _________________________</p>
            <p><strong>Source File:</strong> <span className="font-mono text-xs">{result.filename}</span></p>
          </div>
          <div>
            <p className="mb-2"><strong>Evaluator:</strong> _________________________</p>
            <p><strong>Dataset Ref:</strong> {result.dataset_label}</p>
          </div>
        </div>
      </div>}

      {/* File header */}
      {standalone && (
        <Card className="border-2 border-primary/10 bg-card shadow-sm print:hidden">
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
            <div className="flex items-center gap-2 print:hidden">
              <Button size="sm" variant="outline" className="h-8" onClick={() => window.print()}>
                <Printer className="mr-2 h-3.5 w-3.5" />
                Print Result
              </Button>
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
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ── SECTION 1: This file's prediction (what actually matters) ── */}
      <div>
        <p className="mb-3 text-sm font-semibold text-foreground print:hidden">
          Prediction for this file
        </p>
        <p className="mb-3 text-lg font-bold text-black hidden print:block">
          System Analysis Result
        </p>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 print:grid-cols-1 print:gap-4">
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
            title="Optimized Model" description="Optimized XGBoost (DART + IBL)"
            isBaseline={false}
            label={result.proposed_label}
            confidence={result.proposed_confidence}
            adhd_epochs={result.proposed_adhd_epochs}
            total_epochs={result.total_epochs}
            filename={result.filename}
          />
        </div>

        {/* ── PRINT-ONLY INTERPRETATION GUIDE ── */}
        <div className="hidden print:block mt-6 p-4 rounded-lg border border-gray-300 bg-gray-50 text-sm text-black">
          <h3 className="font-bold text-base mb-2">Interpretation Guide</h3>
          <p className="mb-2">
            The automated system analyzed <strong>{result.total_epochs}</strong> segments (epochs) of the patient's EEG recording.
            Each segment was evaluated for neurological patterns commonly associated with ADHD, such as specific power spectral density (PSD) distributions and signal entropy.
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li><strong>ADHD Detected:</strong> The majority of the EEG segments exhibited spectral features consistent with the ADHD clinical group in the reference dataset.</li>
            <li><strong>Control / Non-ADHD:</strong> The majority of the EEG segments exhibited features consistent with the neurotypical (Control) group.</li>
          </ul>
          <p>
            The <strong>Confidence Score ({result.proposed_confidence.toFixed(1)}%)</strong> reflects the statistical certainty of the model across all segments.
            A higher score indicates stronger consistency in the neurological patterns throughout the entire recording. This is a statistical measurement and should be cross-referenced with behavioral assessments.
          </p>
        </div>
      </div>

      {/* ── SECTION 2: EEG Viewer ── */}
      {result.eeg_data && result.eeg_data.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">
            EEG Waveform
          </p>
          <EEGViewer eegData={result.eeg_data} samplingRate={128} downsample={4} fileName={result.filename} />
        </div>
      )}

      {/* ── SECTION 3: Training metrics — only shown when showMetrics=true ── */}
      {showMetrics && result.metrics?.baseline && (
        <div className="print:hidden">
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

      {/* ── PRINT-ONLY FOOTER ── */}
      {!suppressPrintSections && <div className="hidden print:block pt-12 space-y-12 page-break-inside-avoid">
        <div className="space-y-2">
          <p className="font-bold text-black">Clinical Notes & Remarks:</p>
          <div className="h-32 w-full border border-gray-300 rounded p-2"></div>
        </div>

        <div className="flex justify-between items-end pt-8">
          <div className="w-64 text-center">
            <div className="border-b border-black w-full mb-2"></div>
            <p className="text-sm text-black font-semibold">Psychometrician / Evaluator Signature</p>
          </div>
          <div className="w-48 text-center">
            <div className="border-b border-black w-full mb-2"></div>
            <p className="text-sm text-black font-semibold">Date</p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            This report was generated by an automated EEG analysis system utilizing optimized machine learning models.
            It is intended to assist and provide objective data metrics, but should not replace formal clinical diagnosis by a licensed healthcare professional.
          </p>
        </div>
      </div>}

    </div>
  )
}
