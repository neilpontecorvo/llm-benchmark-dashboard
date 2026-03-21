import { BaseAdapter } from "@/lib/adapters/_base";

export class HuggingFaceOpenLLMAdapter extends BaseAdapter {
  key = "hf_open_llm" as const;
  displayName = "Hugging Face Open LLM";
  sourceUrl = "https://huggingface.co/open-llm-leaderboard";
  includedInOverall = false;
}
