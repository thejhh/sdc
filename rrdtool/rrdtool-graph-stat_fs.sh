#!/bin/sh
title="$1"
label="$2"
start="$3"
end="$4"
imgfile="$5"
unit="$6"

if test x"$unit" = xkB; then
	rrdtool graph "$imgfile" \
		--title "$title" \
		--vertical-label "$label" \
		--start "$start" --end "$end" \
		--base 1024 \
		DEF:myitems=test.rrd:item:AVERAGE \
		CDEF:b_items=myitems,1024,* \
		LINE2:b_items#0000FF
else
	rrdtool graph "$imgfile" \
		--title "$title" \
		--vertical-label "$label" \
		--start "$start" --end "$end" \
		--base 1024 \
		DEF:myitems=test.rrd:item:AVERAGE \
		LINE2:myitems#0000FF
fi
