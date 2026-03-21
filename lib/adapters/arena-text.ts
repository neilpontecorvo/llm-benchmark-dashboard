import { BaseAdapter } from "@/lib/adapters/_base";

export class ArenaTextAdapter extends BaseAdapter {
  key = "arena_text" as const;
  displayName = "LM Arena Text";
  sourceUrl = "https://lmarena.ai/leaderboard/text";
  includedInOverall = true;
}
