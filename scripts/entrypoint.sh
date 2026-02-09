#!/usr/bin/env sh
set -eu

required_vars="VITE_FIREBASE_API_KEY VITE_FIREBASE_AUTH_DOMAIN VITE_FIREBASE_PROJECT_ID VITE_FIREBASE_STORAGE_BUCKET VITE_FIREBASE_MESSAGING_SENDER_ID VITE_FIREBASE_APP_ID"
missing=""

for var in $required_vars; do
  value=$(printenv "$var" 2>/dev/null || true)
  if [ -z "$value" ]; then
    missing="$missing $var"
  fi
done

if [ -n "$missing" ]; then
  echo "Missing required env vars:$missing" >&2
  exit 1
fi

escape_js() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

cat > /app/dist/config.js <<EOF
window.__APP_CONFIG__ = {
  VITE_FIREBASE_API_KEY: "$(escape_js "$VITE_FIREBASE_API_KEY")",
  VITE_FIREBASE_AUTH_DOMAIN: "$(escape_js "$VITE_FIREBASE_AUTH_DOMAIN")",
  VITE_FIREBASE_PROJECT_ID: "$(escape_js "$VITE_FIREBASE_PROJECT_ID")",
  VITE_FIREBASE_STORAGE_BUCKET: "$(escape_js "$VITE_FIREBASE_STORAGE_BUCKET")",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "$(escape_js "$VITE_FIREBASE_MESSAGING_SENDER_ID")",
  VITE_FIREBASE_APP_ID: "$(escape_js "$VITE_FIREBASE_APP_ID")"
};
EOF

exec serve -s /app/dist -l "${PORT:-8080}"
