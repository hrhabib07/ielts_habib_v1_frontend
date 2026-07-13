import type { UiLocale } from "@/src/lib/ui-locale";

export interface SquadUiCopy {
  readonly navLabel: string;
  readonly title: string;
  readonly eyebrow: string;
  readonly emptyTitle: string;
  readonly emptyBody: string;
  readonly createSquad: string;
  readonly joinSquad: string;
  readonly weeklyLeaderboard: string;
  readonly weeklyXp: string;
  readonly lifetimeXp: string;
  readonly weeklyRank: string;
  readonly squadLeader: string;
  readonly members: string;
  readonly inviteCode: string;
  readonly copyCode: string;
  readonly copied: string;
  readonly weeklyChampion: string;
  readonly activity: string;
  readonly missionLabel: (n: number) => string;
  readonly totalXp: string;
  readonly yourWeekly: string;
  readonly yourLifetime: string;
  readonly leaveSquad: string;
  readonly deleteSquad: string;
  readonly transferLead: string;
  readonly removeMember: string;
  readonly createTitle: string;
  readonly createHint: string;
  readonly squadName: string;
  readonly createSubmit: string;
  readonly joinTitle: string;
  readonly joinHint: string;
  readonly joinSubmit: string;
  readonly leaderboardTitle: string;
  readonly leaderboardHint: string;
  readonly playerPromoTitle: string;
  readonly playerPromoBody: string;
  readonly profileSquad: string;
  readonly noSquadProfile: string;
  readonly viewSquad: string;
  readonly badges: string;
  readonly confirmLeave: string;
  readonly confirmDelete: string;
  readonly back: string;
  readonly joinFailed: string;
  readonly squadNotFound: string;
  readonly squadFull: string;
  readonly alreadyInSquad: string;
}

export const SQUAD_UI_COPY: Record<UiLocale, SquadUiCopy> = {
  bn: {
    navLabel: "স্কোয়াড",
    title: "English Squad",
    eyebrow: "বন্ধুদের সাথে ইংরেজি শিখো",
    emptyTitle: "তুমি এখনো কোনো Squad-এ নেই",
    emptyBody:
      "নিজের Squad তৈরি করো অথবা বন্ধুদের invite code দিয়ে যোগ দাও। একসাথে XP অর্জন করো আর leaderboard-এ উঠো!",
    createSquad: "Squad তৈরি করো",
    joinSquad: "Squad-এ যোগ দাও",
    weeklyLeaderboard: "সাপ্তাহিক Leaderboard",
    weeklyXp: "সাপ্তাহিক XP",
    lifetimeXp: "লাইফটাইম XP",
    weeklyRank: "সাপ্তাহিক র‍্যাঙ্ক",
    squadLeader: "Squad Leader",
    members: "সদস্য",
    inviteCode: "Invite code",
    copyCode: "কপি করো",
    copied: "কপি হয়েছে!",
    weeklyChampion: "🏆 Weekly Champion",
    activity: "সাম্প্রতিক কার্যক্রম",
    missionLabel: (n) => `Mission ${String(n).padStart(2, "0")}`,
    totalXp: "মোট XP",
    yourWeekly: "তোমার সাপ্তাহিক অবদান",
    yourLifetime: "তোমার লাইফটাইম অবদান",
    leaveSquad: "Squad ছেড়ে যাও",
    deleteSquad: "Squad মুছে ফেলো",
    transferLead: "Leadership হস্তান্তর",
    removeMember: "সদস্য সরাও",
    createTitle: "নতুন Squad তৈরি",
    createHint: "একটি ছোট নাম বেছে নাও। বন্ধুরা invite code দিয়ে যোগ দেবে।",
    squadName: "Squad নাম",
    createSubmit: "Squad তৈরি করো",
    joinTitle: "Squad-এ যোগ দাও",
    joinHint: "বন্ধুর দেওয়া ছোট invite code লিখো (যেমন GAM4X2)।",
    joinSubmit: "যোগ দাও",
    leaderboardTitle: "সাপ্তাহিক Squad Leaderboard",
    leaderboardHint: "প্রতি শুক্রবার রাত ১২টায় (বাংলাদেশ সময়) Weekly XP রিসেট হয়।",
    playerPromoTitle: "English Squad-এ যোগ দাও",
    playerPromoBody: "বন্ধুদের নিয়ে XP জমা করো আর leaderboard-এ উঠো!",
    profileSquad: "তোমার Squad",
    noSquadProfile: "এখনো কোনো Squad নেই",
    viewSquad: "Squad দেখো",
    badges: "Squad Badges",
    confirmLeave: "তুমি কি নিশ্চিত যে Squad ছেড়ে যেতে চাও?",
    confirmDelete: "সব সদস্য সরিয়ে Squad মুছে ফেলবে। নিশ্চিত?",
    back: "ফিরে যাও",
    joinFailed: "Squad-এ যোগ দেওয়া যায়নি। আবার চেষ্টা করো।",
    squadNotFound: "এই invite code-এ কোনো Squad পাওয়া যায়নি।",
    squadFull: "এই Squad এখন পূর্ণ। অন্য কোড চেষ্টা করো।",
    alreadyInSquad: "তুমি ইতিমধ্যে একটি Squad-এ আছো। আগে সেটি ছেড়ে যাও।",
  },
  en: {
    navLabel: "Squad",
    title: "English Squad",
    eyebrow: "Learn English with friends",
    emptyTitle: "You are not in a Squad yet",
    emptyBody:
      "Create your own Squad or join with a friend's invite code. Earn XP together and climb the leaderboard!",
    createSquad: "Create Squad",
    joinSquad: "Join Squad",
    weeklyLeaderboard: "Weekly leaderboard",
    weeklyXp: "Weekly XP",
    lifetimeXp: "Lifetime XP",
    weeklyRank: "Weekly rank",
    squadLeader: "Squad leader",
    members: "Members",
    inviteCode: "Invite code",
    copyCode: "Copy",
    copied: "Copied!",
    weeklyChampion: "🏆 Weekly champion",
    activity: "Recent activity",
    missionLabel: (n) => `Mission ${String(n).padStart(2, "0")}`,
    totalXp: "Total XP",
    yourWeekly: "Your weekly contribution",
    yourLifetime: "Your lifetime contribution",
    leaveSquad: "Leave Squad",
    deleteSquad: "Delete Squad",
    transferLead: "Transfer leadership",
    removeMember: "Remove member",
    createTitle: "Create a new Squad",
    createHint: "Pick a short name. Friends can join with your invite code.",
    squadName: "Squad name",
    createSubmit: "Create Squad",
    joinTitle: "Join a Squad",
    joinHint: "Enter your friend's short invite code (e.g. GAM4X2).",
    joinSubmit: "Join",
    leaderboardTitle: "Weekly Squad leaderboard",
    leaderboardHint: "Weekly XP resets every Friday at midnight (Bangladesh time).",
    playerPromoTitle: "Join an English Squad",
    playerPromoBody: "Team up with friends, earn XP, and climb the leaderboard!",
    profileSquad: "Your Squad",
    noSquadProfile: "No Squad yet",
    viewSquad: "View Squad",
    badges: "Squad badges",
    confirmLeave: "Are you sure you want to leave this Squad?",
    confirmDelete: "This will remove all members and delete the Squad. Are you sure?",
    back: "Back",
    joinFailed: "Could not join the Squad. Please try again.",
    squadNotFound: "Squad not found. Check the invite code and try again.",
    squadFull: "This Squad is full. Try a different code.",
    alreadyInSquad: "You are already in a Squad. Leave it before joining another.",
  },
} as const;

/** @deprecated Use useSquadUiCopy() */
export const SQUAD_UI = SQUAD_UI_COPY.bn;

export const SQUAD_BADGE_LABELS: Record<string, string> = {
  bronze: "Bronze Squad",
  silver: "Silver Squad",
  gold: "Gold Squad",
  platinum: "Platinum Squad",
  diamond: "Diamond Squad",
  legendary: "Legendary Squad",
};
