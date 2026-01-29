import { useState } from "react"
import { Users, RotateCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"

import type { ClassificationResult } from "../types"
import { cn } from "@/lib/utils"
import SingleResultView from "./single-result-view"

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

interface BatchResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function BatchResultsView({ onNewAnalysis, results }: BatchResultsViewProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isRerunning, setIsRerunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalCount = results.length
  const adhdCount = results.filter((r) => r.classification === "ADHD Detected").length
  const controlCount = results.filter((r) => r.classification === "Control (No ADHD)").length

  const handleConfirmRerun = () => {
    setConfirmOpen(false)
    setIsRerunning(true)
    setTimeout(() => {
      setSelectedFileName(null)
      setIsRerunning(false)
      onNewAnalysis()
    }, 1200)
  }

  const selectedResult = results.find(r => r.filename === selectedFileName)

  return (
    <div className={cn("w-full space-y-6 transition-opacity", isRerunning && "opacity-60 pointer-events-none")}>
      
      {/* classification summary */}
      <Card className="border-2 border-primary/10 bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Batch Classification Summary
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
                  This will clear all current results. This action cannot be undone.
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

      {/* Selected Single Result View */}
      {selectedResult ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <SingleResultView 
                result={selectedResult} 
                standalone={false} // Hide the header in batch mode
             />
          </div>
      ) : (
          <div className="rounded-lg border-2 border-dashed p-12 text-center text-muted-foreground">
              Select a file above to view detailed metrics.
          </div>
      )}
    </div>
  )
}