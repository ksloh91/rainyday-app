#!/usr/bin/env bash
# Print adb device serial for scripts. Prefers physical phone over emulator.
# Override: export ANDROID_SERIAL=48111FDAS002LN

set -euo pipefail

if [ -n "${ANDROID_SERIAL:-}" ]; then
  echo "$ANDROID_SERIAL"
  exit 0
fi

physical="$(adb devices | awk 'NR>1 && $2=="device" && $1 !~ /^emulator-/ { print $1; exit }')"
if [ -n "$physical" ]; then
  echo "$physical"
  exit 0
fi

first="$(adb devices | awk 'NR>1 && $2=="device" { print $1; exit }')"
if [ -n "$first" ]; then
  echo "$first"
  exit 0
fi

echo "No adb device found. Connect your phone or set ANDROID_SERIAL." >&2
exit 1
