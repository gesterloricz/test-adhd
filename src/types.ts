export type ClassificationResult = {
  filename: string
  classification: "ADHD Detected" | "Control (No ADHD)"
  confidence: number
  topFeatures: {
    name: string
    value: number
  }[]
  modelUsed: string
  accuracy: number
}