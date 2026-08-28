#!/bin/sh
set -e

sleep 20

export APOLLO_ELV2_LICENSE="accept"

rover supergraph compose --config ./supergraph-prod.yaml --output ./supergraph.graphql

npm run start