import { useState } from "react"
import {
  Users, RotateCcw, Loader2, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, FileText, Brain, Info,
  Activity, BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import type { ClassificationResult, ModelMetricEntry } from "../types"
import { cn } from "@/lib/utils"
import SingleResultView from "./single-result-view"

const METRIC_KEYS = [
  { key: "accuracy" as const, label: "Accuracy" },
  { key: "precision" as const, label: "Precision" },
  { key: "recall" as const, label: "Recall" },
  { key: "f1" as const, label: "F1-Score" },
]

interface Props {
  results: ClassificationResult[]
  onNewAnalysis: () => void
}

export default function BatchResultsView({ results, onNewAnalysis }: Props) {
  const [expandedFile, setExpandedFile] = useState<string | null>(null)
  const [isRerunning, setIsRerunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "adhd" | "control">("all")

  // ── Derived counts ──────────────────────────────────────────────────────────
  const adhdResults = results.filter(r => r.proposed_label === "ADHD Detected")
  const controlResults = results.filter(r => r.proposed_label === "Control (No ADHD)")
  const total = results.length
  const adhdCount = adhdResults.length
  const controlCount = controlResults.length

  const agreementCount = results.filter(r => r.baseline_label === r.proposed_label).length
  const agreementPct = total > 0 ? ((agreementCount / total) * 100).toFixed(0) : "0"

  // Metrics come from the first result — all files in a batch share the same
  // model so the metrics are identical for every file
  const sharedMetrics = results[0]?.metrics ?? null
  const datasetLabel = results[0]?.dataset_label ?? ""

  const visibleResults =
    activeTab === "adhd" ? adhdResults :
      activeTab === "control" ? controlResults :
        results

  const handleConfirmRerun = () => {
    setConfirmOpen(false); setIsRerunning(true)
    setTimeout(() => { setIsRerunning(false); setExpandedFile(null); onNewAnalysis() }, 1200)
  }

  const toggleExpand = (filename: string) =>
    setExpandedFile(prev => prev === filename ? null : filename)

  return (
    <div className={cn("w-full space-y-6 transition-opacity", isRerunning && "opacity-60 pointer-events-none")}>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      <Card className="border-2 border-primary/10 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Batch Classification Results
          </CardTitle>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8" disabled={isRerunning}>
                {isRerunning
                  ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  : <RotateCcw className="mr-2 h-3.5 w-3.5" />}
                New Analysis
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Start new analysis?</AlertDialogTitle>
                <AlertDialogDescription>This will clear all results.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmRerun}>Yes, continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox label="Total Files" value={total} color="default" />
            <StatBox label="ADHD Detected" value={adhdCount} color="orange" />
            <StatBox label="Control" value={controlCount} color="emerald" />
            <StatBox label="Both Models Agree" value={`${agreementPct}%`} color="blue" />
          </div>

          {total > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>ADHD: {adhdCount} files ({((adhdCount / total) * 100).toFixed(0)}%)</span>
                <span>Control: {controlCount} files ({((controlCount / total) * 100).toFixed(0)}%)</span>
              </div>
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-emerald-200 dark:bg-emerald-900/30">
                <div
                  className="h-full bg-orange-400 transition-all duration-700"
                  style={{ width: `${(adhdCount / total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Orange = ADHD &nbsp;·&nbsp; Green = Control
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── File list ─────────────────────────────────────────────────────── */}
      <Card className="border bg-card shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Classified Files</span>
            <div className="ml-auto flex gap-1.5">
              {(["all", "adhd", "control"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                    activeTab === tab
                      ? tab === "adhd" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : tab === "control" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {tab === "all" ? `All (${total})` :
                    tab === "adhd" ? `ADHD (${adhdCount})` :
                      `Control (${controlCount})`}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 p-3 pt-0">
          {visibleResults.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No files in this category.
            </div>
          )}

          {visibleResults.map((result) => {
            const isADHD = result.proposed_label === "ADHD Detected"
            const isExpanded = expandedFile === result.filename
            const bothAgree = result.baseline_label === result.proposed_label
            const baseIsADHD = result.baseline_label === "ADHD Detected"

            return (
              <div key={result.filename} className="overflow-hidden rounded-lg border border-border">

                {/* Row */}
                <button
                  onClick={() => toggleExpand(result.filename)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                    isExpanded && "bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                    isADHD ? "bg-orange-100 dark:bg-orange-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
                  )}>
                    {isADHD
                      ? <AlertTriangle className="h-4 w-4 text-orange-600" />
                      : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{result.filename}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {result.total_epochs} epochs &nbsp;·&nbsp;
                      {result.proposed_adhd_epochs} voted ADHD
                    </p>
                  </div>

                  <Badge className={cn(
                    "flex-shrink-0 text-xs",
                    isADHD
                      ? "bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                  )}>
                    {result.proposed_label}
                  </Badge>

                  <span className="hidden flex-shrink-0 font-mono text-xs text-muted-foreground sm:block">
                    {result.proposed_confidence.toFixed(1)}%
                  </span>

                  <span className={cn(
                    "hidden flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold sm:block",
                    bothAgree
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {bothAgree ? "Both agree" : `Baseline: ${baseIsADHD ? "ADHD" : "Control"}`}
                  </span>

                  {isExpanded
                    ? <ChevronUp className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    : <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
                </button>

                {/* Expanded: prediction only, NO metrics (shown once below) */}
                {isExpanded && (
                  <div className="border-t border-border bg-muted/10 p-4">
                    <SingleResultView
                      result={result}
                      standalone={false}
                      showMetrics={false}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* ── Group summaries ───────────────────────────────────────────────── */}
      {adhdCount > 0 && (
        <GroupSummary title="ADHD Detected Files" color="orange" files={adhdResults} />
      )}
      {controlCount > 0 && (
        <GroupSummary title="Control (No ADHD) Files" color="emerald" files={controlResults} />
      )}

      {/* ── Model training metrics — shown ONCE for the whole batch ───────── */}
      {sharedMetrics?.baseline && (
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">
            Model training performance on {datasetLabel}
          </p>
          <BatchMetricsSection
            baseline={sharedMetrics.baseline}
            proposed={sharedMetrics.proposed}
            datasetLabel={datasetLabel}
          />
        </div>
      )}

    </div>
  )
}

// ── Stat box ──────────────────────────────────────────────────────────────────

function StatBox({ label, value, color }: {
  label: string; value: number | string
  color: "default" | "orange" | "emerald" | "blue"
}) {
  const bg = { default: "bg-muted/50 border-border", orange: "bg-orange-500/10 border-orange-200/50 dark:border-orange-900/30", emerald: "bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/30", blue: "bg-blue-500/10 border-blue-200/50 dark:border-blue-900/30" }[color]
  const text = { default: "text-foreground", orange: "text-orange-700 dark:text-orange-400", emerald: "text-emerald-700 dark:text-emerald-400", blue: "text-blue-700 dark:text-blue-400" }[color]
  return (
    <div className={cn("rounded-xl border p-4 text-center", bg)}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", text)}>{value}</p>
    </div>
  )
}

// ── Group summary ─────────────────────────────────────────────────────────────

function GroupSummary({ title, color, files }: {
  title: string; color: "orange" | "emerald"; files: ClassificationResult[]
}) {
  const isOrange = color === "orange"
  return (
    <Card className={cn("border-2 shadow-sm", isOrange ? "border-orange-200 dark:border-orange-900/40" : "border-emerald-200 dark:border-emerald-900/40")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn("flex items-center gap-2 text-base", isOrange ? "text-orange-700 dark:text-orange-400" : "text-emerald-700 dark:text-emerald-400")}>
          {isOrange ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {title}
          <Badge variant="outline" className="ml-auto text-xs">{files.length} file{files.length !== 1 ? "s" : ""}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {files.map(r => (
            <div key={r.filename} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-xs", isOrange ? "border-orange-200 bg-orange-50 dark:border-orange-900/30 dark:bg-orange-950/10" : "border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/10")}>
              <FileText className="h-3 w-3 flex-shrink-0 opacity-60" />
              <span className="font-medium">{r.filename}</span>
              <span className="font-mono opacity-60">{r.proposed_confidence.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ── Batch metrics section — shown once for all files ─────────────────────────

function BatchMetricsSection({ baseline, proposed, datasetLabel }: {
  baseline: ModelMetricEntry
  proposed: ModelMetricEntry
  datasetLabel: string
}) {
  const [[b_tn, b_fp], [b_fn, b_tp]] = baseline.confusion_matrix
  const [[p_tn, p_fp], [p_fn, p_tp]] = proposed.confusion_matrix

  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/10 p-5">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Model Performance on Training Test Set</h3>
        <Badge variant="secondary" className="ml-auto text-[10px]">{datasetLabel}</Badge>
      </div>

      {/* Four metric comparison cards */}
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
                    {diff >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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

      {/* Confusion matrices side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Baseline XGBoost", tp: b_tp, tn: b_tn, fp: b_fp, fn: b_fn },
          { label: "Optimized XGBoost (DART+IBL)", tp: p_tp, tn: p_tn, fp: p_fp, fn: p_fn },
        ].map(({ label, tp, tn, fp, fn }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-semibold">{label}</p>
            </div>
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
        ))}
      </div>

    </div>
  )
}
