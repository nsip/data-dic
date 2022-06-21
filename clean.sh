#!/bin/bash

set -e

rm -f *.log

rm -f ./prelease/prelease

rm -f ./data/*.json
rm -rf ./data/renamed
rm -rf ./data/err
rm -rf ./data/out

# clean test entities in db
cd ./db
node ./db-del.js
cd -