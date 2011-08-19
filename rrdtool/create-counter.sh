#!/bin/sh
start="$1"
sample_rate="$2"

step="$(calc -p 60*"$sample_rate")"
maxstep="$(calc -p 2*"$step")"

samples_per_day="$(calc -p 24*60/"$sample_rate")"
samples_per_hour="$(calc -p 60/"$sample_rate")"

test -f test.rrd && rm -f test.rrd
test -f test.csv && rm -f test.csv

set +x

rrdtool create test.rrd \
	--step "$step" \
	--start "$start" \
	DS:item:COUNTER:"$maxstep":U:U \
	RRA:AVERAGE:0.5:1:"$samples_per_day" \
	RRA:AVERAGE:0.5:"$samples_per_hour":24

# EOF
