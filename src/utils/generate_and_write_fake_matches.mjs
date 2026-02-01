import { faker } from '@faker-js/faker';
import fs from 'fs/promises';
import path from 'path';

// TO EXECUTE SCRIPT: node "src/utils/generate_and_write_fake_matches.mjs" number_int nickname

function fmtDuration(minutes, seconds) {
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

function computeRatioFromKDA(kills, assists, deaths) {
  const raw = kills + assists - deaths;
  const minRaw = -5;
  const maxRaw = 30;
  const clamped = Math.max(minRaw, Math.min(maxRaw, raw));
  const norm = (clamped - minRaw) / (maxRaw - minRaw);
  const ratio = 3 + norm * 15;
  return Math.round(ratio * 10) / 10;
}

function medalFromRatio(ratio) {
  if (ratio > 7.6) return 'GOLD';
  if (ratio > 5) return 'SILVER';
  return 'BRONZE';
}

function generateFakeMatches(count, nickname) {
  const matches = [];
  for (let i = 0; i < count; i++) {
    const my_team_score = faker.number.int({ min: 0, max: 50 });
    const adversary_team_score = faker.number.int({ min: 0, max: 50 });
    const minutes = faker.number.int({ min: 8, max: 30 });
    const seconds = faker.number.int({ min: 0, max: 59 });
    const nicknameIndex = faker.number.int({ min: 0, max: 4 });

    const my_team = [];
    for (let p = 0; p < 5; p++) {
      const isNickname = p === nicknameIndex;
      const kills = faker.number.int({ min: 0, max: 25 });
      const deaths = faker.number.int({ min: 0, max: 15 });
      const assists = faker.number.int({ min: 0, max: 20 });
      const gold = faker.number.int({ min: 8000, max: 18000 });
      const ratio = computeRatioFromKDA(kills, assists, deaths);
      const medal = medalFromRatio(ratio);

      my_team.push({
        nickname: isNickname ? nickname : `${faker.internet.username()}`,
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

    // select MVP using ratio > kills > assists > fewer deaths
    let mvpIndex = 0;
    for (let j = 1; j < my_team.length; j++) {
      const a = my_team[j];
      const b = my_team[mvpIndex];
      if (a.ratio > b.ratio) {
        mvpIndex = j;
        continue;
      }
      if (a.ratio < b.ratio) continue;
      if (a.kills > b.kills) {
        mvpIndex = j;
        continue;
      }
      if (a.kills < b.kills) continue;
      if (a.assists > b.assists) {
        mvpIndex = j;
        continue;
      }
      if (a.assists < b.assists) continue;
      if (a.deaths < b.deaths) {
        mvpIndex = j;
        continue;
      }
    }
    my_team.forEach((pl, idx) => {
      pl.is_mvp = idx === mvpIndex;
    });

    matches.push({
      result: my_team_score > adversary_team_score ? 'VICTORY' : 'DEFEAT',
      my_team_score,
      adversary_team_score,
      duration: fmtDuration(minutes, seconds),
      my_team,
      enemy_team: [],
    });
  }
  return matches;
}

async function main() {
  const [, , countArg, nick, outPath] = process.argv;
  const count = parseInt(countArg || '50', 10);
  const nickname = nick || 'MTF7';
  const matches = generateFakeMatches(count, nickname);
  const target = outPath
    ? path.resolve(outPath)
    : path.resolve(process.cwd(), 'src/data/matches_fake.json');
  await fs.writeFile(target, JSON.stringify(matches, null, 2), 'utf8');
  console.log('Wrote', matches.length, 'matches to', target);
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith('generate_and_write_fake_matches.mjs')
) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
