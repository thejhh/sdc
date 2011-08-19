#!/bin/sh
set -e
./proc-test.sh vmstat
./proc-read.sh vmstat|awk '{print $1 "=" $2}'|./sdc-client.pl --service=vmstat
