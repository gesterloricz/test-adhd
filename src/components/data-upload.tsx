import type React from "react"
import { useCallback, useState } from "react"
import { Upload, X, FileText, CheckCircle2, Layers } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DataUploadPanelProps {
  onFilesSelected: (files: File[]) => void
  onStartProcessing: () => void
  files: File[]
}

const EEG_CHANNELS = [
  "Fz", "Cz", "Pz", "C3", "T3", "C4", "T4", "Fp1", "Fp2",
  "F3", "F4", "F7", "F8", "P3", "P4", "T5", "T6", "O1", "O2",
]

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
        (file) => file.name.endsWith(".xml") || file.name.endsWith(".csv") || file.name.endsWith(".mat") || file.name.endsWith(".edf"),
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
    const newFiles = files.filter((_, i) => i !== index)
    onFilesSelected(newFiles)
  }

  const clearAllFiles = () => {
    onFilesSelected([])
  }

  return (
    <div className="space-y-6 w-full">
      <Card className="p-4 sm:p-8 bg-card border-border shadow-sm">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              Data Upload
            </h2>
            <Badge
              variant="outline"
              className={`cursor-pointer px-3 py-1.5 text-sm transition-colors w-fit ${batchUploadEnabled
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                }`}
              onClick={() => {
                setBatchUploadEnabled(!batchUploadEnabled)
                if (!batchUploadEnabled === false && files.length > 1) {
                  onFilesSelected([files[0]])
                }
              }}
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Batch Upload {batchUploadEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
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
          className={`
            border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-all min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center cursor-pointer
            ${isDragging
              ? "border-primary bg-primary/5 scale-[0.99] shadow-inner"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
            }
          `}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className={`p-4 sm:p-6 rounded-full transition-all ${isDragging ? 'bg-primary/20' : 'bg-muted'}`}>
              <Upload className={`w-8 h-8 sm:w-12 sm:h-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-semibold text-foreground">
                Drop {batchUploadEnabled ? "multiple" : "single"} EEG {batchUploadEnabled ? "files" : "file"} here or browse
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Supports .EDF / .XML / .CSV / .MAT • {batchUploadEnabled ? "Batch" : "Single"} processing
              </p>
            </div>
            <input
              type="file"
              multiple={batchUploadEnabled}
              accept=".xml,.csv,.mat,.edf"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button size="lg" className="mt-2 sm:mt-4 w-full sm:w-auto">
              Browse Files
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 sm:p-6 bg-accent/5 rounded-xl border border-accent/20">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-accent mt-0.5 flex-shrink-0" />
                <span className="font-semibold sm:hidden">Supported Channels:</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-foreground mb-3 hidden sm:block">Channels Supported (19 channels):</p>
              <div className="flex flex-wrap gap-2">
                {EEG_CHANNELS.map((channel) => (
                  <span
                    key={channel}
                    className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-background text-xs font-mono font-medium text-foreground rounded-md border border-border shadow-sm"
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
        <Card className="p-4 sm:p-6 bg-card border-border shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Selected Files ({files.length})
            </h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" size="sm" onClick={clearAllFiles} className="flex-1 sm:flex-none">Clear All</Button>
              <Button onClick={onStartProcessing} className="flex-1 sm:flex-none">Start Processing</Button>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 bg-background rounded flex-shrink-0 flex items-center justify-center text-xs font-bold border">
                    {i + 1}
                  </div>
                  <div className="text-sm font-medium truncate">{file.name}</div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={() => removeFile(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}