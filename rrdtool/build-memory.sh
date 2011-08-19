#!/bin/sh
set -e

# Arguments
system="$1"
data="$2"
start="$3"
end="$4"
prefix="$5"
label="$6"
unit="$7"

title="$system $data"
imgfile="$prefix$system-$data.png"

echo "$system"|grep -Eq '^[a-zA-Z0-9\-]+$'
echo "$data"|grep -Eq '^[a-zA-Z0-9_]+$'
test x = "x$label" && label="load"

# Build RRD
#set -x
./create-gauge.sh "$start" 5
./db-query-memory.sh "$system" "$start" "$end" "$data" > test.csv
cat test.csv|xargs rrdtool update test.rrd
./rrdtool-graph-memory.sh "$title" "$label" "$start" "$end" "$imgfile" "$unit"

# EOF
