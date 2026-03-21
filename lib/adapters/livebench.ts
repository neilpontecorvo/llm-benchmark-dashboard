import { BaseAdapter } from "@/lib/adapters/_base";

export class LiveBenchAdapter extends BaseAdapter {
  key = "livebench" as const;
  displayName = "LiveBench";
  sourceUrl = "https://livebench.ai/";
  includedInOverall = true;
}
