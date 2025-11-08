export interface AnalysisResult {
  executiveSummary: string;
  detailedAnalysis: string;
  subjectProfiles: string[];
  locationAssessment: {
    potentialLocation: string;
    reasoning: string;
  };
  metadataInsights: string;
  threatAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
    justification: string;
  };
}
