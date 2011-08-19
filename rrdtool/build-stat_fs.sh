#!/bin/sh
set -e

# Arguments
system="$1"
filename="$2"
data="$3"
block_data="$4"
start="$5"
end="$6"
prefix="$7"
label="$8"
unit="$9"

mangled_filename="$(echo "x$filename"|sed -re 's/^x//' -e 's/[^a-zA-Z0-9\_]/_/g')"

title="$system $data"
imgfile="$prefix$system-$mangled_filename-$data.png"

echo "$system"|grep -Eq '^[a-zA-Z0-9\-]+$'
echo "$data"|grep -Eq '^[a-zA-Z0-9_]+$'
test x = "x$label" && label="load"

# Build RRD
set -x
./create-gauge.sh "$start" 5
./db-query-stat_fs.sh "$system" "$filename" "$start" "$end" "$data" "$block_data" > test.csv
cat test.csv|xargs rrdtool update test.rrd
./rrdtool-graph-stat_fs.sh "$title" "$label" "$start" "$end" "$imgfile" "$unit"

# EOF
