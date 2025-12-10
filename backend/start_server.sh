#!/usr/bin/env bash
cd "$(dirname "$0")"
php -d upload_max_filesize=20M -d post_max_size=20M -d max_input_time=120 -d max_execution_time=120 -d memory_limit=256M artisan serve
