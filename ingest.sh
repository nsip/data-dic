#!/bin/bash

set -e

cd ./data/preproc
./preproc
cd -

cd ./db
node ./db-ingest-sh.js
cd -
