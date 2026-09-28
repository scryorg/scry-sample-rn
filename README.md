# scry-sample-rn

Kettle, on-device: a small Expo + React Native app whose only job is to carry an on-device
[`@storybook/react-native`](https://github.com/storybookjs/react-native) v10 build that mirrors
[`scry-playground`](https://github.com/scryorg/scry-playground) (Kettle, the web Storybook) —
same tokens, same copy, same seven canonical story ids. It is the fixture for Scry's
`capture rn` adapter ([capture-sources](https://github.com/scryorg/scry-management) plan, PR 6)
and its acceptance tests AT-1/AT-2, and it is built to match the Kettle Figma file
(`okiwUTcdKlV1PmUtbuHjvZ`) closely enough that a Figma-vs-device diff is meaningful.

[`SPEC.md`](SPEC.md) mirrors the web build's spec (tokens, positions, labels, story ids) —
change the web repo's `SPEC.md` first, then this one, then the Figma file.

## How Storybook mode works (entry-point swapping)

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

## Capture determinism

Every component and screen root carries `testID="scry-root"` (`src/Screen.tsx`, and directly on
each component's root element) — the crop target for `capture rn`. `EXPO_PUBLIC_SCRY_CAPTURE=1`
turns off Pressable/Android-ripple touch feedback so repeat captures are pixel-identical
(`src/capture.ts`). Expo only inlines `process.env.EXPO_PUBLIC_*` into the app bundle — a bare
`SCRY_CAPTURE` var would not reach Hermes — so the flag is `EXPO_PUBLIC_SCRY_CAPTURE`, not
`SCRY_CAPTURE`. Fonts are bundled (`@expo-google-fonts/inter`, four static weights, no system
fallback); there are no network images anywhere in the app.

## Stories

20 stories under `src/components/` and `src/screens/`. The seven marked **web** share their
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

## Run it

Node 20.19+/22.12+ and npm. An Android emulator (KVM) or iOS Simulator (macOS) for the device
scripts below; `npm start` alone works in Expo Go on any device on the same network.

```sh
npm install
npm run storybook-generate        # regenerate .rnstorybook/storybook.requires.ts
npm run android                   # or: npm run ios
# in another shell, once the emulator/simulator is booted:
STORYBOOK_ENABLED=true npm run android
```

Or plain Metro without a native rebuild, once a dev client / Expo Go build exists on the
device: `npm run storybook` (`STORYBOOK_ENABLED=true expo start`) and open the app.

### Android emulator screenshots (this box)

Verified 2026-09-28: `evidence/*.png` in this repo are real captures from the `Pixel_6_API_34`
AVD (`~/android-sdk`), taken exactly this way.

**This box's `boxuser` is not in the `kvm` group** (`/dev/kvm` is `crw-rw---- root kvm`), so the
emulator needs a KVM-passthrough workaround — run it as root inside a throwaway container with
`--network=host` (so the emulator's ports, and its guest's `10.0.2.2` alias, reach this box's own
Metro/adb exactly as they would outside a container) instead of directly on the host:

```sh
docker run -d --name scry-rn-emu --device=/dev/kvm --network=host \
  -v ~/android-sdk:/opt/android-sdk -v ~/.android:/root/.android ubuntu:22.04 sleep infinity
docker exec scry-rn-emu bash -c '
  export ANDROID_HOME=/opt/android-sdk PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH" HOME=/root
  emulator -avd Pixel_6_API_34 -no-window -no-audio -no-boot-anim -gpu swiftshader_indirect -accel on
' &
export ANDROID_HOME=~/android-sdk PATH="$ANDROID_HOME/platform-tools:$PATH"
adb wait-for-device && adb shell 'while [ "$(getprop sys.boot_completed)" != 1 ]; do sleep 2; done'

npx expo prebuild --platform android            # once; generates android/ (gitignored)
JAVA_HOME=~/java/jdk-17.0.2 PATH="$JAVA_HOME/bin:$PATH" (cd android && ./gradlew assembleDebug)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081 && adb reverse tcp:7007 tcp:7007
CI=1 STORYBOOK_ENABLED=true npx expo start &    # Metro + the Storybook websocket, :7007
adb shell am start -n com.scrymore.samplern/.MainActivity
node scripts/capture-stories.mjs evidence       # 3 stories -> evidence/*.png over the :7007 socket

adb -s emulator-5554 emu-kill 2>/dev/null; docker rm -f scry-rn-emu   # shut the emulator down
```

If `boxuser` is later added to the `kvm` group (capture-sources followup F21 — needed for PR 6's
own emulator runs too), the container wrapper is unnecessary: `emulator -avd Pixel_6_API_34
-no-window -no-audio` directly, then the same `adb`/`expo start`/capture steps.

`scripts/capture-stories.mjs` connects to the Storybook WebSocket, sends `setCurrentStory` for
each requested id, waits `SCRY_CAPTURE_SETTLE_MS` (default 1500 ms), and screenshots with
`adb exec-out screencap -p` — the same selection protocol `capture rn` (PR 6) drives. The app
needs a force-stop (`adb shell am force-stop <package>`) before a fresh launch if a previous
Metro run failed to bundle — React Native's bridgeless host does not retry a failed bundle load
on its own; `adb shell am start` alone just refocuses the already-failed instance.

iOS is the Mac mini's job (PR 6's device farm, see the `onlook-fork`/`ui-automator-spectra`
memory) — this repo stays iOS-buildable (`npm run ios`; no Android-only native deps) but is not
verified on a simulator here.

## License

MIT, see [`LICENSE`](LICENSE).
