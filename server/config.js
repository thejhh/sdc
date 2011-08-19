/* CCD Config */

/*  */
function get_config(file) {
	Extension.load("filesystem");
	Extension.load("json2");
	return JSON.parse(Filesystem.readfile(file)).config;
}

/* Global CCD config object */
var CONFIG = get_config("config.json");

/* EOF */
