<html>
<head>
 <title>network - stats</title>
</head>
<body>
<h1>Network stats</h1>

<?php

$date = isset($_GET['d']) ? (int)$_GET['d'] : strftime("%Y%m%d");

$systems = array( "hiomo-gw1"=>"eth0"
                , "atlas"=>"eth0", "titan"=>"eth0"
                , "vm2"=>"vlan11", "vm3"=>"vlan11", "vm4"=>"vlan11", "vm6"=>"vlan11"
				, "fs2"=>"bond0"
				, "s102"=>"eth0", "s103"=>"eth0"
                , "secure"=>"eth0", "cloak"=>"eth0", "fizban"=>"eth0"
                , "h66"=>"eth0"
                , "kiila-gw1"=>"eth0"
                );

foreach($systems as $system=>$interface) {	
	?>
	<a name="<?=htmlspecialchars($system)?>"></a>
	<h2><?=htmlspecialchars($system)?></h2>
	
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-tr_bytes.png" />
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-re_bytes.png" />
	
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-tr_packets.png" />
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-re_packets.png" />
	
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-tr_errs.png" />
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-re_errs.png" />

	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-tr_drop.png" />
	<img src="images/<?=htmlspecialchars($date)?>-net-<?=htmlspecialchars($system)?>-<?=htmlspecialchars($interface)?>-re_drop.png" />

	<?php
}
?>


<hr />
<p>Data collected using <a href="https://svn.sendanor.fi/svn/jhh/sdc/trunk">SDC</a> and analysed by <a href="http://oss.oetiker.ch/rrdtool/">RRDtool</a>.</p>

</body>
</html>
