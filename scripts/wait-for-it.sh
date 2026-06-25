#!/bin/bash
# wait-for-it.sh — Wait for a service to become available.
# Usage: ./wait-for-it.sh host:port [-t timeout] [-- command]

WAITFORIT_cmdname=${0##*/}
WAITFORIT_QUIET=0
WAITFORIT_TIMEOUT=30

echoerr() { if [ "$WAITFORIT_QUIET" -ne 1 ]; then echo "$@" 1>&2; fi }

usage() {
    cat << USAGE >&2
Usage:
    $WAITFORIT_cmdname host:port [-t timeout] [-- command args]
    -h HOST | --host=HOST       Host or IP under test
    -p PORT | --port=PORT       TCP port under test
    -s | --strict               Only execute subcommand if the test succeeds
    -q | --quiet                Don't output any status messages
    -t TIMEOUT | --timeout=TIMEOUT
                                Timeout in seconds, zero for no timeout
    -- COMMAND ARGS             Execute command with args after the test finishes
USAGE
    exit 1
}

wait_for() {
    if [ "$WAITFORIT_TIMEOUT" -gt 0 ]; then
        for i in $(seq "$WAITFORIT_TIMEOUT"); do
            nc -z "$WAITFORIT_HOST" "$WAITFORIT_PORT" > /dev/null 2>&1
            result=$?
            if [ $result -eq 0 ]; then
                if [ $# -gt 0 ]; then
                    exec "$@"
                fi
                return 0
            fi
            sleep 1
        done
        echoerr "Operation timed out after ${WAITFORIT_TIMEOUT} seconds"
        exit 1
    else
        while true; do
            nc -z "$WAITFORIT_HOST" "$WAITFORIT_PORT" > /dev/null 2>&1
            result=$?
            if [ $result -eq 0 ]; then
                if [ $# -gt 0 ]; then
                    exec "$@"
                fi
                return 0
            fi
            sleep 1
        done
    fi
}

while [ $# -gt 0 ]; do
    case "$1" in
        *:* )
        WAITFORIT_HOST=${1%%:*}
        WAITFORIT_PORT=${1#*:}
        shift 1
        ;;
        -h)
        WAITFORIT_HOST="$2"
        if [ -z "$WAITFORIT_HOST" ]; then break; fi
        shift 2
        ;;
        --host=*)
        WAITFORIT_HOST="${1#*=}"
        shift 1
        ;;
        -p)
        WAITFORIT_PORT="$2"
        if [ -z "$WAITFORIT_PORT" ]; then break; fi
        shift 2
        ;;
        --port=*)
        WAITFORIT_PORT="${1#*=}"
        shift 1
        ;;
        -t)
        WAITFORIT_TIMEOUT="$2"
        if [ -z "$WAITFORIT_TIMEOUT" ]; then break; fi
        shift 2
        ;;
        --timeout=*)
        WAITFORIT_TIMEOUT="${1#*=}"
        shift 1
        ;;
        -s | --strict)
        WAITFORIT_STRICT=1
        shift 1
        ;;
        -q | --quiet)
        WAITFORIT_QUIET=1
        shift 1
        ;;
        --)
        shift
        break
        ;;
        *)
        echoerr "Unknown argument: $1"
        usage
        ;;
    esac
done

if [ -z "$WAITFORIT_HOST" ] || [ -z "$WAITFORIT_PORT" ]; then
    echoerr "Error: you need to provide a host and port to test."
    usage
fi

wait_for "$@"
