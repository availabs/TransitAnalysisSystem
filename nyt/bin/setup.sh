#!/bin/bash 

set -e

PROJ_ROOT='../../../../'

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd $PROJ_ROOT

# Install the Node.js dependencies
npm install --production

# Get the GTFS static data
./bin/updateGTFSData.js

