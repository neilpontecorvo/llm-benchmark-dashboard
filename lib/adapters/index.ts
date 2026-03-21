import { AiderAdapter } from "@/lib/adapters/aider";
import { ArenaTextAdapter } from "@/lib/adapters/arena-text";
import { ArtificialAnalysisAdapter } from "@/lib/adapters/artificial-analysis";
import { HuggingFaceOpenLLMAdapter } from "@/lib/adapters/hf-open-llm";
import { LiveBenchAdapter } from "@/lib/adapters/livebench";
import { SWEBenchAdapter } from "@/lib/adapters/swebench";
import { BenchmarkAdapter } from "@/lib/types";

export const adapters: BenchmarkAdapter[] = [
  new ArtificialAnalysisAdapter(),
  new ArenaTextAdapter(),
  new SWEBenchAdapter(),
  new AiderAdapter(),
  new LiveBenchAdapter(),
  new HuggingFaceOpenLLMAdapter()
];
