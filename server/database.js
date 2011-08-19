/* Initial settings */

/** Init database */
function init_database() {
	if(!DATABASE) {
		Extension.load("./config.js");
		Extension.load("./DatabaseSession.js");
		DATABASE = new DatabaseSession(CONFIG.database);
	}
}

/* Global database object */
var DATABASE;

/* EOF */
