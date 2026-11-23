#!/usr/bin/env bash
# Sobe/derruba API, web e mobile (Expo tunnel) DENTRO do Codespace, sob demanda.
# Uso: ./scripts/dev.sh help
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly ROOT
readonly API_PORT=8080
readonly WEB_PORT=3000
readonly MOBILE_PORT=8081
readonly SESSION_PREFIX="gestao"
readonly SERVICES=(api web mobile)

fail() {
  printf 'Erro: %s\n' "$*" >&2
  exit 1
}

show_help() {
  cat <<'EOF'
Gerencia API (Spring), web (Next.js) e mobile (Expo --tunnel) no Codespace.

Uso:
  ./scripts/dev.sh up [api|web|mobile|all]    inicia (padrão: all)
  ./scripts/dev.sh down [api|web|mobile|all]  encerra (padrão: all)
  ./scripts/dev.sh status                     mostra estado e URLs
  ./scripts/dev.sh logs <servico> [linhas]    mostra as últimas linhas (padrão: 80)
  ./scripts/dev.sh qr                         mostra o QR code/URL do Expo (celular)
  ./scripts/dev.sh attach <servico>           abre o terminal do serviço (Ctrl+B, D sai)

Credenciais do Neon: use Codespaces secrets (variáveis de ambiente) ou
backend/spring/.env. O .env, se existir, é carregado antes de subir a API.
EOF
}

# ---------- helpers ----------

session_name() { printf '%s-%s' "$SESSION_PREFIX" "$1"; }

port_of() {
  case "$1" in
    api) echo "$API_PORT" ;;
    web) echo "$WEB_PORT" ;;
    mobile) echo "$MOBILE_PORT" ;;
    *) fail "Serviço desconhecido: $1 (use: api, web, mobile)" ;;
  esac
}

public_url() {
  local port="$1"
  if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
    printf 'https://%s-%s.%s' "$CODESPACE_NAME" "$port" "$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN"
  else
    printf 'http://localhost:%s' "$port"
  fi
}

require_cmds() {
  local c
  for c in tmux curl npm; do
    command -v "$c" >/dev/null 2>&1 || fail "'$c' não encontrado. Rebuild do Codespace resolve (postCreateCommand instala)."
  done
}

is_alive() {
  local name
  name="$(session_name "$1")"
  tmux has-session -t "$name" 2>/dev/null || return 1
  [[ "$(tmux list-panes -t "$name" -F '#{pane_dead}' | head -n1)" == "0" ]]
}

port_open() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

wait_for() {
  local svc="$1" timeout="${2:-180}"
  local deadline=$((SECONDS + timeout)) port body
  port="$(port_of "$svc")"
  while ((SECONDS < deadline)); do
    if ! is_alive "$svc"; then
      printf '%s encerrou durante a inicialização. Últimas linhas:\n' "$svc" >&2
      tmux capture-pane -p -t "$(session_name "$svc")" -S -40 >&2 || true
      return 1
    fi
    case "$svc" in
      api)
        body="$(curl --silent --connect-timeout 2 --max-time 5 "http://127.0.0.1:$port/actuator/health" || true)"
        grep -Eq '"status"[[:space:]]*:[[:space:]]*"UP"' <<<"$body" && return 0
        ;;
      web)
        curl --fail --silent --connect-timeout 2 --max-time 5 "http://127.0.0.1:$port/" -o /dev/null && return 0
        ;;
      mobile)
        port_open "$port" && return 0
        ;;
    esac
    sleep 2
  done
  printf 'Tempo esgotado esperando %s. Veja: ./scripts/dev.sh logs %s\n' "$svc" "$svc" >&2
  return 1
}

npm_install_if_needed() {
  local dir="$1"
  [[ -d "$dir/node_modules" ]] && return 0
  [[ -f "$dir/package-lock.json" ]] || fail "package-lock.json não encontrado em $dir"
  printf 'Instalando dependências em %s...\n' "$dir"
  (cd "$dir" && npm ci)
}

set_port_visibility() {
  local port="$1" visibility="$2"
  [[ -n "${CODESPACE_NAME:-}" ]] && command -v gh >/dev/null 2>&1 || return 0
  gh codespace ports visibility "$port:$visibility" -c "$CODESPACE_NAME" >/dev/null 2>&1 && return 0
  if [[ "$visibility" == "public" ]]; then
    printf 'Aviso: não consegui deixar a porta %s pública. Faça manualmente: aba Ports > %s > Port Visibility > Public.\n' "$port" "$port" >&2
  fi
}

start_in_tmux() {
  local svc="$1" dir="$2" cmd="$3" name
  name="$(session_name "$svc")"
  tmux kill-session -t "$name" 2>/dev/null || true
  tmux new-session -d -s "$name" -c "$dir" "bash -lc $(printf '%q' "$cmd")"
  # mantém o painel após o processo morrer, para dar para ler o erro
  tmux set-option -t "$name" remain-on-exit on >/dev/null
}

# ---------- serviços ----------

up_api() {
  if is_alive api; then echo "API já está rodando."; return 0; fi
  if [[ ! -f "$ROOT/backend/spring/.env" && -z "${SPRING_DATASOURCE_URL:-}" ]]; then
    printf 'Aviso: sem backend/spring/.env e sem SPRING_DATASOURCE_URL no ambiente. Configure os Codespaces secrets do Neon.\n' >&2
  fi
  echo "Iniciando API..."
  start_in_tmux api "$ROOT/backend/spring" \
    'if [ -f .env ]; then set -a; . ./.env; set +a; fi; ./mvnw spring-boot:run'
  wait_for api 240
  set_port_visibility "$API_PORT" public
  echo "API pronta: $(public_url "$API_PORT")"
}

up_web() {
  if is_alive web; then echo "Web já está rodando."; return 0; fi
  npm_install_if_needed "$ROOT/web"
  echo "Iniciando web..."
  local api_url
  api_url="$(public_url "$API_PORT")"
  start_in_tmux web "$ROOT/web" \
    "NEXT_PUBLIC_API_URL='$api_url' NEXT_PUBLIC_API_BASE_URL='$api_url' npm run dev -- --hostname 0.0.0.0 --port $WEB_PORT"
  wait_for web 120
  echo "Web pronto: $(public_url "$WEB_PORT")"
}

up_mobile() {
  if is_alive mobile; then echo "Mobile já está rodando. Use: ./scripts/dev.sh qr"; return 0; fi
  npm_install_if_needed "$ROOT/mobile"
  echo "Iniciando mobile (Expo tunnel)..."
  local api_url
  api_url="$(public_url "$API_PORT")"
  start_in_tmux mobile "$ROOT/mobile" \
    "EXPO_PUBLIC_API_URL='$api_url' EXPO_PUBLIC_API_BASE_URL='$api_url' npx expo start --tunnel --port $MOBILE_PORT"
  wait_for mobile 120
  # o túnel (ngrok) leva alguns segundos a mais para publicar a URL exp://
  sleep 8
  cmd_qr
}

cmd_up() {
  require_cmds
  local target="${1:-all}"
  case "$target" in
    all) up_api; up_web; up_mobile ;;
    api) up_api ;;
    web) up_web ;;
    mobile) up_mobile ;;
    *) fail "Serviço desconhecido: $target" ;;
  esac
}

cmd_down() {
  require_cmds
  local target="${1:-all}" svc
  local list=("$target")
  [[ "$target" == "all" ]] && list=("${SERVICES[@]}")
  for svc in "${list[@]}"; do
    port_of "$svc" >/dev/null
    tmux kill-session -t "$(session_name "$svc")" 2>/dev/null && printf '%s encerrado.\n' "$svc" || true
  done
  if [[ "$target" == "all" || "$target" == "api" ]]; then
    set_port_visibility "$API_PORT" private
  fi
}

cmd_status() {
  require_cmds
  local svc state
  for svc in "${SERVICES[@]}"; do
    if is_alive "$svc"; then state="rodando"; else state="parado"; fi
    printf '%-7s %-8s %s\n' "$svc" "$state" "$(public_url "$(port_of "$svc")")"
  done
}

cmd_logs() {
  require_cmds
  local svc="${1:-}" lines="${2:-80}"
  [[ -n "$svc" ]] || fail "Informe o serviço: api, web ou mobile"
  port_of "$svc" >/dev/null
  tmux has-session -t "$(session_name "$svc")" 2>/dev/null || fail "$svc não está rodando."
  tmux capture-pane -p -t "$(session_name "$svc")" -S "-$lines"
}

cmd_qr() {
  require_cmds
  is_alive mobile || fail "mobile não está rodando. Use: ./scripts/dev.sh up mobile"
  tmux capture-pane -p -t "$(session_name mobile)" -S -60
  echo
  echo "Abra o Expo Go no celular e escaneie o QR (ou use a URL exp:// acima)."
}

cmd_attach() {
  require_cmds
  local svc="${1:-}"
  [[ -n "$svc" ]] || fail "Informe o serviço: api, web ou mobile"
  port_of "$svc" >/dev/null
  exec tmux attach -t "$(session_name "$svc")"
}

main() {
  local cmd="${1:-help}"
  shift || true
  case "$cmd" in
    up) cmd_up "$@" ;;
    down) cmd_down "$@" ;;
    status) cmd_status ;;
    logs) cmd_logs "$@" ;;
    qr) cmd_qr ;;
    attach) cmd_attach "$@" ;;
    help | -h | --help) show_help ;;
    *) show_help; exit 1 ;;
  esac
}

main "$@"
