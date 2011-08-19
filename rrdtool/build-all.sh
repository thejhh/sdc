#!/bin/sh -x

date="$1"

./build-all-loadavg.sh "$date"
./build-all-net_dev.sh "$date"
./build-all-memory.sh "$date"
./build-all-stat_fs.sh "$date"

# EOF
