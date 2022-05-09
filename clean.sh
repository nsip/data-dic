#!/bin/bash

set -e

# rm -rf ./data/preproc/preproc

rm -rf ./uploads/*.* ./uploads/*

rm -rf ./data/preproc/out
rm -rf ./data/preproc/err

rm -f ./data/AAA.json
rm -f ./data/BBB.json
rm -f ./data/CCC.json
rm -f ./data/DDD.json
rm -f ./data/EEE.json
rm -f ./data/FFF.json
rm -f ./data/GGG.json
rm -f ./data/HHH.json
rm -f ./data/III.json
rm -f ./data/JJJ.json
rm -f ./data/KKK.json
rm -f ./data/LLL.json
rm -f ./data/MMM.json
rm -f ./data/NNN.json
rm -f ./data/OOO.json
rm -f ./data/PPP.json
rm -f ./data/QQQ.json
rm -f ./data/RRR.json
rm -f ./data/SSS.json
rm -f ./data/TTT.json
rm -f ./data/UUU.json
rm -f ./data/VVV.json
rm -f ./data/WWW.json
rm -f ./data/XXX.json
rm -f ./data/YYY.json
rm -f ./data/ZZZ.json

# clean test entities in db
cd ./db
node ./db-del.js
cd -