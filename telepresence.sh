#!/bin/bash

CMD="telepresence --namespace $(s-get-common-namespace) --swap-deployment saagie-common-sqlpad --env-json telepresence.json --also-proxy 10.10.0.30"

echo "Running Telepresence with: $CMD"
$CMD