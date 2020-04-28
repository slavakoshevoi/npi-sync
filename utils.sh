[[ -z "$FOREVER_ROOT" ]] && FOREVER_ROOT="$HOME/.forever"

[[ -z "$GLOBAL_LOG" ]] && GLOBAL_LOG="$FOREVER_ROOT/sync-providers.log"

function forever_stop()
{
    timeout 2 forever stop "$1" || forever stop "$1"
}

function forever_run()
{
    local APP_UID="$1"
    local APP_FILE="$2"
    local APP_LOG="$3"
    local LOG_FILE="$FOREVER_ROOT/$APP_LOG.log"

    forever_stop ${APP_UID}
    forever \
      --uid "$APP_UID" start \
      --spinSleepTime=2000 \
      --append \
      -l "$LOG_FILE" \
      -o "$GLOBAL_LOG" \
      -e "$GLOBAL_LOG" \
      "$APP_FILE"
}

[[ -z "$UID_SUFFIX" ]] && export UID_SUFFIX="_dev"

function parse_run_env()
{
    case "$1" in
        "production")
            export NODE_ENV=production
            export UID_SUFFIX="_prod"
            ;;

        "staging")
            export NODE_ENV=staging
            export UID_SUFFIX="_dev"
            ;;

        *)
            echo "Unknown mode. Available modes are: production, staging"
            return 1
            ;;
    esac
}

function run_module()
{
    local name="$1"
    local main="$2"

    forever_run "$name$UID_SUFFIX" "$main" "$name$UID_SUFFIX"
}
