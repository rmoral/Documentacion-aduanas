#!/usr/bin/env bash
# Fija el dominio real del site en todos los ficheros que usan el marcador
# https://TU-DOMINIO (canonical, hreflang, Open Graph, JSON-LD, sitemap.xml,
# robots.txt y llms.txt).
#
# Uso:  ./tools/set-domain.sh https://www.tudominio.com
#
# Pasa el dominio SIN barra final. Ejecútalo una sola vez desde la raíz del
# repositorio en cuanto tengas el dominio definitivo, revisa el diff y haz
# commit. Hasta entonces el marcador es inofensivo, pero canonical/hreflang
# no surtirán efecto.

set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Uso: $0 https://www.tudominio.com" >&2
  exit 1
fi
DOMAIN="${DOMAIN%/}"
if [[ ! "$DOMAIN" =~ ^https:// ]]; then
  echo "El dominio debe empezar por https:// — recibido: $DOMAIN" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

FILES=$(grep -rl "https://TU-DOMINIO" --include="*.html" --include="*.xml" --include="*.txt" . | grep -v node_modules || true)
if [[ -z "$FILES" ]]; then
  echo "No queda ningún marcador https://TU-DOMINIO que reemplazar."
  exit 0
fi

echo "$FILES" | while read -r f; do
  sed -i "s|https://TU-DOMINIO|$DOMAIN|g" "$f"
  echo "actualizado: $f"
done

echo
echo "Hecho. Revisa el diff (git diff) y haz commit."
