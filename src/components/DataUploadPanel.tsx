import type React from "react"
import { useState } from "react"
import { Upload } from "lucide-react"
import type { ClassificationResult } from "../App"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Props = {
  onFilesProcessed: (results: ClassificationResult[]) => void
}

const CHANNELS = [
  "Fz", "Cz", "Pz", "C3", "T3", "C4", "T4", "Fp1", "Fp2", 
  "F3", "F4", "F7", "F8", "P3", "P4", "T5", "T6", "O1", "O2",
]

export default function DataUploadPanel({ onFilesProcessed }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [batchUploadEnabled, setBatchUploadEnabled] = useState(true)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      processFiles(files)
    }
  }

  const processFiles = (files: File[]) => {
    // Simulate processing with mock results
    const mockResults: ClassificationResult[] = files.map((file, index) => ({
      filename: file.name,
      result: index % 2 === 0 ? "ADHD Detected" : "Control (No ADHD)",
      confidence: 87 + Math.random() * 10,
      topFeatures: [
        
      ],
    }))

    setTimeout(() => {
      onFilesProcessed(mockResults)
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Data Upload Panel</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`cursor-pointer transition-colors ${
              batchUploadEnabled
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
            onClick={() => setBatchUploadEnabled(!batchUploadEnabled)}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${batchUploadEnabled ? "bg-green-500" : "bg-gray-400"}`}
            ></span>
            Batch Upload {batchUploadEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        {/* Dynamic Description based on state */}
        <CardDescription>
          {batchUploadEnabled 
            ? "Upload multiple EEG dataset files for batch ADHD classification"
            : "Upload a single EEG dataset file for detailed ADHD classification"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/50 hover:border-muted-foreground/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-background border flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground mb-1">
                Drop {batchUploadEnabled ? "multiple" : "single"} EEG {batchUploadEnabled ? "files" : "file"} here or
                browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports .XML / .CSV / .MAT formats{" "}
                {batchUploadEnabled ? "• Batch processing" : "• Single file processing"}
              </p>
            </div>
            <Button variant="outline" asChild>
              <label className="cursor-pointer">
                Browse Files
                <input
                  type="file"
                  multiple={batchUploadEnabled}
                  accept=".xml,.csv,.mat"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">Channels Supported (19 channels):</h3>
          <div className="grid grid-cols-9 gap-2">
            {CHANNELS.map((channel) => (
              <Badge key={channel} variant="outline" className="justify-center">
                {channel}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}