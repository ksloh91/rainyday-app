#!/usr/bin/env bash
# Run cap on a single adb device (physical phone preferred).
set -euo pipefail

cd "$(dirname "$0")/.."
DEVICE="$(bash scripts/android-adb-device.sh)"
echo "Using device: $DEVICE"
exec npx cap run android --target "$DEVICE" "$@"
