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

  const renderContent = () => {
    if (isProcessing) {
        return <ProcessingStatusPanel onComplete={handleProcessingComplete} />
    }
    if (results.length > 0) {
        return <ResultsView results={results} onNewAnalysis={handleNewAnalysis} />
    }
    return (
        <DataUploadPanel 
            files={files} 
            onFilesSelected={handleFilesSelected} 
            onStartProcessing={handleStartProcessing} 
        />
    )
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-muted/10 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">
        
        <div className="animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Button variant="ghost" asChild className="self-start pl-0 hover:pl-2 transition-all">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {!results.length && !isProcessing && (
          <div className="animate-in fade-in zoom-in-95 duration-700 rounded-lg border border-border/50 bg-card py-8 shadow-sm sm:py-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mb-8 text-center sm:mb-10">
                <h2 className="mb-3 text-xl font-bold sm:text-2xl">How it Works</h2>
                <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
                  The system processes raw EEG signals through the multi-stage pipeline defined in our research.
                </p>
              </div>

              <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="absolute left-[16%] right-[16%] top-8 z-0 hidden h-0.5 bg-gradient-to-r from-muted via-primary/20 to-muted md:block" />
                
                <StepIcon delay={100} Icon={Upload} title="1. Data Acquisition" desc="Input raw EEG data (.edf/csv). The system parses channel data for analysis." />
                <StepIcon delay={300} Icon={Filter} title="2. Preprocessing" desc="Band-pass filtering (0.5-50Hz) and extraction of PSD and Spectral Entropy features." />
                <StepIcon delay={500} Icon={Brain} title="3. Classification" desc="The optimized XGBoost model applies DART dropout and IBL weights to classify the subject." />
              </div>
            </div>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 flex w-full justify-center fill-mode-both">
            {renderContent()}
        </div>

      </div>
    </div>
  )
}

function StepIcon({ Icon, title, desc, delay }: { Icon: any, title: string, desc: string, delay: number }) {
    return (
        <div 
          className="relative z-10 flex flex-col items-center space-y-3 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
          style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-background shadow-sm transition-transform hover:scale-105 hover:border-primary/50">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 px-4 leading-relaxed text-xs text-muted-foreground">{desc}</p>
            </div>
        </div>
    )
}