#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export UPLOAD_MAX_FILESIZE="${UPLOAD_MAX_FILESIZE:-20M}"
export POST_MAX_SIZE="${POST_MAX_SIZE:-20M}"
export MAX_INPUT_TIME="${MAX_INPUT_TIME:-120}"
export MAX_EXECUTION_TIME="${MAX_EXECUTION_TIME:-120}"
export MEMORY_LIMIT="${MEMORY_LIMIT:-512M}"

php -d upload_max_filesize="${UPLOAD_MAX_FILESIZE}" \
    -d post_max_size="${POST_MAX_SIZE}" \
    -d max_input_time="${MAX_INPUT_TIME}" \
    -d max_execution_time="${MAX_EXECUTION_TIME}" \
    -d memory_limit="${MEMORY_LIMIT}" \
    artisan octane:start --server=swoole --host=0.0.0.0 --port=8000 "$@"
