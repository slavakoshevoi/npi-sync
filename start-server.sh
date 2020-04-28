#!/bin/bash

DIR=$(cd $(dirname "$0"); pwd)
cd $DIR
. "$DIR/utils.sh"

parse_run_env $1 || exit 1

read -p "Do you want to start hard update (y/n)?" REPLY
if [[ $REPLY =~ ^[Yy]$ ]]; then
  export HARD_UPDATE=1
fi

source ./nvm_use_save.sh 12;
echo node.js verion: $(node -v);

npm list -g | grep forever-monitor || npm install -g forever --no-shrinkwrap

echo "Starting server..."
run_module "sync-providers" index.ts
