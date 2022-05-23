#!/bin/bash

set -e

./rename
./preproc

cd ./db
node ./db-ingest-sh.js
cd -
