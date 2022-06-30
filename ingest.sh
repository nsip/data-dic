#!/bin/bash

set -e

./preproc -whole

cd ./db
node ./db-ingest-sh.js
cd -

rm -rf ./data/out
rm -rf ./data/err