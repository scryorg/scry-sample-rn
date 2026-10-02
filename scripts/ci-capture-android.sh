#!/usr/bin/env bash
# Runs inside reactivecircus/android-emulator-runner (a booted emulator is already attached):
# install the debug build and capture every story into .scry/capture. Used by scry-capture.yml.
set -euo pipefail
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081
adb reverse tcp:7007 tcp:7007
npx @scrymore/scry-deployer capture rn --platform android --app-id com.scrymore.samplern
