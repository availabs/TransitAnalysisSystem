#!/bin/bash

set -e 

sudo apt-get update
sudo apt-get -y upgrade 
sudo apt-get install -y npm git wget

sudo npm install -g n
sudo n lts
sudo npm install -g npm
