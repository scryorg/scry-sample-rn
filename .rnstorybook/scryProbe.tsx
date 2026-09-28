// Dev-only Scry capture probe (EXPO_PUBLIC_SCRY_CAPTURE=1 builds only; see preview.tsx).
//
// `scry capture rn` asks over the Storybook websocket channel:
//   -> {type: 'scry:requestTree', args: [{requestId, storyId}]}
//   <- {type: 'scry:tree', args: [{requestId, storyId, scale, rootBounds, tree}]}
// where `rootBounds` is the `scry-root` view in window points (the crop on iOS) and `tree` is
// an scf-tree/1 root node (Scry Capture Format, origin "rn-fiber"): the host views under
// `scry-root` with their component name, testID, role, text, bounds (points, relative to the
// root) and the style keys the format lists. Nothing here runs in a normal app build.
import { Component, type ReactNode } from 'react';
import { PixelRatio, StyleSheet } from 'react-native';
import { addons } from 'storybook/preview-api';
import { SCRY_ROOT_TEST_ID } from '../src/capture';

type Fiber = {
  tag: number;
  type: unknown;
  elementType?: unknown;
  memoizedProps: Record<string, unknown> | string | null;
  stateNode: unknown;
  child: Fiber | null;
  sibling: Fiber | null;
  return: Fiber | null;
};
type Bounds = { x: number; y: number; width: number; height: number };
type TreeNode = {
  type: string;
  role?: string;
  testId?: string;
  text?: string;
  bounds?: Bounds;
  style?: Record<string, unknown>;
  children?: TreeNode[];
  'x-component'?: string;
};

const HOST_COMPONENT = 5;
const HOST_TEXT = 6;
const COMPOSITE_TAGS = new Set([0, 1, 11, 14, 15]);
const MAX_NODES = 5000;
const HOST_NAMES: Record<string, string> = {
  RCTView: 'View',
  RCTText: 'Text',
  RCTParagraph: 'Text',
  RCTVirtualText: 'Text',
  RCTImageView: 'Image',
  RCTScrollView: 'ScrollView',
  RCTScrollContentView: 'View',
  AndroidHorizontalScrollView: 'ScrollView',
  AndroidTextInput: 'TextInput',
  RCTSinglelineTextInputView: 'TextInput',
  RCTMultilineTextInputView: 'TextInput',
};
// Wrappers that add nothing a designer would name.
const TRIVIAL = new Set(['View', 'Text', 'Image', 'ScrollView', 'Animated(View)', 'AnimatedComponent']);

let current: ScryProbe | null = null;
let listening = false;

function componentName(fiber: Fiber): string | null {
  const t = (fiber.elementType ?? fiber.type) as { displayName?: string; name?: string; render?: { displayName?: string; name?: string }; type?: { displayName?: string; name?: string } } | ((...a: unknown[]) => unknown) | null;
  if (!t) return null;
  const f = t as { displayName?: string; name?: string; render?: { displayName?: string; name?: string }; type?: { displayName?: string; name?: string } };
  return f.displayName || f.name || f.render?.displayName || f.render?.name || f.type?.displayName || f.type?.name || null;
}

function hostName(fiber: Fiber): string {
  return typeof fiber.type === 'string' ? HOST_NAMES[fiber.type] ?? fiber.type : 'View';
}

function propsOf(fiber: Fiber): Record<string, unknown> {
  return fiber.memoizedProps && typeof fiber.memoizedProps === 'object' ? fiber.memoizedProps : {};
}

function textOf(fiber: Fiber): string {
  let out = '';
  const walk = (f: Fiber | null) => {
    for (let c = f; c; c = c.sibling) {
      if (c.tag === HOST_TEXT && typeof c.memoizedProps === 'string') out += c.memoizedProps;
      else walk(c.child);
    }
  };
  walk(fiber.child);
  return out;
}

const NAMED: Record<string, string> = { white: '#FFFFFF', black: '#000000', transparent: '#00000000' };

function hex2(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0').toUpperCase();
}

/** '#RRGGBB' / '#RRGGBBAA', or undefined for anything it cannot read. */
function toHex(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  if (NAMED[v]) return NAMED[v];
  let m = /^#([0-9a-f]{3,8})$/.exec(v);
  if (m) {
    const h = m[1];
    if (h.length === 3 || h.length === 4) return `#${h.split('').map((c) => c + c).join('')}`.toUpperCase();
    if (h.length === 6 || h.length === 8) return `#${h}`.toUpperCase();
    return undefined;
  }
  m = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(v);
  if (m) {
    const a = m[4] === undefined ? '' : hex2(Number(m[4]) * 255);
    return `#${hex2(Number(m[1]))}${hex2(Number(m[2]))}${hex2(Number(m[3]))}${a === 'FF' ? '' : a}`;
  }
  return undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

function weight(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (v === 'bold') return 700;
  if (v === 'normal') return 400;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** React Native style object -> scf-tree/1 style keys. Unknown means absent, never "none". */
function scfStyle(raw: unknown): Record<string, unknown> | undefined {
  const s = (StyleSheet.flatten(raw as never) || {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const set = (k: string, v: unknown) => { if (v !== undefined) out[k] = v; };
  set('background', toHex(s.backgroundColor));
  set('color', toHex(s.color));
  set('fontFamily', typeof s.fontFamily === 'string' ? s.fontFamily : undefined);
  set('fontSize', num(s.fontSize));
  set('fontWeight', weight(s.fontWeight));
  set('lineHeight', num(s.lineHeight));
  set('letterSpacing', num(s.letterSpacing));
  set('cornerRadius', num(s.borderRadius));
  set('borderWidth', num(s.borderWidth));
  set('borderColor', toHex(s.borderColor));
  set('opacity', num(s.opacity));
  const p = (side: string, axis: string) => num(s[`padding${side}`]) ?? num(s[`padding${axis}`]) ?? num(s.padding);
  const padding = [p('Top', 'Vertical'), p('Right', 'Horizontal'), p('Bottom', 'Vertical'), p('Left', 'Horizontal')];
  if (padding.some((v) => v !== undefined)) out.padding = padding.map((v) => v ?? 0);
  if (s.shadowColor !== undefined || num(s.elevation)) {
    out.shadow = {
      ...(toHex(s.shadowColor) ? { color: toHex(s.shadowColor) } : {}),
      ...(s.shadowOffset ? { offset: s.shadowOffset } : {}),
      ...(num(s.shadowRadius) !== undefined ? { radius: s.shadowRadius } : {}),
      ...(num(s.shadowOpacity) !== undefined ? { opacity: s.shadowOpacity } : {}),
      ...(num(s.elevation) ? { 'x-elevation': s.elevation } : {}),
    };
  }
  return Object.keys(out).length ? out : undefined;
}

function publicInstance(fiber: Fiber): { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void; getBoundingClientRect?: () => Bounds } | null {
  const node = fiber.stateNode as { canonical?: { publicInstance?: unknown }; measureInWindow?: unknown } | null;
  if (!node) return null;
  const inst = (node.canonical?.publicInstance ?? node) as ReturnType<typeof publicInstance>;
  return inst ?? null;
}

type FabricUIManager = {
  measureInWindow?: (node: unknown, cb: (x: number, y: number, w: number, h: number) => void) => void;
};

function measure(fiber: Fiber): Promise<Bounds | null> {
  // Fabric: measure the shadow node directly. Text hosts often have no public instance with
  // measureInWindow, but every host instance has a shadow node.
  const fabric = (globalThis as { nativeFabricUIManager?: FabricUIManager }).nativeFabricUIManager;
  const shadow = (fiber.stateNode as { node?: unknown } | null)?.node;
  if (fabric?.measureInWindow && shadow) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 1000);
      fabric.measureInWindow!(shadow, (x, y, width, height) => {
        clearTimeout(timer);
        resolve({ x, y, width, height });
      });
    });
  }
  const inst = publicInstance(fiber);
  if (!inst) return Promise.resolve(null);
  if (typeof inst.measureInWindow === 'function') {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(null), 1000);
      inst.measureInWindow!((x, y, width, height) => {
        clearTimeout(timer);
        resolve({ x, y, width, height });
      });
    });
  }
  if (typeof inst.getBoundingClientRect === 'function') {
    const r = inst.getBoundingClientRect();
    return Promise.resolve({ x: r.x, y: r.y, width: r.width, height: r.height });
  }
  return Promise.resolve(null);
}

function findRoot(fiber: Fiber | null): Fiber | null {
  for (let f = fiber; f; f = f.sibling) {
    if (f.tag === HOST_COMPONENT && propsOf(f).testID === SCRY_ROOT_TEST_ID) return f;
    const inner = findRoot(f.child);
    if (inner) return inner;
  }
  return null;
}

/** Composite names between a host fiber and the host above it, outermost first. */
function ownerNames(fiber: Fiber, stopAt: Fiber | null): string[] {
  const names: string[] = [];
  for (let f = fiber.return; f && f !== stopAt; f = f.return) {
    if (f.tag === HOST_COMPONENT) break;
    if (COMPOSITE_TAGS.has(f.tag)) {
      const n = componentName(f);
      if (n) names.unshift(n);
    }
  }
  return names;
}

async function buildTree(root: Fiber): Promise<{ tree: TreeNode; rootBounds: Bounds | null }> {
  let count = 0;
  const rootBounds = await measure(root);
  const rel = (b: Bounds | null): Bounds | undefined =>
    b && rootBounds ? { x: b.x - rootBounds.x, y: b.y - rootBounds.y, width: b.width, height: b.height } : undefined;

  const visit = async (fiber: Fiber, parentHost: Fiber | null): Promise<TreeNode> => {
    count++;
    const props = propsOf(fiber);
    const names = ownerNames(fiber, parentHost).filter((n) => !TRIVIAL.has(n) && !/NativeComponent$/.test(n));
    const host = hostName(fiber);
    const node: TreeNode = { type: names[names.length - 1] ?? host };
    if (names.length > 1) node['x-component'] = names[0];
    if (typeof props.testID === 'string') node.testId = props.testID;
    const role = props.role ?? props.accessibilityRole;
    if (typeof role === 'string') node.role = role;
    const isText = host === 'Text';
    if (isText) {
      const text = textOf(fiber);
      if (text) node.text = text;
    }
    const bounds = rel(await measure(fiber));
    if (bounds) node.bounds = bounds;
    const style = scfStyle(props.style);
    if (style) node.style = style;
    if (!isText) {
      const children: TreeNode[] = [];
      const collect = async (f: Fiber | null) => {
        for (let c = f; c; c = c.sibling) {
          if (count >= MAX_NODES) return;
          if (c.tag === HOST_COMPONENT) children.push(await visit(c, fiber));
          else await collect(c.child);
        }
      };
      await collect(fiber.child);
      if (children.length) node.children = children;
    }
    return node;
  };
  const tree = await visit(root, null);
  return { tree, rootBounds };
}

function listen() {
  if (listening) return;
  const channel = addons.getChannel();
  if (!channel) return;
  listening = true;
  channel.on('scry:requestTree', async (req: { requestId?: string; storyId?: string } = {}) => {
    const probe = current;
    const fiber = probe ? ((probe as unknown as { _reactInternals?: Fiber })._reactInternals ?? null) : null;
    const root = fiber ? findRoot(fiber.child) : null;
    if (!root) {
      channel.emit('scry:tree', { requestId: req.requestId, storyId: req.storyId, scale: PixelRatio.get(), rootBounds: null, tree: null });
      return;
    }
    try {
      const { tree, rootBounds } = await buildTree(root);
      channel.emit('scry:tree', { requestId: req.requestId, storyId: req.storyId, scale: PixelRatio.get(), rootBounds, tree });
    } catch (e) {
      channel.emit('scry:tree', { requestId: req.requestId, storyId: req.storyId, scale: PixelRatio.get(), rootBounds: null, tree: null, error: String(e) });
    }
  });
}

/** Wraps each story without adding a view (no layout change); remembers the mounted story. */
export class ScryProbe extends Component<{ children: ReactNode }> {
  componentDidMount() {
    current = this;
    listen();
  }
  componentWillUnmount() {
    if (current === this) current = null;
  }
  render() {
    return this.props.children;
  }
}
