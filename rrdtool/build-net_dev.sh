#!/bin/sh
set -e

# Arguments
system="$1"
data="$2"
start="$3"
end="$4"
prefix="$5"
interface="$6"
label="$7"
style=""

title="$system $interface $data"
imgfile="$prefix$system-$interface-$data.png"

echo "$system"|grep -Eq '^[a-zA-Z0-9\-]+$'
echo "$interface"|grep -Eq '^[a-zA-Z0-9]+$'
echo "$data"|grep -Eq '^[a-zA-Z0-9_]+$'
test x = "x$label" && label=""

# Build RRD
#set -x
./create-counter.sh "$start" 5
./db-query-net_dev.sh "$system" "$interface" "$start" "$end" "$data" > test.csv
test -s test.csv
cat test.csv|xargs rrdtool update test.rrd
./rrdtool-graph-net_dev.sh "$title" "$label" "$start" "$end" "$imgfile" "$style"

# EOF
