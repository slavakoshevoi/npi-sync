#!/usr/bin/env bash

USE_NODE_VERSION="${1:-12}" # use 12 by default

#####################################
#  Requires: nvm, awk
#  Usage:
#     source ./nvm_use
#       or
#     source ./nvm_use v12
#####################################


# check for nvm availability
if [ -f ~/.nvm/nvm.sh ]
then
    echo "----  NVM already exists  ----"
else
    echo '----  Install NVM  ----'
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
fi


# use nvm
. ~/.nvm/nvm.sh
echo "NVM version: $(nvm --version)";

if [ "$(nvm list $USE_NODE_VERSION | awk '{print $1}')" = "N/A" ]
then
    echo '----  Installing node version  ----'
    nvm install $USE_NODE_VERSION
else
  nvm use $USE_NODE_VERSION
fi
