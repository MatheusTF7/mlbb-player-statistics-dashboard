import { computed, ref, type Ref, type ComputedRef } from 'vue';
import matchesData from '../data/matches_fake.json';

export interface PlayerStat {
  nickname: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  medal: string;
  ratio: number;
  position: number;
  is_mvp: boolean;
}

export interface MatchData {
  result: string;
  my_team_score: number;
  adversary_team_score: number;
  duration: string;
  my_team: PlayerStat[];
  enemy_team: PlayerStat[];
}

export interface PlayerAggregatedStats {
  nickname: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgRatio: number;
  totalGold: number;
  avgGold: number;
  mvpCount: number;
  goldMedals: number;
  silverMedals: number;
  copperMedals: number;
  bestRatio: number;
  worstRatio: number;
  matchHistory: MatchPlayerData[];
}

export interface MatchPlayerData {
  matchIndex: number;
  result: string;
  duration: string;
  teamScore: number;
  enemyScore: number;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  medal: string;
  ratio: number;
  position: number;
  is_mvp: boolean;
}

export interface OverallStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  avgKillsPerMatch: number;
  avgDeathsPerMatch: number;
  avgAssistsPerMatch: number;
  avgDuration: string;
  avgTeamScore: number;
  avgEnemyScore: number;
}

function parseDuration(duration: string): number {
  const [min, sec] = duration.split(':').map(Number);
  return (min || 0) * 60 + (sec || 0);
}

function formatDuration(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = Math.round(totalSeconds % 60);
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function useMatchStats() {
  const matches: Ref<MatchData[]> = ref(matchesData as MatchData[]);

  // ============ Overall Stats ============
  const overallStats: ComputedRef<OverallStats> = computed(() => {
    const total = matches.value.length;
    const wins = matches.value.filter((m) => m.result === 'VICTORY').length;
    const losses = total - wins;

    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalDurationSec = 0;
    let totalTeamScore = 0;
    let totalEnemyScore = 0;

    matches.value.forEach((match) => {
      match.my_team.forEach((p) => {
        totalKills += p.kills;
        totalDeaths += p.deaths;
        totalAssists += p.assists;
      });
      totalDurationSec += parseDuration(match.duration);
      totalTeamScore += match.my_team_score;
      totalEnemyScore += match.adversary_team_score;
    });

    return {
      totalMatches: total,
      wins,
      losses,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
      totalKills,
      totalDeaths,
      totalAssists,
      avgKillsPerMatch: total > 0 ? Math.round((totalKills / total) * 10) / 10 : 0,
      avgDeathsPerMatch: total > 0 ? Math.round((totalDeaths / total) * 10) / 10 : 0,
      avgAssistsPerMatch: total > 0 ? Math.round((totalAssists / total) * 10) / 10 : 0,
      avgDuration: total > 0 ? formatDuration(totalDurationSec / total) : '00:00',
      avgTeamScore: total > 0 ? Math.round((totalTeamScore / total) * 10) / 10 : 0,
      avgEnemyScore: total > 0 ? Math.round((totalEnemyScore / total) * 10) / 10 : 0,
    };
  });

  // ============ Unique Players ============
  const uniquePlayers: ComputedRef<string[]> = computed(() => {
    const set = new Set<string>();
    matches.value.forEach((m) => m.my_team.forEach((p) => set.add(p.nickname)));
    return Array.from(set).sort();
  });

  // ============ Player Aggregated Stats ============
  function getPlayerStats(nickname: string): PlayerAggregatedStats | null {
    const history: MatchPlayerData[] = [];

    matches.value.forEach((match, idx) => {
      const player = match.my_team.find((p) => p.nickname === nickname);
      if (player) {
        history.push({
          matchIndex: idx,
          result: match.result,
          duration: match.duration,
          teamScore: match.my_team_score,
          enemyScore: match.adversary_team_score,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          gold: player.gold,
          medal: player.medal,
          ratio: player.ratio,
          position: player.position,
          is_mvp: player.is_mvp,
        });
      }
    });

    if (history.length === 0) return null;

    const wins = history.filter((h) => h.result === 'VICTORY').length;
    const totalKills = history.reduce((s, h) => s + h.kills, 0);
    const totalDeaths = history.reduce((s, h) => s + h.deaths, 0);
    const totalAssists = history.reduce((s, h) => s + h.assists, 0);
    const totalGold = history.reduce((s, h) => s + h.gold, 0);
    const totalRatio = history.reduce((s, h) => s + h.ratio, 0);
    const mvpCount = history.filter((h) => h.is_mvp).length;
    const goldMedals = history.filter((h) => h.medal === 'GOLD').length;
    const silverMedals = history.filter((h) => h.medal === 'SILVER').length;
    const copperMedals = history.filter((h) => h.medal === 'COPPER').length;
    const ratios = history.map((h) => h.ratio);

    return {
      nickname,
      totalMatches: history.length,
      wins,
      losses: history.length - wins,
      winRate: Math.round((wins / history.length) * 100),
      totalKills,
      totalDeaths,
      totalAssists,
      avgKills: Math.round((totalKills / history.length) * 10) / 10,
      avgDeaths: Math.round((totalDeaths / history.length) * 10) / 10,
      avgAssists: Math.round((totalAssists / history.length) * 10) / 10,
      avgRatio: Math.round((totalRatio / history.length) * 10) / 10,
      totalGold,
      avgGold: Math.round(totalGold / history.length),
      mvpCount,
      goldMedals,
      silverMedals,
      copperMedals,
      bestRatio: Math.max(...ratios),
      worstRatio: Math.min(...ratios),
      matchHistory: history,
    };
  }

  // ============ Leaderboard ============
  const leaderboard: ComputedRef<PlayerAggregatedStats[]> = computed(() => {
    return uniquePlayers.value
      .map((nick) => getPlayerStats(nick))
      .filter((s): s is PlayerAggregatedStats => s !== null)
      .sort((a, b) => b.avgRatio - a.avgRatio);
  });

  // ============ Win/Loss Trend (last N matches) ============
  function getWinLossTrend(lastN = 10): { labels: string[]; wins: number[]; losses: number[] } {
    const recent = matches.value.slice(-lastN);
    const labels: string[] = [];
    const wins: number[] = [];
    const losses: number[] = [];

    recent.forEach((m, idx) => {
      labels.push(`#${matches.value.length - lastN + idx + 1}`);
      wins.push(m.result === 'VICTORY' ? 1 : 0);
      losses.push(m.result === 'DEFEAT' ? 1 : 0);
    });

    return { labels, wins, losses };
  }

  // ============ Medal Distribution ============
  const medalDistribution: ComputedRef<{ gold: number; silver: number; copper: number }> = computed(
    () => {
      let gold = 0,
        silver = 0,
        copper = 0;
      matches.value.forEach((m) =>
        m.my_team.forEach((p) => {
          if (p.medal === 'GOLD') gold++;
          else if (p.medal === 'SILVER') silver++;
          else copper++;
        }),
      );
      return { gold, silver, copper };
    },
  );

  // ============ Top Performers ============
  const topMvpPlayers: ComputedRef<{ nickname: string; count: number }[]> = computed(() => {
    const map = new Map<string, number>();
    matches.value.forEach((m) =>
      m.my_team.forEach((p) => {
        if (p.is_mvp) map.set(p.nickname, (map.get(p.nickname) || 0) + 1);
      }),
    );
    return Array.from(map.entries())
      .map(([nickname, count]) => ({ nickname, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  // ============ KDA per match for charts ============
  function getPlayerKdaTrend(nickname: string): {
    labels: string[];
    kills: number[];
    deaths: number[];
    assists: number[];
    ratios: number[];
  } {
    const stats = getPlayerStats(nickname);
    if (!stats) return { labels: [], kills: [], deaths: [], assists: [], ratios: [] };

    const labels = stats.matchHistory.map((_, i) => `#${i + 1}`);
    const kills = stats.matchHistory.map((h) => h.kills);
    const deaths = stats.matchHistory.map((h) => h.deaths);
    const assists = stats.matchHistory.map((h) => h.assists);
    const ratios = stats.matchHistory.map((h) => h.ratio);

    return { labels, kills, deaths, assists, ratios };
  }

  return {
    matches,
    overallStats,
    uniquePlayers,
    getPlayerStats,
    leaderboard,
    getWinLossTrend,
    medalDistribution,
    topMvpPlayers,
    getPlayerKdaTrend,
  };
}
