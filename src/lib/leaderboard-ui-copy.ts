import type { UiLocale } from "@/src/lib/ui-locale";

export interface LeaderboardUiCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly searchLabel: string;
  readonly searchPlaceholder: string;
  readonly searchAction: string;
  readonly findMe: string;
  readonly yourRank: string;
  readonly empty: string;
  readonly emptySearch: string;
  readonly players: (n: number) => string;
  readonly level: string;
  readonly xp: string;
  readonly missions: string;
  readonly you: string;
  readonly prev: string;
  readonly next: string;
  readonly pageOf: (page: number, totalPages: number) => string;
  readonly openProfile: string;
  readonly podiumHint: string;
  readonly playersAtRank: string;
  readonly tieRule: string;
  readonly restOfBoard: string;
  readonly backToPlay: string;
  readonly loading: string;
  readonly tabWeekly: string;
  readonly tabAllTime: string;
  readonly weeklyXpLabel: string;
  readonly weeklyPodiumHint: string;
}

export const LEADERBOARD_UI_COPY: Record<UiLocale, LeaderboardUiCopy> = {
  bn: {
    title: "XP Leaderboard",
    subtitle: "প্রতিটি খেলোয়াড়ের র‍্যাঙ্ক · XP দিয়ে এগিয়ে যাও, প্রোফাইল খুলে দেখো।",
    searchLabel: "খেলোয়াড় খুঁজো",
    searchPlaceholder: "নাম বা username লিখো…",
    searchAction: "খুঁজো",
    findMe: "আমাকে খুঁজো",
    yourRank: "তোমার র‍্যাঙ্ক",
    empty: "এখনো কেউ leaderboard-এ নেই। খেলা শুরু করো!",
    emptySearch: "কোনো খেলোয়াড় পাওয়া যায়নি।",
    players: (n) => `${n.toLocaleString("en-US")} জন খেলোয়াড়`,
    level: "লেভেল",
    xp: "XP",
    missions: "মিশন",
    you: "তুমি",
    prev: "আগে",
    next: "পরে",
    pageOf: (page, totalPages) => `পৃষ্ঠা ${page} / ${totalPages}`,
    openProfile: "প্রোফাইল",
    podiumHint: "শীর্ষ ৩ · ক্যাম্পের চ্যাম্পিয়নরা",
    playersAtRank: "জন একই র‍্যাঙ্কে",
    tieRule:
      "সমান XP মানে একই র‍্যাঙ্ক। একই র‍্যাঙ্কের তালিকায় বেশি মিশন, বেশি লেভেল, তারপর আগে XP অর্জন করাকে অগ্রাধিকার দেওয়া হয়।",
    restOfBoard: "বাকি র‍্যাঙ্ক",
    backToPlay: "খেলায় ফিরে যাও",
    loading: "লোড হচ্ছে…",
    tabWeekly: "এই সপ্তাহের সেরা",
    tabAllTime: "সর্বকালের সেরা",
    weeklyXpLabel: "weekly XP",
    weeklyPodiumHint: "টপ ৩ · ২০ টাকা রেস",
  },
  en: {
    title: "XP Leaderboard",
    subtitle: "Every player ranked by XP · climb up, open profiles, get motivated.",
    searchLabel: "Find a player",
    searchPlaceholder: "Type a name or username…",
    searchAction: "Search",
    findMe: "Find me",
    yourRank: "Your rank",
    empty: "No players on the board yet. Start playing!",
    emptySearch: "No players matched that search.",
    players: (n) => `${n.toLocaleString("en-US")} players`,
    level: "Level",
    xp: "XP",
    missions: "Missions",
    you: "You",
    prev: "Prev",
    next: "Next",
    pageOf: (page, totalPages) => `Page ${page} / ${totalPages}`,
    openProfile: "Profile",
    podiumHint: "Top 3 · camp champions",
    playersAtRank: "players tied",
    tieRule:
      "Equal XP means equal rank. Within a tied rank, players are ordered by missions completed, level reached, then who reached the XP earlier.",
    restOfBoard: "Rest of the board",
    backToPlay: "Back to play",
    loading: "Loading…",
    tabWeekly: "এই সপ্তাহের সেরা",
    tabAllTime: "সর্বকালের সেরা",
    weeklyXpLabel: "weekly XP",
    weeklyPodiumHint: "Top 3 · 20 TK race",
  },
} as const;
