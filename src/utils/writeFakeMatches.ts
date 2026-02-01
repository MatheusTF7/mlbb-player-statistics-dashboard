import { writeFile } from 'fs/promises';
import path from 'path';
import generateFakeMatches from './generateFakeMatches';

export async function writeFakeMatches(
  count: number,
  nickname: string,
  outFile?: string,
): Promise<string> {
  const matches = generateFakeMatches(count, nickname);

  const target = outFile
    ? path.resolve(outFile)
    : path.resolve(__dirname, '../data/matches_fake.json');

  await writeFile(target, JSON.stringify(matches, null, 2), 'utf8');

  return target;
}

export default writeFakeMatches;

// CLI entry for convenience when compiled to JS and run with node
if (require.main === module) {
  const [, , countArg, nick, outPath] = process.argv;
  const count = parseInt(countArg || '10', 10);
  if (!nick) {
    // eslint-disable-next-line no-console
    console.error('Usage: node writeFakeMatches.js <count> <nickname> [outPath]');
    process.exit(1);
  }

  writeFakeMatches(count, nick, outPath)
    .then((p) => {
      // eslint-disable-next-line no-console
      console.log('Wrote matches to', p);
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(2);
    });
}
