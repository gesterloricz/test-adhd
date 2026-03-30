import type { ClassificationResult } from "../types"
import SingleResultView from "./single-result-view"
import BatchResultsView from "./batch-results-view"

interface ResultsViewProps {
  onNewAnalysis: () => void
  results: ClassificationResult[]
}

export default function ResultsView({ onNewAnalysis, results }: ResultsViewProps) {
  // if only 1 result show the single file directly (standalone mode)
  if (results.length === 1) {
    return (
        <SingleResultView 
            result={results[0]} 
            onNewAnalysis={onNewAnalysis} 
            standalone={true} 
        />
    )
  }

  // otherwise show the batch view
  return (
    <BatchResultsView 
        results={results} 
        onNewAnalysis={onNewAnalysis} 
    />
  )
}