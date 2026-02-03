import { faker } from '@faker-js/faker';
import fs from 'fs/promises';
import path from 'path';

// TO EXECUTE SCRIPT:
// node "src/utils/generate_and_write_fake_matches.mjs" how_many_int fixed_nickname [teammates_spec] [out_path]
//
// teammates_spec format examples:
//  - single teammate: "Alice:30"  -> Alice appears with the user in ~30% of matches
//  - two teammates: "Bob:20,Carol:10" -> Bob appears in ~20% of matches, Carol in ~10%; when both appear it's a trio

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
  return 'COPPER';
}

function randomDateWithinLastDays(days) {
  const now = Date.now();
  const past = now - days * 24 * 60 * 60 * 1000;
  const t = Math.floor(Math.random() * (now - past)) + past;
  return new Date(t).toISOString();
}
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function parseTeammatesSpec(spec) {
  if (!spec) return [];
  // expected format: "Name:percent,Name2:percent2"
  return spec
    .split(',')
    .map((part) => {
      const [rawName, rawPct] = part.split(':');
      const name = (rawName || '').trim();
      const percent = Number(rawPct == null ? 0 : rawPct);
      return { name, percent: isNaN(percent) ? 0 : percent };
    })
    .filter((t) => t.name);
}
function generateFakeMatches(count, nickname, teammates = []) {
  const matches = [];
  for (let i = 0; i < count; i++) {
    const my_team_score = faker.number.int({ min: 0, max: 50 });
    const adversary_team_score = faker.number.int({ min: 0, max: 50 });
    const minutes = faker.number.int({ min: 8, max: 30 });
    const seconds = faker.number.int({ min: 0, max: 59 });
    const my_team = [];

    // decide which fixed teammates (if any) appear in this match according to their percent chance
    const includedTeammates = [];
    if (Array.isArray(teammates) && teammates.length) {
      teammates.forEach((t) => {
        const pct = Math.max(0, Math.min(100, Number(t.percent || 0)));
        if (Math.random() * 100 < pct) includedTeammates.push(t.name);
      });
    }

    // randomize positions and assign user + included teammates to unique slots
    const positions = shuffle([0, 1, 2, 3, 4]);
    const assigned = new Array(5).fill(null);
    assigned[positions[0]] = nickname; // ensure user is always present
    for (let k = 0; k < includedTeammates.length && k < 4; k++) {
      assigned[positions[k + 1]] = includedTeammates[k];
    }

    for (let p = 0; p < 5; p++) {
      const playerNickname = assigned[p] || `${faker.internet.username()}`;
      const kills = faker.number.int({ min: 0, max: 25 });
      const deaths = faker.number.int({ min: 0, max: 15 });
      const assists = faker.number.int({ min: 0, max: 20 });
      const gold = faker.number.int({ min: 8000, max: 18000 });

      // push raw values first; ratio/medal will be computed after kills adjustment
      my_team.push({
        nickname: playerNickname,
        kills,
        deaths,
        assists,
        gold,
        medal: null,
        ratio: null,
        position: p + 1,
        is_mvp: false,
      });
    }

    // adjust kills so their sum equals my_team_score
    const sumKills = () => my_team.reduce((s, pl) => s + (pl.kills || 0), 0);
    let diff = my_team_score - sumKills();
    if (diff > 0) {
      // add kills distributed randomly until diff is zero
      while (diff > 0) {
        const idx = Math.floor(Math.random() * 5);
        my_team[idx].kills = (my_team[idx].kills || 0) + 1;
        diff -= 1;
      }
    } else if (diff < 0) {
      // remove kills from players that have >0 kills until diff is zero
      while (diff < 0) {
        const idx = Math.floor(Math.random() * 5);
        if ((my_team[idx].kills || 0) > 0) {
          my_team[idx].kills -= 1;
          diff += 1;
        }
      }
    }

    // recompute ratio and medal after kills adjustments
    my_team.forEach((pl) => {
      const ratio = computeRatioFromKDA(pl.kills, pl.assists, pl.deaths);
      pl.ratio = ratio;
      pl.medal = medalFromRatio(ratio);
    });

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

    const group =
      includedTeammates.length === 0
        ? 'SOLO'
        : includedTeammates.length === 1
          ? 'DUO'
          : includedTeammates.length === 2
            ? 'TRIO'
            : 'FULL';

    matches.push({
      date: randomDateWithinLastDays(7),
      group,
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
  const [, , countArg, nick, teammatesSpec, outPath] = process.argv;
  const count = parseInt(countArg || '50', 10);
  const nickname = nick || 'MTF7';
  const teammates = parseTeammatesSpec(teammatesSpec);
  const matches = generateFakeMatches(count, nickname, teammates);
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
