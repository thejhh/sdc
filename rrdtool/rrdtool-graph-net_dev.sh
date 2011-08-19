#!/bin/sh
title=$1
label=$2
start=$3
end=$4
imgfile=$5
style="$6"

if test x"$style" = xbits; then
	rrdtool graph "$imgfile" \
		--title "$title" \
		--vertical-label "$label" \
		--start "$start" --end "$end" \
		DEF:bytesps=test.rrd:item:AVERAGE \
		CDEF:bitsps=bytesps,8,* \
		LINE2:bitsps#0000FF
else
	rrdtool graph "$imgfile" \
		--title "$title" \
		--vertical-label "$label" \
		--start "$start" --end "$end" \
		DEF:items=test.rrd:item:AVERAGE \
		LINE2:items#0000FF
fi
