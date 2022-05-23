#!/bin/bash

set -e

rm *.log

rm -rf ./uploads/*.* ./uploads/*

rm -f ./data/*.json
rm -rf ./data/out
rm -rf ./data/err

# clean test entities in db
cd ./db
node ./db-del.js
cd -