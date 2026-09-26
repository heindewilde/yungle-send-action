// Builds the `yungle send` command line from the action's inputs and writes
// its outputs. Plain Node, no dependencies: every GitHub runner has it.
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const env = process.env;
const lines = (s) => (s ?? '').split(/[\n,]/).map((x) => x.trim()).filter(Boolean);

const paths = lines(env.INPUT_PATH);
if (paths.length === 0) fail('`path` is empty: give at least one file or directory.');
if (!env.YUNGLE_API_KEY) fail('`api-key` is empty. Pass it from a secret.');

const args = ['-y', `yungle-cli@${env.INPUT_CLI_VERSION || '0'}`, 'send', ...paths, '--json'];
for (const to of lines(env.INPUT_TO)) args.push('--to', to);
for (const [flag, value] of [
  ['--message', env.INPUT_MESSAGE],
  ['--title', env.INPUT_TITLE],
  ['--expires', env.INPUT_EXPIRES],
  ['--password', env.INPUT_PASSWORD],
]) {
  if (value) args.push(flag, value);
}
if (env.INPUT_PASSWORD) console.log(`::add-mask::${env.INPUT_PASSWORD}`);

const run = spawnSync('npx', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
let result;
try {
  result = JSON.parse(run.stdout);
} catch {
  fail(`yungle-cli did not return JSON (exit ${run.status}).\n${run.stdout}`);
}
if (run.status !== 0 || result.error) fail(result.error?.message ?? `yungle-cli exited ${run.status}`);

const out = env.GITHUB_OUTPUT;
appendFileSync(out, `url=${result.url}\nid=${result.id}\nexpires-at=${result.expiresAt}\n`);
appendFileSync(
  env.GITHUB_STEP_SUMMARY,
  `### Sent with Yungle\n\n${result.url}\n\nExpires ${result.expiresAt}` +
    (result.notified?.length ? ` · emailed ${result.notified.length} recipient(s)` : '') +
    '\n',
);
console.log(`Sent: ${result.url}`);

function fail(message) {
  console.log(`::error title=Yungle::${message.replace(/\n/g, '%0A')}`);
  process.exit(1);
}
