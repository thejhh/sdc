#!/bin/sh
set -e
./proc-test.sh mounts
./proc-read.sh mounts|grep '^/dev/'|awk '{print $2}'|while read line; do
	stat --printf='free_blocks=%a\ntotal_data_blocks=%b\ntotal_file_nodes=%c\nfree_file_nodes=%d\nfree_blocks=%f\nfs_id=%i\nmax_file_length=%l\nfilename=%n\nblock_size=%s\nfun_block_size=%S\ntype_id=%t\ntype=%T\n' -f "$line" \
		|./sdc-client.pl --service=stat_fs
done
