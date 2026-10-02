# scry-sample-rn

Kettle, on-device: a small Expo + React Native coffee-order app (Menu, Item Detail, Order, plus
the Button, MenuItem and QuantityStepper components) with an on-device
[`@storybook/react-native`](https://github.com/storybookjs/react-native) v10 build. It is one of
three Scry starting points for capturing a native app (the others are the SwiftUI and Jetpack
Compose samples) and uses the same tokens and copy as
[`scry-playground`](https://github.com/scryorg/scry-playground), the web Storybook version of
Kettle. React Native needs the least setup of the three: Scry has a built-in adapter,
`scry capture rn`, that drives the stories on a simulator or emulator, so there is no capture
script to write.

**No code of yours is uploaded.** Scry receives PNG screenshots and a small manifest
(`scf.json`), nothing else.

## Before you start

- Node 20.19+ or 22.12+ and npm.
- An Android emulator (JDK 17 and the Android SDK) or the iOS Simulator (macOS). `npm start`
  alone also works in Expo Go on a device on the same network, and Expo Go is the way to use an
  Xcode older than 26.
- A Scry project and a **project API key** (Settings, API keys, in the dashboard). The examples
  use the placeholders `proj_xxxxxxxx` and `sk_live_xxxxxxxx`; they do not work, replace them
  with your own, and never commit a real key.

## 1. Clone and run

```sh
git clone https://github.com/scryorg/scry-sample-rn.git
cd scry-sample-rn
npm install
npm run storybook-generate        # regenerates .rnstorybook/storybook.requires.ts
npm run android                   # or: npm run ios   (builds and installs the debug app)
```

The plain app (`npm start`) shows the Kettle Menu screen. Storybook mode is a different entry
point, switched with an environment variable, see [How Storybook mode works](#how-storybook-mode-works-entry-point-swapping).

## 2. Capture your screens

With the emulator or simulator booted and the app installed (step 1):

```sh
npx @scrymore/scry-deployer capture rn --platform android --device Pixel_6_API_34
# iOS Simulator, with Expo Go:
npx @scrymore/scry-deployer capture rn --platform ios --device "iPhone 16" \
  --app-id host.exp.Exponent --open-url exp://127.0.0.1:8081
```

It starts Metro in Storybook mode, opens every story, screenshots it, and writes
`.scry/capture/` (`scf.json` plus `images/<id>.png`). It ends with a line like
`21 of 21 stories captured, 0 skipped. Bundle: .scry/capture`. A skipped story is reported with
its reason (`timeout`, `error`); fix it rather than filtering it out. Add `--stories a,b` to
capture a few, or `--build` to build and install the app first.

## 3. Check the bundle

```sh
npx @scrymore/scry-deployer upload .scry/capture --dry-run
```

This validates the bundle and zips it locally; nothing is sent and no key is needed. Expected:
`Bundle valid: 21 captures, source storybook-rn:android.` followed by `Dry run: not uploading.`
Open a few images in `.scry/capture/images/` to check them by eye.

## 4. Upload

```sh
export SCRY_PROJECT_ID=proj_xxxxxxxx        # your project id
export SCRY_API_KEY=sk_live_xxxxxxxx        # your project API key
npx @scrymore/scry-deployer upload .scry/capture
```

It prints the build number when the upload is accepted. Only `scf.json` and the images are
sent; `--include-source` (which also uploads each story's component source) stays off.

## 5. See it in Scry

Open your project in the Scry dashboard. The **Builds** tab shows the new build with the source
chip **React Native · Android** (or **· iOS**) and a device card; open a screen to see it in the
editor. If the chip is not there yet, the build is still being indexed; refresh after a minute.

## Put it in CI

- `.github/workflows/ci.yml` runs on every pull request on a GitHub-hosted runner with no
  secrets: lint, `tsc`, tests, `scripts/check-workflows.sh` and the bare-variant build.
- `.github/workflows/scry-capture.yml` captures on an Android emulator and uploads. It runs
  only on a push to the default branch, never on a pull request, and is skipped until you add
  the repository variable `SCRY_PROJECT_ID` and the secret `SCRY_API_KEY` (Settings, Secrets and
  variables, Actions).
- `scripts/check-workflows.sh` fails if a workflow uses `pull_request_target` or a self-hosted
  runner, references secrets on a pull request, or captures or uploads outside the default branch.

## Make it your own

1. Change the app id (`ios.bundleIdentifier` and `android.package` in `app.json`).
2. Replace or add stories: any story file under `src/` is captured. Give each component or screen
   root `testID="scry-root"` (see `src/Screen.tsx`) and run `npm run storybook-generate` after
   adding or removing a story file.
3. Set `SCRY_PROJECT_ID` and `SCRY_API_KEY` (two env vars locally, one variable and one secret
   in CI).
4. For your own existing React Native app, ask your AI assistant "set up Scry capture for this
   app" with the `scry-native-capture-setup` skill installed. It adds capture mode, the
   `scry-root` test ids and the CI workflow as this sample has them, runs `scry capture rn` and
   `upload --dry-run`, and stops before uploading. Or copy `src/capture.ts` and
   `.rnstorybook/preview.tsx` by hand.

`scripts/make-bare.sh <dest>` writes this same app **without** any Scry capture setup (no
`src/capture.ts`, no `scry-root` test ids, no probe, no Scry workflow). It is generated, never
committed, and is the "before" the skill starts from.

## Reference

[`SPEC.md`](SPEC.md) lists the design tokens, positions, labels and story ids the app follows (it
mirrors the web build's spec: change that one first, then this one).

### How Storybook mode works (entry-point swapping)

`@storybook/react-native` v10.4+'s `withStorybook` Metro wrapper (`metro.config.js`) swaps the
app's bundle entry with no app code change:

- `npm start` → plain `index.ts` → `App.tsx` (a small real app that renders the Kettle Menu
  screen with live component code — a normal Expo app).
- `STORYBOOK_ENABLED=true npm run storybook` → Metro's resolver redirects the entry to
  `.rnstorybook/index.tsx`, which registers the on-device Storybook UI instead. Nothing in
  `App.tsx` or `index.ts` knows Storybook exists.

Storybook opens a WebSocket channel on `:7007` (`websockets: 'auto'` in `metro.config.js`); any
client can switch the visible story with
`{"type":"setCurrentStory","args":[{"viewMode":"story","storyId":"<id>"}]}`
(`scripts/capture-stories.mjs` does exactly this, then screenshots with `adb`).

`.rnstorybook/storybook.requires.ts` is generated from `.rnstorybook/main.ts`'s `stories` glob
by `@storybook/react-native`'s own CLI — regenerate it after adding/removing a story file:

```sh
npm run storybook-generate   # sb-rn-get-stories --host auto
```

It is committed (Storybook's own convention — see the upstream
[`expo-new-wrapper-example`](https://github.com/storybookjs/react-native/tree/next/examples/expo-new-wrapper-example)),
so `tsc --noEmit` and a fresh `npm start` both work without running Metro's generator first.

### Capture determinism

Every component and screen root carries `testID="scry-root"` (`src/Screen.tsx`, and directly on
each component's root element) — the crop target for `capture rn`. `EXPO_PUBLIC_SCRY_CAPTURE=1`
turns off Pressable/Android-ripple touch feedback so repeat captures are pixel-identical
(`src/capture.ts`). Expo only inlines `process.env.EXPO_PUBLIC_*` into the app bundle — a bare
`SCRY_CAPTURE` var would not reach Hermes — so the flag is `EXPO_PUBLIC_SCRY_CAPTURE`, not
`SCRY_CAPTURE`. Fonts are bundled (`@expo-google-fonts/inter`, four static weights, no system
fallback); there are no network images anywhere in the app.

### Stories

21 stories under `src/components/` and `src/screens/`. The seven marked **web** share their
story id with `scry-playground` (same args, so the render matches); the rest are extra fixtures
for adapter/UAT coverage (long labels, the other three menu items, boundary counts, shorter
menus/orders) and have no Figma layer.

| Title | Export | Story id | |
|---|---|---|---|
| Components/Button | Primary | `components-button--primary` | web |
| Components/Button | Secondary | `components-button--secondary` | web |
| Components/Button | PrimaryLong | `components-button--primary-long` | |
| Components/Button | SecondaryLong | `components-button--secondary-long` | |
| Components/MenuItem | Default | `components-menuitem--default` | web |
| Components/MenuItem | ColdBrew | `components-menuitem--cold-brew` | |
| Components/MenuItem | MatchaLatte | `components-menuitem--matcha-latte` | |
| Components/MenuItem | Cortado | `components-menuitem--cortado` | |
| Components/MenuItem | LongName | `components-menuitem--long-name` | |
| Components/QuantityStepper | Default | `components-quantitystepper--default` | web |
| Components/QuantityStepper | Zero | `components-quantitystepper--zero` | |
| Components/QuantityStepper | DoubleDigit | `components-quantitystepper--double-digit` | |
| Screens/Menu | Default | `screens-menu--default` | web |
| Screens/Menu | TwoItems | `screens-menu--two-items` | |
| Screens/Item Detail | Default | `screens-item-detail--default` | web |
| Screens/Item Detail | ColdBrew | `screens-item-detail--cold-brew` | |
| Screens/Item Detail | MatchaLatte | `screens-item-detail--matcha-latte` | |
| Screens/Item Detail | Cortado | `screens-item-detail--cortado` | |
| Screens/Order | Default | `screens-order--default` | web |
| Screens/Order | OneItem | `screens-order--one-item` | |
| Screens/Order | ThreeItems | `screens-order--three-items` | |

### Run it, in more detail

Node 20.19+/22.12+ and npm. An Android emulator (KVM) or iOS Simulator (macOS) for the device
scripts; `npm start` alone works in Expo Go on any device on the same network.

```sh
npm install
npm run storybook-generate        # regenerate .rnstorybook/storybook.requires.ts
npm run android                   # or: npm run ios
# in another shell, once the emulator/simulator is booted:
STORYBOOK_ENABLED=true npm run android
```

Or plain Metro without a native rebuild, once a dev client / Expo Go build exists on the
device: `npm run storybook` (`STORYBOOK_ENABLED=true expo start`) and open the app.

### Android emulator in a container (no `kvm` group)

`evidence/*.png` in this repo are real captures from the `Pixel_6_API_34` AVD (`~/android-sdk`),
taken exactly this way.

**If your user is not in the `kvm` group** (`/dev/kvm` is `crw-rw---- root kvm`) the
emulator needs a KVM-passthrough workaround: run it as root inside a throwaway container with
`--network=host` (so the emulator's ports, and its guest's `10.0.2.2` alias, reach your own
Metro/adb exactly as they would outside a container) instead of directly on the host:

```sh
docker run -d --name scry-rn-emu --device=/dev/kvm --network=host \
  -v ~/android-sdk:/opt/android-sdk -v ~/.android:/root/.android ubuntu:22.04 sleep infinity
docker exec scry-rn-emu bash -c '
  apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libx11-6 libx11-xcb1 libpulse0 \
    libgl1 libnss3 libxcomposite1 libxcursor1 libxi6 libxtst6 libasound2 libxdamage1 libxkbfile1 libdbus-1-3 \
    libxrandr2 libxfixes3 libxkbcommon0 libxcb1 libdrm2 libgbm1 >/dev/null   # emulator runtime libs
  export ANDROID_HOME=/opt/android-sdk; export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH" HOME=/root
  emulator -avd Pixel_6_API_34 -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -accel on
' &
export ANDROID_HOME=~/android-sdk PATH="$ANDROID_HOME/platform-tools:$PATH"
adb wait-for-device && adb shell 'while [ "$(getprop sys.boot_completed)" != 1 ]; do sleep 2; done'

npx expo prebuild --platform android            # once; generates android/ (gitignored)
(cd android && ./gradlew assembleDebug)       # needs JDK 17 (JAVA_HOME)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081 && adb reverse tcp:7007 tcp:7007
CI=1 STORYBOOK_ENABLED=true npx expo start &    # Metro + the Storybook websocket, :7007
adb shell am start -n com.scrymore.samplern/.MainActivity
node scripts/capture-stories.mjs evidence       # 3 stories -> evidence/*.png over the :7007 socket

adb -s emulator-5554 emu-kill 2>/dev/null; docker rm -f scry-rn-emu   # shut the emulator down
```

If your user is in the `kvm` group the container wrapper is unnecessary: run `emulator -avd Pixel_6_API_34
-no-window -no-audio` directly, then the same `adb`/`expo start`/capture steps.

`scripts/capture-stories.mjs` connects to the Storybook WebSocket, sends `setCurrentStory` for
each requested id, waits `SCRY_CAPTURE_SETTLE_MS` (default 1500 ms), and screenshots with
`adb exec-out screencap -p` — the same selection protocol `scry capture rn` drives. The app
needs a force-stop (`adb shell am force-stop <package>`) before a fresh launch if a previous
Metro run failed to bundle — React Native's bridgeless host does not retry a failed bundle load
on its own; `adb shell am start` alone just refocuses the already-failed instance.

This repo stays iOS-buildable (`npm run ios`; no Android-only native deps). The container recipe
above is Android only; on a Mac use the iOS Simulator.

### What `scry capture rn` does

The Scry CLI (`@scrymore/scry-deployer` 0.10+) drives this app end to end (step 2 above).

It starts Metro with `STORYBOOK_ENABLED=true EXPO_PUBLIC_SCRY_CAPTURE=1`. Capture mode
(`src/capture.ts`) then:

- hides the on-device Storybook chrome (`onDeviceUI: false`) and the safe-area padding
  (`noSafeArea`), so a 390×844 screen story starts at the top of the display;
- mounts `.rnstorybook/scryProbe.tsx`, a dev-only decorator that adds no view. Over the
  Storybook channel it answers `scry:requestTree` with the `scry-root` bounds (the crop on iOS)
  and an `rn-fiber` structure tree (scf-tree/1: component names, testIDs, roles, text, bounds
  in points relative to the root, the React Native style keys the format lists).

Neither runs in a normal build. Native iOS dev builds of this Expo SDK 57 app need Xcode 26;
Expo Go works with older Xcode.

## License

MIT, see [`LICENSE`](LICENSE).
