#!/bin/bash

rm -f ./logs/*

cd "$( dirname "${BASH_SOURCE[0]}" )"

node "../code/AnalysisEngine.js"
