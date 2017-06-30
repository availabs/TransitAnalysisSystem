#!/bin/bash 

set -e

DOCKER_DIR='../../docker/'

cd "$( dirname "${BASH_SOURCE[0]}" )"

cd $DOCKER_DIR

docker-compose up
