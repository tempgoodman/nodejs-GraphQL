#!/bin/sh

echo "wait 5 seconds ..."
sleep 5 

echo "start dynamic composition of Supergraph"
export APOLLO_ELV2_LICENSE="accept"
npx @apollo/rover supergraph compose --config ./supergraph-prod.yaml --output supergraph.graphql

echo "Supergraph composition completed, ready to start the Gateway!"
npm run start