export interface Detection {
  bbox: [number, number, number, number];
  class: string;
  confidence: number;
}

export interface PredictionResponse {
  success: boolean;
  detections: Detection[];
  annotated_image: string;
  count: number;
  error?: string;
}
