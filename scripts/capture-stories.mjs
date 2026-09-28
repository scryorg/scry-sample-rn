#!/usr/bin/env node
// Drives the on-device Storybook over its WebSocket channel (:7007) and screenshots stories
// with `adb exec-out screencap -p`. This is a thin verification script for this repo, not the
// production `capture rn` adapter (that is PR 6, scry-node) — but it exercises the exact
// selection protocol the adapter uses (research/tools.md §React Native / capture-sources
// plan.md delivery item 6).
//
// Usage:
//   node scripts/capture-stories.mjs <outDir> [storyId ...]
//
// Requires: a booted emulator/simulator with Storybook running (npm run storybook), reachable
// adb device, and the Metro/Storybook websocket host:port (defaults to localhost:7007 — set
// STORYBOOK_WS_HOST/STORYBOOK_WS_PORT to override, matching the app's own env).
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import WebSocket from 'ws';

const HOST = process.env.STORYBOOK_WS_HOST || 'localhost';
const PORT = Number(process.env.STORYBOOK_WS_PORT || 7007);
const SETTLE_MS = Number(process.env.SCRY_CAPTURE_SETTLE_MS || 1500);

const [outDir, ...requested] = process.argv.slice(2);
if (!outDir) {
  console.error('usage: capture-stories.mjs <outDir> [storyId ...]');
  process.exit(2);
}

const DEFAULT_STORIES = [
  'components-button--primary',
  'screens-menu--default',
  'screens-order--default',
];
const storyIds = requested.length ? requested : DEFAULT_STORIES;

function adb(...args) {
  const result = spawnSync('adb', args, { encoding: 'buffer' });
  if (result.status !== 0) {
    throw new Error(`adb ${args.join(' ')} failed: ${result.stderr?.toString() ?? result.status}`);
  }
  return result.stdout;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const ws = new WebSocket(`ws://${HOST}:${PORT}`);

  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
  console.log(`connected to ws://${HOST}:${PORT}`);

  for (const storyId of storyIds) {
    ws.send(JSON.stringify({ type: 'setCurrentStory', args: [{ viewMode: 'story', storyId }] }));
    // Wait for the story to mount and animations (disabled under SCRY_CAPTURE=1) to settle.
    await sleep(SETTLE_MS);
    const png = adb('exec-out', 'screencap', '-p');
    const file = join(outDir, `${storyId}.png`);
    writeFileSync(file, png);
    console.log(`captured ${storyId} -> ${file} (${png.length} bytes)`);
  }

  ws.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
