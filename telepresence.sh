#!/bin/bash

CMD="telepresence --namespace $(s-get-common-namespace) --swap-deployment saagie-common-sqlpad --env-json telepresence.json"

echo "Running Telepresence with: $CMD"
$CMD