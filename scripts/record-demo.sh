#!/usr/bin/env bash
set -euo pipefail

# Auto-record a no-narration demo video of the app via agent-browser.
#
# Requirements:
# - dev server running at http://localhost:3000 (npm run dev)
# - agent-browser installed (provided by this environment)

OUT="${1:-tmp/demo.webm}"
SESSION="${AGENT_BROWSER_SESSION:-demo-video}"
BASE_URL="${DEMO_BASE_URL:-http://localhost:3000}"

mkdir -p "$(dirname "$OUT")"

if [[ -f "$OUT" ]]; then
  base="${OUT%.*}"
  ext="${OUT##*.}"
  ts="$(date +%Y%m%d-%H%M%S)"
  OUT="${base}-${ts}.${ext}"
fi

cleanup() {
  # Best-effort stop/close; ignore failures so we still return video if possible.
  agent-browser --session "$SESSION" record stop >/dev/null 2>&1 || true
  agent-browser --session "$SESSION" close >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_for_model_signal() {
  local timeout_seconds="${1:-35}"
  local start_ts
  start_ts="$(date +%s)"

  while true; do
    local body_text
    body_text="$(agent-browser --session "$SESSION" get text body 2>/dev/null || true)"
    if echo "$body_text" | grep -q "MODE:MODEL"; then
      if echo "$body_text" | grep -Eq "Planner:[[:space:]]*MODEL|Debate:[[:space:]]*MODEL|Strategy:[[:space:]]*MODEL"; then
        return 0
      fi
    fi
    local now
    now="$(date +%s)"
    if (( now - start_ts >= timeout_seconds )); then
      return 1
    fi
    agent-browser --session "$SESSION" wait 1200 >/dev/null 2>&1 || true
  done
}

# Preflight: verify model path returns source=model before starting capture.
model_probe="$(curl -sN --max-time 35 -X POST "$BASE_URL/api/agent/object/stream" \
  -H 'Content-Type: application/json' \
  -d '{"task":"planner","worldView":"demo probe","resources":{"energy":70,"wood":40,"stone":30,"food":80,"water":70},"threatLevel":"low","feedback":"probe"}' \
  | grep -E '"source":"model"' || true)"

if [[ -z "$model_probe" ]]; then
  echo "Abort: planner stream did not return source=model. Check provider key/quota first."
  exit 1
fi

agent-browser --session "$SESSION" --headed record start "$OUT" "$BASE_URL"
agent-browser --session "$SESSION" set viewport 1440 900
agent-browser --session "$SESSION" wait 600

# Pick a default world view.
agent-browser --session "$SESSION" find text "🏝️ 荒岛求生" click
agent-browser --session "$SESSION" wait 2200
if ! wait_for_model_signal 45; then
  echo "Warning: did not detect model signal after init, continuing recording."
fi

# Showcase evidence chain details + vote reasons overlay.
agent-browser --session "$SESSION" find text "展开细节" click || true
agent-browser --session "$SESSION" wait 800
agent-browser --session "$SESSION" find text "查看投票理由" click || true
agent-browser --session "$SESSION" wait 1800
agent-browser --session "$SESSION" find text "EMERGENCE" click || true
agent-browser --session "$SESSION" wait 600

# Scroll a bit so the viewer understands this is a timeline.
agent-browser --session "$SESSION" scroll down 520 || true
agent-browser --session "$SESSION" wait 700

# Add an intervention so a new case appears.
agent-browser --session "$SESSION" find placeholder "输入干预或争论议题..." fill "立即修复供水系统"
agent-browser --session "$SESSION" wait 300
agent-browser --session "$SESSION" click 'button:has-text("EXECUTE")'
agent-browser --session "$SESSION" wait 2500
if ! wait_for_model_signal 35; then
  echo "Warning: did not detect model signal after intervention."
fi

# Interact again with the newly generated case.
agent-browser --session "$SESSION" find text "查看投票理由" click || true
agent-browser --session "$SESSION" wait 1500
agent-browser --session "$SESSION" find text "EMERGENCE" click || true
agent-browser --session "$SESSION" wait 600
agent-browser --session "$SESSION" scroll down 620 || true
agent-browser --session "$SESSION" wait 2000

# Leave a few seconds of "agent loop" running so the viewer sees motion.
agent-browser --session "$SESSION" wait 5000

agent-browser --session "$SESSION" record stop

echo "Saved demo video: $OUT"
