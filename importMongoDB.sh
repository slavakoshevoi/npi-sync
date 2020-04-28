#!/bin/sh

# Make sure we're in the right place
DIR=$(cd $(dirname "$0"); pwd)
cd $DIR
echo I am $USER and I changed PWD to $DIR

for filename in "$1"/*.json; do
  echo "Import $filename started..."
  mongoimport --uri "$2" --type json -c "$3" --mode merge --upsertFields npi --jsonArray $filename ;
done