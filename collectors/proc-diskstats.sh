#!/bin/sh
set -e
./proc-test.sh diskstats
./proc-read.sh diskstats|while read line; do
	echo "$line"|awk '{print "read_issued=" $1 "\nread_merged=" $2 "\nread_sectors=" $3 "\nread_ms=" $4 "\nwrite_completed=" $5 "\nwrite_merged=" $6 "\nwrite_sectors=" $7 "\nwrite_ms=" $8 "\nio_progress=" $9 "\nio_ms=" $10 "\nio_weighted_ms=" $11}' \
		|./sdc-client.pl --service=diskstats
done
