#!/bin/sh
set -e
./proc-test.sh meminfo
./proc-read.sh meminfo|tr '=:' '__'|awk '{print $1 $3 "=" $2}'|sed -re 's/_+=/=/'|./sdc-client.pl --service=memory
