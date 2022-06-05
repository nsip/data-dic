#!/bin/bash

set -e

rm -f *.log

rm -f ./prelease/prelease

rm -f ./data/*.json
rm -rf ./data/out
rm -rf ./data/err

# clean test entities in db
cd ./db
node ./db-del.js
cd -