<html>
<head>
 <title>stat_fs stats</title>
</head>
<body>
<h1>stat_fs stats</h1>

<?php

$date = isset($_GET['d']) ? (int)$_GET['d'] : strftime("%Y%m%d");

$systems = array( "atlas"=>"/", "titan"=>"/", "hiomo-gw1"=>"/", "kiila-gw1"=>"/"
                , "vm2"=>"/", "vm3"=>array("/", "/var", "/usr", "/home"), "vm4"=>"/", "vm6"=>"/"
                , "secure"=>"/", "cloak"=>"/", "s102"=>array("/", "/home"), "s103"=>"/"
				, "fs2"=>"/", "fizban"=>"/", "h66"=>"/");

foreach($systems as $system=>$arg) {	
	$filenames = is_array($arg) ? $arg : array($arg);
	
	?>
	<a name="<?=htmlspecialchars($system)?>"></a>
	<h2><?=htmlspecialchars($system)?></h2>
	<?php
	
	foreach($filenames as $filename) {
		$mangled_filename = preg_replace("/[^a-zA-Z0-9]/", "_", $filename);
		?>
		<h3>Filesystem <?=htmlspecialchars($filename)?></h3>
		<img src="images/<?=htmlspecialchars($date)?>-stat_fs-<?=htmlspecialchars($system."-".$mangled_filename)?>-free_blocks.png" />
		<?php
	}
}
?>


<hr />
<p>Data collected using <a href="https://svn.sendanor.fi/svn/jhh/sdc/trunk">SDC</a> and analysed by <a href="http://oss.oetiker.ch/rrdtool/">RRDtool</a>.</p>

</body>
</html>
