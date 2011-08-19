#!/bin/sh
system="$1"
interface="$2"
start="$3"
end="$4"
field="$5"

echo "SELECT UNIX_TIMESTAMP(creation) AS time, data_$field FROM net_dev WHERE system='$system' AND data_interface='$interface' AND UNIX_TIMESTAMP(creation) > '$start' AND UNIX_TIMESTAMP(creation) <= '$end' ORDER BY row_id;" \
	|mysql --batch --delimiter=: --skip-column-names sdc \
	|awk '{print $1 ":" $2}'
