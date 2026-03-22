import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, Filter, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

import DataUploadPanel from '../components/data-upload'
import ProcessingStatusPanel from '../components/processing-status'
import ResultsView from '../components/results-view'
import type { ClassificationResult } from '../types'

export default function Demo() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const [apiResults, setApiResults] = useState<ClassificationResult[]>([])
  const [isBackendDone, setIsBackendDone] = useState(false)
  const [isAnimationDone, setIsAnimationDone] = useState(false)

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  const handleStartProcessing = async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    setIsBackendDone(false)
    setIsAnimationDone(false)
    
    try {
      const newResults: ClassificationResult[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          body: formData,
        })
        
        
        if (!response.ok) {
           let errorDetail = "Unknown error"
           try {
             const errorData = await response.json()
             errorDetail = errorData.detail || errorData.message || response.statusText
           } catch(e) {}
           console.error(`Failed to process ${file.name}:`, errorDetail)
           alert(`Error processing ${file.name}:\n\n${errorDetail}\n\nPlease check the file format or try another file.`)
           continue
        }
        
        const data = await response.json()
        
        newResults.push({
          filename: data.filename,
          proposed_classification: data.proposed_prediction === 1 ? "ADHD Detected" : "Control (No ADHD)",
          proposed_confidence: data.proposed_confidence,
          baseline_classification: data.baseline_prediction === 1 ? "ADHD Detected" : "Control (No ADHD)",
          baseline_confidence: data.baseline_confidence,
          total_epochs: data.total_epochs,
        })
      }
      
      setApiResults(newResults)
      setIsBackendDone(true)
    } catch (e) {
      console.error("API error:", e)
      setIsBackendDone(true) // allow UI to proceed even if error to show empty or error state
    }
  }

  const handleProcessingComplete = () => {
    setIsAnimationDone(true)
  }
  
  // Show results only when both backend and animation are done
  const shouldShowResults = isBackendDone && isAnimationDone && apiResults.length > 0

  const handleNewAnalysis = () => {
    setApiResults([])
    setApiResults([])
    setFiles([])
    setIsProcessing(false)
    setIsBackendDone(false)
    setIsAnimationDone(false)
  }

  const renderContent = () => {
    if (shouldShowResults) {
        return <ResultsView results={apiResults} onNewAnalysis={handleNewAnalysis} />
    }
    if (isProcessing) {
        if (isBackendDone && isAnimationDone && apiResults.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg border border-destructive/20 w-full max-w-2xl mx-auto shadow-sm">
                    <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <span className="text-destructive font-bold text-xl">!</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Processing Failed</h3>
                    <p className="text-muted-foreground text-center mb-6">
                        The backend API encountered an error while processing your EEG file. Only 19-channel recordings matched exactly with the model are supported.
                    </p>
                    <Button onClick={handleNewAnalysis} variant="default">Try Another File</Button>
                </div>
            )
        }
        return <ProcessingStatusPanel isBackendDone={isBackendDone} onComplete={handleProcessingComplete} />
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

        {!apiResults.length && !isProcessing && (
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