#!/bin/bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Using the configuration file found here:"
echo "    ${DIR}/../node_modules/MTA_Subway_SIRI_Server/config/"
echo

node --max-old-space-size=7000 \
    "${DIR}/../node_modules/.bin/updateGTFSData" \
    "${DIR}/../node_modules/MTA_Subway_SIRI_Server/src/services/ConfigsService.js"
