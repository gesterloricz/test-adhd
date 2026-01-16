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
        (file) => file.name.endsWith(".xml") || file.name.endsWith(".csv") || file.name.endsWith(".mat"),
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
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Data Upload
            </h2>
            <Badge
                variant="outline"
                className={`cursor-pointer transition-colors ${
                  batchUploadEnabled
                    ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => {
                   setBatchUploadEnabled(!batchUploadEnabled)
                   if (!batchUploadEnabled === false && files.length > 1) {
                       // If turning off batch mode, keep only the first file
                       onFilesSelected([files[0]])
                   }
                }}
              >
              <Layers className="w-3 h-3 mr-1" />
              Batch Upload {batchUploadEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {batchUploadEnabled 
              ? "Upload multiple EEG dataset files for batch ADHD classification"
              : "Upload a single EEG dataset file for detailed ADHD classification"}
          </p>
        </div>

        {/* upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground mb-1">
                Drop {batchUploadEnabled ? "multiple" : "single"} EEG {batchUploadEnabled ? "files" : "file"} here or browse
              </p>
              <p className="text-sm text-muted-foreground">Supports .XML / .CSV / .MAT formats • {batchUploadEnabled ? "Batch" : "Single"} processing</p>
            </div>
            <input
              type="file"
              multiple={batchUploadEnabled}
              accept=".xml,.csv,.mat"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                <span>Browse Files</span>
              </Button>
            </label>
          </div>
        </div>

        {/* Channels Supported */}
        <div className="mt-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-2">Channels Supported (19 channels):</p>
              <div className="flex flex-wrap gap-2">
                {EEG_CHANNELS.map((channel) => (
                  <span
                    key={channel}
                    className="px-2 py-1 bg-background text-xs font-mono text-foreground rounded border border-border"
                  >
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* uploaded file */}
      {files.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-foreground">Batch Queue</h3>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">
                {files.length} {files.length === 1 ? "file" : "files"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                className="text-muted-foreground bg-transparent"
              >
                Clear All
              </Button>
              <Button onClick={onStartProcessing} className="bg-primary hover:bg-primary/90">
                Start {batchUploadEnabled ? "Batch" : ""} Classification
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <FileText className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
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