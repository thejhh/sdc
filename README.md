SDC -- System Data Collector
============================

Historical Note
---------------

This is one of my old projects that still use OpenJS instead of Node.js.

Original SVN repository: https://svn.sendanor.fi/svn/jhh/sdc/trunk

Description
-----------

Copyright 2010 Jaakko-Heikki Heusala <jheusala@sendanor.fi>

$Id: README.txt 220 2010-03-28 11:47:44Z jheusala $

This program acts as a fastcgi daemon collecting all the data it receives to a 
database. Database schemantics are automatically constructed and changed based 
on the received data.

Licensed under the GPL.

COPYING                   -- GPLv2 License
server/                   -- Server-side FastCGI JavaScript daemon (using OpenJS <http://www.openjs.org/>)
server/.htaccess          -- Authentication settings for Apache 2 Basic Auth
collectors/sdc-client.pl  -- CLI client to submit data to the server
collectors/memory.sh      -- Script to submit data pairs from /proc/memory
collectors/uptime.sh      -- Script to submit data pairs from /proc/uptime
examples/sql.txt          -- SQL result examples
rrdtool/                  -- Dirty (ba)sh hacks to use the collected data
