#!/bin/sh -x

# Build systems
date="$1"
if test x = x"$date"; then
	date="$(date "+%Y-%m-%d")"
fi
start="$(date -d "$(date "+$date 00:00:00")" +%s)"
end="$(date -d "$(date "+$date 23:59:59")" +%s)"
prefix="public/images/$(date -d "$(date "+$date 12:00:00")" "+%Y%m%d")-memory-"

# Build memory items for system interface
function build () {
	system="$1"
	start="$2"
	end="$3"
	prefix="$4"
	
	./build-memory.sh "$system" memtotal_kb "$start" "$end" "$prefix" "kb" "kB"
	./build-memory.sh "$system" memfree_kb "$start" "$end" "$prefix" "kb" "kB"
	./build-memory.sh "$system" buffers_kb "$start" "$end" "$prefix" "kb" "kB"
	./build-memory.sh "$system" cached_kb "$start" "$end" "$prefix" "kb" "kB"
	
}

build hiomo-gw1 "$start" "$end" "$prefix"
build kiila-gw1 "$start" "$end" "$prefix"
build atlas     "$start" "$end" "$prefix"
build vm2       "$start" "$end" "$prefix"
build vm3       "$start" "$end" "$prefix"
build vm4       "$start" "$end" "$prefix"
build vm6       "$start" "$end" "$prefix"
build s102      "$start" "$end" "$prefix"
build s103      "$start" "$end" "$prefix"
build titan     "$start" "$end" "$prefix"
build cloak     "$start" "$end" "$prefix"
build fs2       "$start" "$end" "$prefix"
build secure    "$start" "$end" "$prefix"
build fizban    "$start" "$end" "$prefix"
build h66       "$start" "$end" "$prefix"

# EOF
