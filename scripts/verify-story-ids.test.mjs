// Guards the one thing that must never drift silently: the seven story ids shared with the
// web Kettle (scry-playground/SPEC.md "Names — these drive Suggest links, do not change them").
// A plain source-text check, not a render, so it needs no RN/Metro runtime.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFileSync(join(root, p), 'utf8');

// title -> [export name that must exist in that file]
const CANONICAL = [
  ['src/components/Button.stories.tsx', 'Components/Button', ['Primary', 'Secondary']],
  ['src/components/MenuItem.stories.tsx', 'Components/MenuItem', ['Default']],
  ['src/components/QuantityStepper.stories.tsx', 'Components/QuantityStepper', ['Default']],
  ['src/screens/Menu.stories.tsx', 'Screens/Menu', ['Default']],
  ['src/screens/ItemDetail.stories.tsx', 'Screens/Item Detail', ['Default']],
  ['src/screens/Order.stories.tsx', 'Screens/Order', ['Default']],
];

test('every canonical web Kettle story id has a matching RN title + export', () => {
  for (const [file, title, exportNames] of CANONICAL) {
    const src = read(file);
    assert.match(src, new RegExp(`title:\\s*['"]${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`), `${file} title`);
    for (const name of exportNames) {
      assert.match(src, new RegExp(`export const ${name}:`), `${file} export ${name}`);
    }
  }
});

test('MenuItem Default uses the exact web args (itemName, not name)', () => {
  const story = read('src/components/MenuItem.stories.tsx');
  assert.match(story, /export const Default: Story = \{ args: flatWhite \}/);
  const data = read('src/data.ts');
  assert.match(data, /itemName: 'Flat White'/);
});
