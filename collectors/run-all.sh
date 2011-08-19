#!/bin/sh

# Move to directory of the script
cd "$(dirname $0)"
dir="$(pwd)"

# Stop if there is sdc-clients running
if ps -o comm|grep -qFx sdc-client.pl; then
	echo 'sdc-client.pl running already' >&2
	exit 1
fi

# Update scripts
svn -q --version|grep -q ^1\.5 && svn --depth=files -q up || svn -N -q up

## Update crontab
#crontab crontab.txt

# Run scripts in background

#./proc-uptime.sh
#./proc-loadavg.sh
#./proc-memory.sh
#./proc-acpi-thermal_zone.sh
#./proc-acpi-battery.sh
#./proc-vmstat.sh
#./proc-net-dev.sh
#./proc-swaps.sh
#./proc-diskstats.sh
#./stat.sh
#./hddtemp.sh

## Wait until there's no sdc clients running
#while ps -o comm|grep -qFx sdc-client.pl; do sleep 1; done

# EOF
