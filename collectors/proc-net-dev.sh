#!/bin/sh
set -e
./proc-test.sh net/dev
./proc-read.sh net/dev|grep -vE '^(Inter| face)'|while read line; do
	echo "$line"|tr : ' '|awk '{print "interface=" $1 "\nre_bytes=" $2 "\nre_packets=" $3 "\nre_errs=" $4 "\nre_drop=" $5 "\nre_fifo=" $6 "\nre_frame=" $7 "\nre_compressed=" $8 "\nre_multicast=" $9 "\ntr_bytes=" $10 "\ntr_packets=" $11 "\ntr_errs=" $12 "\ntr_drop=" $13 "\ntr_fifo=" $14 "\ntr_colls=" $15 "\ntr_carrier=" $16 "\ntr_compressed=" $17}'\
		|./sdc-client.pl --service=net_dev
done
