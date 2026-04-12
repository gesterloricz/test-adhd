import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Upload, Filter, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"

import DataUploadPanel from '../components/data-upload'
import ProcessingStatusPanel from '../components/processing-status'
import ResultsView from '../components/results-view'
import type { ClassificationResult, DatasetKey, DatasetDetail } from '../types'

const API = 'http://localhost:8000'

export default function Demo() {
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [apiResults, setApiResults] = useState<ClassificationResult[]>([])
  const [isBackendDone, setIsBackendDone] = useState(false)
  const [isAnimationDone, setIsAnimationDone] = useState(false)
  const [filesProcessed, setFilesProcessed] = useState(0)
  const [selectedDataset, setSelectedDataset] = useState<DatasetKey>("IEEE")
  const [availableDatasets, setAvailableDatasets] = useState<DatasetKey[]>([])
  const [datasetDetails, setDatasetDetails] = useState<Record<string, DatasetDetail>>({})

  // Ask backend which datasets are loaded
  useEffect(() => {
    fetch(`${API}/datasets`)
      .then(r => r.json())
      .then(data => {
        const ds: DatasetKey[] = data.available ?? []
        const details: Record<string, DatasetDetail> = data.details ?? {}
        setAvailableDatasets(ds)
        setDatasetDetails(details)
        if (ds.length > 0) setSelectedDataset(ds[0])
      })
      .catch(() => {
        // backend not running yet — show both so UI still works
        setAvailableDatasets(["IEEE", "HBN"])
        setDatasetDetails({
          IEEE: { label: "IEEE (Balanced)", note: "Balanced ADHD/Control dataset." },
          HBN: { label: "HBN (Imbalanced)", note: "Imbalanced ADHD/Control dataset." },
        })
      })
  }, [])

  const handleStartProcessing = async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    setIsBackendDone(false)
    setIsAnimationDone(false)
    setFilesProcessed(0)

    const collected: ClassificationResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const form = new FormData()
      form.append('file', file)

      try {
        const res = await fetch(
          `${API}/predict?dataset=${encodeURIComponent(selectedDataset)}`,
          { method: 'POST', body: form }
        )

        if (!res.ok) {
          let detail = res.statusText
          try { detail = (await res.json()).detail } catch { }
          alert(`Error processing ${file.name}:\n\n${detail}`)
          continue
        }

        const d = await res.json()

        collected.push({
          filename: d.filename,
          dataset: d.dataset,
          dataset_label: d.dataset_label,
          baseline_label: d.baseline_label,
          baseline_confidence: d.baseline_confidence,
          baseline_adhd_epochs: d.baseline_adhd_epochs,
          proposed_label: d.proposed_label,
          proposed_confidence: d.proposed_confidence,
          proposed_adhd_epochs: d.proposed_adhd_epochs,
          total_epochs: d.total_epochs,
          metrics: d.metrics,
          eeg_data: d.eeg_data,
        })
        setFilesProcessed(i + 1)
      } catch {
        alert(`Network error processing ${file.name}. Is the backend running?`)
      }
    }

    setApiResults(collected)
    setIsBackendDone(true)
  }

  const handleNewAnalysis = () => {
    setApiResults([]); setFiles([])
    setIsProcessing(false); setIsBackendDone(false); setIsAnimationDone(false)
  }

  const showResults = isBackendDone && isAnimationDone && apiResults.length > 0

  const renderContent = () => {
    if (showResults)
      return <ResultsView results={apiResults} onNewAnalysis={handleNewAnalysis} />

    if (isProcessing) {
      if (isBackendDone && isAnimationDone && apiResults.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-card rounded-lg border border-destructive/20 w-full max-w-2xl mx-auto shadow-sm">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <span className="text-destructive font-bold text-xl">!</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Processing Failed</h3>
            <p className="text-muted-foreground text-center mb-6">
              Check that your file has exactly 19 channels in the 10-20 EEG system.
            </p>
            <Button onClick={handleNewAnalysis}>Try Another File</Button>
          </div>
        )
      }
      return (
        <ProcessingStatusPanel
          isBackendDone={isBackendDone}
          onComplete={() => setIsAnimationDone(true)}
          totalFiles={files.length}
          filesProcessed={filesProcessed}
        />
      )
    }

    return (
      <DataUploadPanel
        files={files}
        selectedDataset={selectedDataset}
        availableDatasets={availableDatasets}
        datasetDetails={datasetDetails}
        onFilesSelected={setFiles}
        onStartProcessing={handleStartProcessing}
        onDatasetChange={d => setSelectedDataset(d as DatasetKey)}
      />
    )
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-muted/10 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6 md:space-y-8">

        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <Button variant="ghost" asChild className="pl-0 hover:pl-2 transition-all">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
        </div>

        {!apiResults.length && !isProcessing && (
          <div className="animate-in fade-in zoom-in-95 duration-700 rounded-lg border border-border/50 bg-card py-8 shadow-sm sm:py-10">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="mb-8 text-center sm:mb-10">
                <h2 className="mb-3 text-xl font-bold sm:text-2xl">How it Works</h2>
                <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
                  Two model sets — one trained on IEEE balanced data, one on HBN imbalanced data.
                  Select which to use, upload any unseen EEG file, get instant classification.
                </p>
              </div>
              <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="absolute left-[16%] right-[16%] top-8 z-0 hidden h-0.5 bg-linear-to-r from-muted via-primary/20 to-muted md:block" />
                <StepIcon delay={100} Icon={Upload} title="1. Select Model & Upload"
                  desc="Choose IEEE or HBN model set. Drop any .mat file with 19-channel EEG data." />
                <StepIcon delay={300} Icon={Filter} title="2. Preprocessing"
                  desc="Bandpass filter → epoch segmentation → 190-dim PSD + entropy features → scaled with matching scaler." />
                <StepIcon delay={500} Icon={Brain} title="3. Classification"
                  desc="Baseline XGBoost and Optimized XGBoost DART-IBL both classify. Results shown side-by-side." />
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

function StepIcon({ Icon, title, desc, delay }: { Icon: any; title: string; desc: string; delay: number }) {
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
