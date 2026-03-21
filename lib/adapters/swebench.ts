import { BaseAdapter } from "@/lib/adapters/_base";

export class SWEBenchAdapter extends BaseAdapter {
  key = "swe_bench_verified" as const;
  displayName = "SWE-bench Verified";
  sourceUrl = "https://www.swebench.com/";
  includedInOverall = true;
}
