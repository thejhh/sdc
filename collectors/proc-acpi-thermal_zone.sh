#!/bin/sh
set -e
test -e /proc/acpi/thermal_zone

cd "$(dirname $0)"
dir="$(pwd)"

cd /proc/acpi/thermal_zone
for dev in $(ls); do
	cat "/proc/acpi/thermal_zone/$dev/"{state,temperature,trip_points}|tr : = \
		|"$dir"/sdc-client.pl --service=acpi_thermal_zone device="$dev"
done
