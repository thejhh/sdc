#!/bin/sh
set -e
./proc-test.sh loadavg
./proc-read.sh loadavg|tr / ' '|awk '{print "load_one=" $1 "\nload_five=" $2 "\nload_ten=" $3 "\nprocesses=" $4 "\ntotal_processes=" $5 "\nlast_pid=" $6}'\
 |./sdc-client.pl --service=loadavg
