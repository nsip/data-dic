#!/bin/bash

set -e

./rename
./preproc

rm -rf ./data/renamed

cd ./db
node ./db-ingest-sh.js
cd -
