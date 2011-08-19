#!/bin/sh -x

# Build systems
date="$1"
if test x = x"$date"; then
	date="$(date "+%Y-%m-%d")"
fi
start="$(date -d "$(date "+$date 00:00:00")" +%s)"
end="$(date -d "$(date "+$date 23:59:59")" +%s)"
prefix="public/images/$(date -d "$(date "+$date 12:00:00")" "+%Y%m%d")-net-"

# Build net_dev items for system interface
function build () {
	system="$1"
	interface="$2"
	start="$3"
	end="$4"
	prefix="$5"
	
	./build-net_dev.sh "$system" tr_bytes "$start" "$end" "$prefix" "$interface" "bits" "bits"
	./build-net_dev.sh "$system" re_bytes "$start" "$end" "$prefix" "$interface" "bits" "bits"
	
	./build-net_dev.sh "$system" tr_packets "$start" "$end" "$prefix" "$interface" "packets"
	./build-net_dev.sh "$system" re_packets "$start" "$end" "$prefix" "$interface" "packets"
	
	./build-net_dev.sh "$system" tr_errs "$start" "$end" "$prefix" "$interface" "errors"
	./build-net_dev.sh "$system" re_errs "$start" "$end" "$prefix" "$interface" "errors"
	
	./build-net_dev.sh "$system" tr_drop "$start" "$end" "$prefix" "$interface" "drops"
	./build-net_dev.sh "$system" re_drop "$start" "$end" "$prefix" "$interface" "drops"
}

#date=20100330
#start=1269957600
#end=1269961200
#prefix=public/images/$(date -d "$(date "+$date 12:00:00")" "+%Y%m%d")-1700-1800-net-
#build vm4 vlan11 "$start" "$end" "$prefix"
#exit 0

build hiomo-gw1 eth0 "$start" "$end" "$prefix"
build kiila-gw1 eth0 "$start" "$end" "$prefix"
build vm2 vlan11 "$start" "$end" "$prefix"
build vm3 vlan11 "$start" "$end" "$prefix"
build vm4 vlan11 "$start" "$end" "$prefix"
build vm6 vlan11 "$start" "$end" "$prefix"
build fs2 bond0 "$start" "$end" "$prefix"
build s102 eth0 "$start" "$end" "$prefix"
build s103 eth0 "$start" "$end" "$prefix"
build atlas eth0 "$start" "$end" "$prefix"
build titan eth0 "$start" "$end" "$prefix"
build secure eth0 "$start" "$end" "$prefix"
build cloak eth0 "$start" "$end" "$prefix"
build fizban eth0 "$start" "$end" "$prefix"
build h66 eth0 "$start" "$end" "$prefix"

# EOF
