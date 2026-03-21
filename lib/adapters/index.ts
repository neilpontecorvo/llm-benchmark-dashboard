import { AiderAdapter } from "@/lib/adapters/aider";
import { ArenaImageToVideoAdapter } from "@/lib/adapters/arena-image-to-video";
import { ArenaTextAdapter } from "@/lib/adapters/arena-text";
import { ArenaTextToImageAdapter } from "@/lib/adapters/arena-text-to-image";
import { ArenaTextToVideoAdapter } from "@/lib/adapters/arena-text-to-video";
import { ArtificialAnalysisAdapter } from "@/lib/adapters/artificial-analysis";
import { GPQADiamondAdapter } from "@/lib/adapters/gpqa-diamond";
import { HuggingFaceOpenLLMAdapter } from "@/lib/adapters/hf-open-llm";
import { HumanitysLastExamAdapter } from "@/lib/adapters/humanitys-last-exam";
import { LiveBenchAdapter } from "@/lib/adapters/livebench";
import { MmmluAdapter } from "@/lib/adapters/mmmlu";
import { SWEBenchAdapter } from "@/lib/adapters/swebench";
import { BenchmarkAdapter } from "@/lib/types";

export const adapters: BenchmarkAdapter[] = [
  // Text / general
  new ArtificialAnalysisAdapter(),
  new ArenaTextAdapter(),
  new LiveBenchAdapter(),
  new HuggingFaceOpenLLMAdapter(),
  // Coding
  new SWEBenchAdapter(),
  new AiderAdapter(),
  // Multimodal (Arena)
  new ArenaTextToImageAdapter(),
  new ArenaTextToVideoAdapter(),
  new ArenaImageToVideoAdapter(),
  // Reasoning & knowledge (Vellum)
  new GPQADiamondAdapter(),
  new HumanitysLastExamAdapter(),
  new MmmluAdapter()
];
