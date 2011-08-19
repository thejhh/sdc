#!/bin/sh
title=$1
label=$2
start=$3
end=$4
imgfile=$5

rrdtool graph "$imgfile" \
	--title "$title" \
	--vertical-label "$label" \
	--start "$start" --end "$end" \
	DEF:myitems=test.rrd:item:AVERAGE \
	LINE2:myitems#0000FF
