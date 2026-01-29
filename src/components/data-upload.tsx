import type React from "react"
import { useCallback, useState } from "react"
import { Upload, X, FileText, CheckCircle2, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const EEG_CHANNELS = [
  "Fz", "Cz", "Pz", "C3", "T3", "C4", "T4", "Fp1", "Fp2",
  "F3", "F4", "F7", "F8", "P3", "P4", "T5", "T6", "O1", "O2",
]

interface DataUploadPanelProps {
  onFilesSelected: (files: File[]) => void
  onStartProcessing: () => void
  files: File[]
}

export default function DataUploadPanel({ onFilesSelected, onStartProcessing, files }: DataUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [batchUploadEnabled, setBatchUploadEnabled] = useState(true)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (file) => /\.(xml|csv|mat|edf)$/i.test(file.name)
      )

      if (droppedFiles.length > 0) {
        if (batchUploadEnabled) {
          onFilesSelected([...files, ...droppedFiles])
        } else {
          onFilesSelected([droppedFiles[0]])
        }
      }
    },
    [files, onFilesSelected, batchUploadEnabled],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      if (batchUploadEnabled) {
        onFilesSelected([...files, ...selectedFiles])
      } else {
        onFilesSelected([selectedFiles[0]])
      }
    }
  }

  const removeFile = (index: number) => {
    onFilesSelected(files.filter((_, i) => i !== index))
  }

  const toggleBatchUpload = () => {
    const newState = !batchUploadEnabled
    setBatchUploadEnabled(newState)
    // If disabling batch mode and multiple files exist, keep only the first one
    if (!newState && files.length > 1) {
      onFilesSelected([files[0]])
    }
  }

  return (
    <div className="w-full space-y-6">
      <Card className="border-border bg-card p-4 shadow-sm sm:p-8">
        <div className="mb-8">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="flex items-center gap-3 text-xl font-bold text-foreground sm:text-2xl">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Upload className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
              </div>
              Data Upload
            </h2>
            <Badge
              variant="outline"
              className={cn(
                "w-fit cursor-pointer px-3 py-1.5 text-sm transition-colors",
                batchUploadEnabled
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}
              onClick={toggleBatchUpload}
            >
              <Layers className="mr-1.5 h-3.5 w-3.5" />
              Batch Upload {batchUploadEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground sm:text-base">
            {batchUploadEnabled
              ? "Upload multiple EEG dataset files for batch ADHD classification analysis."
              : "Upload a single EEG dataset file for detailed ADHD classification analysis."}
          </p>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className={cn(
            "flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:min-h-[400px] sm:p-12",
            isDragging
              ? "scale-[0.99] border-primary bg-primary/5 shadow-inner"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className={cn("rounded-full p-4 transition-all sm:p-6", isDragging ? 'bg-primary/20' : 'bg-muted')}>
              <Upload className={cn("h-8 w-8 sm:h-12 sm:w-12", isDragging ? 'text-primary' : 'text-muted-foreground')} />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground sm:text-xl">
                Drop {batchUploadEnabled ? "multiple" : "single"} EEG {batchUploadEnabled ? "files" : "file"} here or browse
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Supports .EDF / .XML / .CSV / .MAT • {batchUploadEnabled ? "Batch" : "Single"} processing
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              multiple={batchUploadEnabled}
              accept=".xml,.csv,.mat,.edf"
              onChange={handleFileInput}
              className="hidden"
            />
            <Button size="lg" className="mt-2 w-full sm:mt-4 sm:w-auto">
              Browse Files
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-accent/20 bg-accent/5 p-4 sm:p-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row">
            <div className="mb-2 flex items-center gap-2 sm:mb-0">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent sm:h-6 sm:w-6" />
                <span className="font-semibold sm:hidden">Supported Channels:</span>
            </div>
            <div className="flex-1">
              <p className="mb-3 hidden text-base font-semibold text-foreground sm:block">Channels Supported (19 channels):</p>
              <div className="flex flex-wrap gap-2">
                {EEG_CHANNELS.map((channel) => (
                  <span
                    key={channel}
                    className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs font-medium text-foreground shadow-sm sm:px-2.5 sm:py-1.5"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {files.length > 0 && (
        <Card className="animate-in fade-in slide-in-from-top-4 border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Selected Files ({files.length})
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
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border bg-background text-xs font-bold">
                    {i + 1}
                  </div>
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