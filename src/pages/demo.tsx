import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, Filter, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import DataUploadPanel from '../components/data-upload'
import ProcessingStatusPanel from '../components/processing-status'
import ResultsView from '../components/results-view'
import type { ClassificationResult } from '../types'

export default function Demo() {
  const [results, setResults] = useState<ClassificationResult[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const handleStartProcessing = () => {
    if (files.length === 0) return
    setIsProcessing(true)
  }

  const handleProcessingComplete = () => {
    const newResults: ClassificationResult[] = files.map((file, index) => ({
      filename: file.name,
      classification: index % 2 === 0 ? "ADHD Detected" : "Control (No ADHD)",
      confidence: 89 + Math.random() * 8,
      modelUsed: "XGBoost (DART & IBL)",
      accuracy: 95.6,
      topFeatures: [
        { name: "Beta Power (Cz)", value: 24.5 },
        { name: "Theta/Beta Ratio", value: 1.87 },
        { name: "Spec. Entropy (F3)", value: 0.84 },
      ],
    }))

    setResults(newResults)
    setIsProcessing(false)
    setFiles([])
  }

  const handleNewAnalysis = () => {
    setResults([])
    setFiles([])
    setIsProcessing(false)
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-muted/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Button variant="ghost" asChild className="self-start pl-0 hover:pl-2 transition-all">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {!results.length && !isProcessing && (
          <div className="py-8 sm:py-10 bg-card border border-border/50 rounded-lg shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-3">How it Works</h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                  The system processes raw EEG signals through the multi-stage pipeline defined in our research.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-muted via-primary/20 to-muted z-0" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">1. Data Acquisition</h3>
                    <p className="text-xs text-muted-foreground px-4 mt-1.5 leading-relaxed">
                      Input raw EEG data (.edf/csv). The system parses channel data (e.g., Fz, Cz, P3) for analysis.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105">
                    <Filter className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">2. Preprocessing</h3>
                    <p className="text-xs text-muted-foreground px-4 mt-1.5 leading-relaxed">
                      Band-pass filtering (0.5-50Hz) and extraction of PSD and Spectral Entropy features.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 bg-background border-2 border-primary/20 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105">
                    <Brain className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">3. Classification</h3>
                    <p className="text-xs text-muted-foreground px-4 mt-1.5 leading-relaxed">
                      The optimized XGBoost model applies DART dropout and IBL weights to classify the subject.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex justify-center">
          {isProcessing ? (
             <ProcessingStatusPanel onComplete={handleProcessingComplete} />
          ) : results.length > 0 ? (
             <ResultsView results={results} onNewAnalysis={handleNewAnalysis} />
          ) : (
             <DataUploadPanel 
                files={files} 
                onFilesSelected={handleFilesSelected} 
                onStartProcessing={handleStartProcessing} 
             />
          )}
        </div>

      </div>
    </div>
  )
}