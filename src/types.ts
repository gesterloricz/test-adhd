export type DatasetKey = "IEEE" | "HBN";
export type Classification = "ADHD Detected" | "Control (No ADHD)";

export type ConfusionMatrix = [[number, number], [number, number]];

export type ModelMetricEntry = {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  confusion_matrix: ConfusionMatrix;
};

export type TrainingMetrics = {
  baseline: ModelMetricEntry;
  proposed: ModelMetricEntry;
  trained_on: string;
};

export type ClassificationResult = {
  filename: string;
  dataset: DatasetKey;
  dataset_label: string;

  baseline_label: Classification;
  baseline_confidence: number;
  baseline_adhd_epochs: number;

  proposed_label: Classification;
  proposed_confidence: number;
  proposed_adhd_epochs: number;

  total_epochs: number;
  metrics: TrainingMetrics;
};

export type DatasetDetail = {
  label: string;
  note: string;
};
