#!/bin/sh
system="$1"
filename="$2"
start="$3"
end="$4"
field="$5"
block_field="$6"

echo "SELECT UNIX_TIMESTAMP(creation) AS time, (data_$field*data_$block_field) AS data_$field FROM stat_fs WHERE system='$system' AND data_filename='$filename' AND UNIX_TIMESTAMP(creation) > '$start' AND UNIX_TIMESTAMP(creation) <= '$end' ORDER BY row_id;" \
	|mysql --batch --delimiter=: --skip-column-names sdc \
	|awk '{print $1 ":" $2}'
