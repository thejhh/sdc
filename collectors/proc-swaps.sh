#!/bin/sh
set -e
./proc-test.sh swaps
./proc-read.sh swaps|grep -v ^Filename|while read line; do
	echo "$line"|awk '{print "Filename=" $1 "\nType=" $2 "\nSize=" $3 "\nUsed=" $4 "\nPriority=" $5}'|./sdc-client.pl --service=swap
done
