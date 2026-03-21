import { BaseAdapter } from "@/lib/adapters/_base";

export class ArtificialAnalysisAdapter extends BaseAdapter {
  key = "artificial_analysis" as const;
  displayName = "Artificial Analysis Intelligence Index";
  sourceUrl = "https://artificialanalysis.ai/";
  includedInOverall = true;
}
