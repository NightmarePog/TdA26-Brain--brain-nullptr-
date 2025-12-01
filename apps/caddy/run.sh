#!/bin/bash

# Soubor s konfigurací Caddy
CADDYFILE="Caddyfile"

run_caddy() {
    echo "starting Caddy with configuration: $CADDYFILE"

    sudo caddy run --config "$CADDYFILE" --adapter caddyfile
    local status=$?

    if [ $status -ne 0 ]; then
        echo "❌ Caddy failed to start! Status: $status" >&2
        return $status
    else
        echo "Caddy sucesfully on"
    fi
}

# Hlavní logika skriptu
run_caddy || {
    echo "trying to start Caddy again"
    sleep 5
    run_caddy || {
        echo "❌ Failed even after restart, quiting..." >&2
        exit 1
    }
}
