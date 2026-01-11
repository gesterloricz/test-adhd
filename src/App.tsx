import { useState } from 'react'
import Header from './components/Header'
import SystemInfoPanel from './components/SystemInfoPanel'
import DataUploadPanel from './components/DataUploadPanel'
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

  const handleFilesProcessed = (newResults: ClassificationResult[]) => {
    setResults(newResults)
  }

  const handleNewAnalysis = () => {
    setResults([])
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
            {results.length === 0 ? (
              <DataUploadPanel onFilesProcessed={handleFilesProcessed} />
            ) : (
              <ResultsView results={results} onNewAnalysis={handleNewAnalysis} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App