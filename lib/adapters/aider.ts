import { BaseAdapter } from "@/lib/adapters/_base";

export class AiderAdapter extends BaseAdapter {
  key = "aider_polyglot" as const;
  displayName = "Aider Polyglot";
  sourceUrl = "https://aider.chat/docs/leaderboards/";
  includedInOverall = true;
}
