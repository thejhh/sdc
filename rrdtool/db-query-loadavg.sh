#!/bin/sh
system="$1"
start="$2"
end="$3"
field="$4"

echo "SELECT UNIX_TIMESTAMP(creation) AS time, data_$field FROM loadavg WHERE system='$system' AND UNIX_TIMESTAMP(creation) > '$start' AND UNIX_TIMESTAMP(creation) <= '$end' ORDER BY row_id;" \
	|mysql --batch --delimiter=: --skip-column-names sdc \
	|awk '{print $1 ":" $2}'
