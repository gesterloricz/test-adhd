import type React from "react"
import { useCallback, useState } from "react"
import { Upload, X, FileText, CheckCircle2, Layers, FlaskConical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DatasetKey, DatasetDetail } from "../types"

const EEG_CHANNELS = [
  "Fz", "Cz", "Pz", "C3", "T3", "C4", "T4", "Fp1", "Fp2",
  "F3", "F4", "F7", "F8", "P3", "P4", "T5", "T6", "O1", "O2",
]

interface Props {
  files: File[]
  selectedDataset: DatasetKey
  availableDatasets: DatasetKey[]
  datasetDetails: Record<string, DatasetDetail>
  onFilesSelected: (files: File[]) => void
  onStartProcessing: () => void
  onDatasetChange: (d: DatasetKey) => void
}

export default function DataUploadPanel({
  files, selectedDataset, availableDatasets, datasetDetails,
  onFilesSelected, onStartProcessing, onDatasetChange,
}: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [batchUploadEnabled, setBatchUploadEnabled] = useState(true)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragging(e.type === "dragenter" || e.type === "dragover")
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
      .filter(f => /\.(csv|mat|edf)$/i.test(f.name))
    if (dropped.length > 0)
      onFilesSelected(batchUploadEnabled ? [...files, ...dropped] : [dropped[0]])
  }, [files, onFilesSelected, batchUploadEnabled])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const sel = Array.from(e.target.files)
    onFilesSelected(batchUploadEnabled ? [...files, ...sel] : [sel[0]])
  }

  const removeFile = (i: number) => onFilesSelected(files.filter((_, idx) => idx !== i))

  const toggleBatch = () => {
    const next = !batchUploadEnabled
    setBatchUploadEnabled(next)
    if (!next && files.length > 1) onFilesSelected([files[0]])
  }

  return (
    <div className="w-full space-y-6">
      <Card className="border-border bg-card p-4 shadow-sm sm:p-8">

        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-3 text-xl font-bold sm:text-2xl">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Upload className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              Data Upload
            </h2>
            <Badge
              variant="outline"
              onClick={toggleBatch}
              className={cn(
                "w-fit cursor-pointer px-3 py-1.5 text-sm transition-colors",
                batchUploadEnabled
                  ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                  : "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              Batch {batchUploadEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>

        {/* ── Dataset selector ── */}
        {availableDatasets.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Select Trained Model</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {availableDatasets.map(key => {
                const info = datasetDetails[key]
                const isIEEE = key === "IEEE"
                const selected = selectedDataset === key
                return (
                  <button
                    key={key}
                    onClick={() => onDatasetChange(key)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/20"
                    )}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-bold text-sm">{info?.label ?? key}</span>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold",
                        isIEEE
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      )}>
                        {isIEEE ? "Balanced" : "Imbalanced"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {info?.note ?? ""}
                    </p>
                    {selected && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                        <CheckCircle2 className="h-3 w-3" /> Selected
                      </div>
                    )}
                  </button>
                )
              })}
            </div>


          </div>
        )}

        {/* Drop zone */}
        <div
          onDragEnter={handleDrag} onDragLeave={handleDrag}
          onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
          className={cn(
            "flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:min-h-[360px] sm:p-12",
            isDragging
              ? "scale-[0.99] border-primary bg-primary/5 shadow-inner"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div className={cn("rounded-full p-4 sm:p-6 transition-all", isDragging ? "bg-primary/20" : "bg-muted")}>
              <Upload className={cn("h-8 w-8 sm:h-12 sm:w-12", isDragging ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold sm:text-xl">
                Drop EEG {batchUploadEnabled ? "files" : "file"} here or browse
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Supports .MAT  {batchUploadEnabled ? "Batch" : "Single"} mode
              </p>
            </div>
            <input
              id="file-upload" type="file"
              multiple={batchUploadEnabled}
              accept=".csv,.mat,.edf"
              onChange={handleFileInput}
              className="hidden"
            />
            <Button size="lg" className="mt-2 w-full sm:mt-4 sm:w-auto">Browse Files</Button>
          </div>
        </div>

        {/* Channel list */}
        <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-4 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
            <div className="flex-1">
              <p className="mb-3 font-semibold">Required: 19-channel EEG (10-20 system)</p>
              <div className="flex flex-wrap gap-2">
                {EEG_CHANNELS.map(ch => (
                  <span key={ch} className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs font-medium shadow-sm">
                    {ch}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <Card className="animate-in fade-in slide-in-from-top-4 border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Selected Files ({files.length})
              <Badge variant="secondary" className="text-xs">{selectedDataset}</Badge>
            </h3>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button variant="ghost" size="sm" onClick={() => onFilesSelected([])} className="flex-1 sm:flex-none">
                Clear All
              </Button>
              <Button onClick={onStartProcessing} className="flex-1 sm:flex-none">
                Start Processing
              </Button>
            </div>
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border bg-background text-xs font-bold">{i + 1}</div>
                  <div className="truncate text-sm font-medium">{file.name}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 text-destructive" onClick={() => removeFile(i)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
