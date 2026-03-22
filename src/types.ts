export type ClassificationResult = {
  filename: string

  // Proposed Model (Primary)
  proposed_classification: "ADHD Detected" | "Control (No ADHD)"
  proposed_confidence: number

  // Baseline Model (Secondary)
  baseline_classification: "ADHD Detected" | "Control (No ADHD)"
  baseline_confidence: number

  total_epochs: number
}