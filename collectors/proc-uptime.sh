#!/bin/sh
set -e
./proc-test.sh uptime
./proc-read.sh uptime|awk '{print "up_secs=" $1 "\nidle_secs=" $2}'|./sdc-client.pl --service=uptime
