#!/bin/sh
set -e
test -e /usr/sbin/hddtemp

devices="$(netcat localhost 7634|sed -re 's/\|\|/|\n|/g'|awk -F'|' '{print $2}')"

for dev in $devices; do
	netcat localhost 7634|sed -re 's/\|\|/|\n|/g'|grep -E '^\|'"$dev"'\|' \
		|awk -F'|' '{print "device=" $2 "\nmodel=" $3 "\ntemp=" $4 "\ntype=" $5}' \
		|./sdc-client.pl --service=hddtemp
done
