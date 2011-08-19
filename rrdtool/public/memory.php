<html>
<head>
 <title>memory stats</title>
</head>
<body>
<h1>Memory stats</h1>

<?php

$date = isset($_GET['d']) ? (int)$_GET['d'] : strftime("%Y%m%d");

$systems = array( "atlas", "titan", "hiomo-gw1", "kiila-gw1", "vm2", "vm3", "vm4", "vm6"
                , "secure", "cloak", "s102", "s103", "fs2", "fizban", "h66");

foreach($systems as $system) {	
	?>
	<a name="<?=htmlspecialchars($system)?>"></a>
	<h2><?=htmlspecialchars($system)?></h2>
	<img src="images/<?=htmlspecialchars($date)?>-memory-<?=htmlspecialchars($system)?>-memtotal_kb.png" />
	<img src="images/<?=htmlspecialchars($date)?>-memory-<?=htmlspecialchars($system)?>-memfree_kb.png" />
	<img src="images/<?=htmlspecialchars($date)?>-memory-<?=htmlspecialchars($system)?>-buffers_kb.png" />
	<img src="images/<?=htmlspecialchars($date)?>-memory-<?=htmlspecialchars($system)?>-cached_kb.png" />
	<?php
}
?>


<hr />
<p>Data collected using <a href="https://svn.sendanor.fi/svn/jhh/sdc/trunk">SDC</a> and analysed by <a href="http://oss.oetiker.ch/rrdtool/">RRDtool</a>.</p>

</body>
</html>
