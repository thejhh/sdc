#!/usr/bin/perl
# Copyright 2010 Jaakko-Heikki Heusala <jheusala@iki.fi>
# $Id: sdc-client.pl 223 2010-03-28 15:45:24Z jheusala $

use utf8;
use strict;
use warnings;
use Encode qw(encode decode);
use diagnostics;
#use JSON;

binmode STDIN, ":utf8";
binmode STDOUT, ":utf8";
binmode STDERR, ":utf8";

# Escape shell arguments
sub shell_escape {
	my $buf = join(' ', @_);
	$buf =~ s/([;<>\*\|`&\$!#\(\)\[\]\{\}:'" ])/\\$1/g;
	return $buf;
}

# Urlencode string
sub urlencode {
	my $str = shift;
	$str =~ s/([^A-Za-z0-9])/sprintf("%%%02X", ord($1))/seg;
	return $str;
}

# Main Block
eval {
	
	# Load configurations
	{
		package Config;
		our $server = "";
		our $system = "";
		our $service = "";
		our $username = "";
		our $password = "";
		our $HOME = $ENV{"HOME"};
		if ($HOME =~ /^(.*)$/) { $HOME = $1; } # Clean up tainted $HOME
		
		our $FILE;
		if(-e "/etc/default/sdc-client.conf") {
			$FILE = "/etc/default/sdc-client.conf";
		} elsif(-e "$HOME/.sdc-client.conf") {
			$FILE = "$HOME/.sdc-client.conf";
		} else {
			die "No configuration files found.";
		}
		
		#print STDERR "DEBUG: Loading $FILE\n";
		do "$FILE" or die "Could not open: $FILE: $!"
	}
	
	# Execute curl
	my @args = ();
	
	#print STDERR "DEBUG: username: " . $Config::username . "\n";
	#print STDERR "DEBUG: password: " . $Config::password . "\n";
	
	my $tmpfile = "/dev/null";
	
	push(@args, "curl", "-s", "-o", $tmpfile);
	
	if(-e $Config::HOME."/.netrc") {
		push(@args, "--netrc" );
	} else {
		push(@args, "-u" , $Config::username . ":" . $Config::password );
	}
	
	# Parse stdin
	if(!-t STDIN) {
		foreach my $row (<STDIN>) {
			chomp($row);
			#print STDERR "DEBUG: '$row'\n";
			if($row =~ /=/) {
				my($name, $value) = split("=", $row, 2);
				#print STDERR "DEBUG: '$name'='$value'\n";
				push(@args, "-d" , urlencode("data.".$name)."=".urlencode($value));
			}
		}
	}
	
	# Parse arguments
	foreach my $argnum (0 .. $#ARGV) {
		my $arg = $ARGV[$argnum];
		
		if($arg =~ "^\-\-") {
			my($name, $value) = split("=", $arg, 2);
			$name =~ s/^\-\-//;
			if($name eq "server") { $Config::server = $value; }
			elsif($name eq "system") { $Config::system = $value; }
			elsif($name eq "service") { $Config::service = $value; }
			else { die "unknown argument: $arg"; }
		} elsif($arg =~ "=") {
			my($name, $value) = split("=", $arg, 2);
			push(@args, "-d" , urlencode("data.".$name)."=".urlencode($value));
		} else {
			die "Unknown argument: " . $arg;
		}
	}
	
	push(@args, "-d" , urlencode("config.system")."=".urlencode($Config::system));
	push(@args, "-d" , urlencode("config.service")."=".urlencode($Config::service));
	
	push(@args, $Config::server);
	
	#print STDERR "DEBUG: " . join(' ', @args) . "\n";
	
	system(@args) == 0
	 or die "system @args failed: $?";
	
} or do {
	print STDERR "sdc-client.pl: error: $@";
	exit 1
};
# EOF
