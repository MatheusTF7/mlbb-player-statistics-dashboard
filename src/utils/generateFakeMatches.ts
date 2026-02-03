import { faker } from '@faker-js/faker';

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
  date: string;
  group: GroupType;
  my_team_score: number;
  adversary_team_score: number;
  duration: string; // mm:ss
  my_team: PlayerStat[];
  enemy_team: PlayerStat[];
}

const MEDALS = {
  COPPER: 'COPPER',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
} as const;

const GROUPS = {
  SOLO: 'SOLO',
  DUO: 'DUO',
  TRIO: 'TRIO',
  FULL_SQUAD: 'FULL_SQUAD',
} as const;

type MedalType = (typeof MEDALS)[keyof typeof MEDALS];
type GroupType = (typeof GROUPS)[keyof typeof GROUPS];

function fmtDuration(minutes: number, seconds: number) {
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

function computeRatioFromKDA(kills: number, assists: number, deaths: number) {
  const raw = kills + assists - deaths; // can be negative
  const minRaw = -5; // lower bound for scaling
  const maxRaw = 30; // upper bound for scaling

  const clamped = Math.max(minRaw, Math.min(maxRaw, raw));
  const norm = (clamped - minRaw) / (maxRaw - minRaw); // 0..1
  const ratio = 3 + norm * 15; // scale to 3.0..18.0
  return Math.round(ratio * 10) / 10; // one decimal
}

export default function generateFakeMatches(count: number, nickname: string): MatchData[] {
  const matches: MatchData[] = [];

  for (let i = 0; i < count; i++) {
    const my_team_score = faker.number.int({ min: 0, max: 50 });
    const group: GroupType = faker.helpers.arrayElement([
      GROUPS.SOLO,
      GROUPS.DUO,
      GROUPS.TRIO,
      GROUPS.FULL_SQUAD,
    ]);
    const adversary_team_score = faker.number.int({ min: 0, max: 50 });
    const minutes = faker.number.int({ min: 8, max: 30 });
    const seconds = faker.number.int({ min: 0, max: 59 });

    // Decide position where the provided nickname will appear
    const nicknameIndex = faker.number.int({ min: 0, max: 4 });

    const my_team: PlayerStat[] = [];

    for (let p = 0; p < 5; p++) {
      const isNickname = p === nicknameIndex;

      const kills = faker.number.int({ min: 0, max: 25 });
      const deaths = faker.number.int({ min: 0, max: 15 });
      const assists = faker.number.int({ min: 0, max: 20 });
      const gold = faker.number.int({ min: 8000, max: 18000 });
      // compute ratio (3.0..18.0) from KDA
      const ratio = computeRatioFromKDA(kills, assists, deaths);

      // determine medal from ratio: <=5 -> COPPER, >5 and <=7.6 -> SILVER, >7.6 -> GOLD
      let medal: MedalType = MEDALS.COPPER;
      if (ratio > 7.6) {
        medal = MEDALS.GOLD;
      } else if (ratio > 5) {
        medal = MEDALS.SILVER;
      } else {
        medal = MEDALS.COPPER;
      }

      my_team.push({
        nickname: isNickname ? nickname : faker.internet.username(),
        kills,
        deaths,
        assists,
        gold,
        medal,
        ratio,
        position: p + 1,
        is_mvp: false,
      });
    }

    // Choose exactly one MVP using criteria: ratio > kills > assists > fewer deaths
    let mvpIndex = 0;
    for (let j = 1; j < my_team.length; j++) {
      const a = my_team[j]!;
      const b = my_team[mvpIndex]!;

      if (a.ratio > b.ratio) {
        mvpIndex = j;
        continue;
      }
      if (a.ratio < b.ratio) continue;
      // ratios equal -> compare kills
      if (a.kills > b.kills) {
        mvpIndex = j;
        continue;
      }
      if (a.kills < b.kills) continue;

      // kills equal -> compare assists
      if (a.assists > b.assists) {
        mvpIndex = j;
        continue;
      }
      if (a.assists < b.assists) continue;

      // assists equal -> prefer fewer deaths
      if (a.deaths < b.deaths) {
        mvpIndex = j;
        continue;
      }
      // if still equal, keep existing mvpIndex (first wins)
    }

    my_team.forEach((pl, idx) => (pl.is_mvp = idx === mvpIndex));

    const match: MatchData = {
      result: my_team_score > adversary_team_score ? 'VICTORY' : 'DEFEAT',
      date: new Date().toISOString(),
      group,
      my_team_score,
      adversary_team_score,
      duration: fmtDuration(minutes, seconds),
      my_team,
      enemy_team: [],
    };

    matches.push(match);
  }

  return matches;
}
