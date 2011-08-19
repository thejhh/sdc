#!/bin/sh
set -e
test -e /proc/acpi/battery

cd "$(dirname $0)"
dir="$(pwd)"

cd /proc/acpi/battery
for dev in $(ls); do
	cat "/proc/acpi/battery/$dev/"{info,state}|tr : = \
		|"$dir"/sdc-client.pl --service=acpi_battery device="$dev"
done
