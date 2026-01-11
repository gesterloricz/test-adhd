import { useState } from 'react'
import Header from './components/Header'
import SystemInfoPanel from './components/SystemInfoPanel'
import DataUploadPanel from './components/DataUploadPanel'
import ProcessingStatusPanel from './components/processingStatus'
import ResultsView from './components/ResultsView'

export type ClassificationResult = {
  filename: string
  result: string
  confidence: number
  topFeatures: {
    name: string
    value: number
  }[]
}

function App() {
  const [results, setResults] = useState<ClassificationResult[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. Updates the file queue when user drops files or deletes them
  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
  }

  // 2. Switches to the processing view
  const handleStartProcessing = () => {
    if (files.length === 0) return
    setIsProcessing(true)
  }

  // 3. Called when ProcessingStatusPanel finishes its animation
  const handleProcessingComplete = () => {
    // Generate results for the files that were in the queue
    const newResults: ClassificationResult[] = files.map((file, index) => ({
      filename: file.name,
      result: index % 2 === 0 ? "ADHD Detected" : "Control (No ADHD)",
      confidence: 87 + Math.random() * 10,
      topFeatures: [
        { name: "Beta Power (C4)", value: 26.2 },
        { name: "Wavelet Energy (Fp2)", value: 20.1 },
        { name: "Fractal Dim (F4)", value: 14.9 },
      ],
    }))

    setResults(newResults)
    setIsProcessing(false)
    setFiles([]) // Clear the queue after processing is done
  }

  // 4. Resets everything for a fresh start
  const handleNewAnalysis = () => {
    setResults([])
    setFiles([])
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SystemInfoPanel />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {isProcessing ? (
              // Show Status Panel while processing
              <ProcessingStatusPanel onComplete={handleProcessingComplete} />
            ) : results.length > 0 ? (
              // Show Results if processing is done
              <ResultsView results={results} onNewAnalysis={handleNewAnalysis} />
            ) : (
              // Otherwise show Upload Panel
              <DataUploadPanel 
                files={files} 
                onFilesSelected={handleFilesSelected} 
                onStartProcessing={handleStartProcessing} 
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App