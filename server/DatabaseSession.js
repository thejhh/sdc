/** JavaScript Database Library
 * Copyright 2009 Jaakko-Heikki Heusala <jheusala@iki.fi>
 */

Extension.load("sql");

/** Database constructor */
function DatabaseSession(arg) {
	var soci_config     = arg.type + "://db=" + arg.database + " user=" + arg.username + " password=" + arg.password;
	var table_prefix    = arg.table_prefix || "";
	var tables          = arg.tables || [];
	
	// Internal SQL server connection object. We could make this private but it might be better to let it as an optional feature. After all it's easy to grep 'internal' if it needs changing.
	this.internal = new sql.connect(soci_config);
	
	// Table prefix
	this.table_prefix = table_prefix;
	
	// Setup generic this.tables interface
	this.initTables(tables);
}

/** Get MySQL last insert id */
DatabaseSession.prototype.lastInsertId = function() {
	var rows = this.internal.query("SELECT LAST_INSERT_ID()");
	return String(rows[0]);
}

/** Build option list for where clause */
function buildOptionList(table, where) {
	var where_a = [];
	var record  = {};
	//system.stderr.writeln( "DEBUG: typeof(where)='"+typeof(where)+"'" );
	if( (typeof(where) === 'string') || (typeof(where) === 'number') ) {
		var key = table+"_id";
		where_a.push("`"+key+"`=:"+table+"_id");
		//system.stderr.writeln( "DEBUG: record["+key+"]='"+where+"'" );
		record[key] = where;
	} else {
		record = {};
		for(var k in where) if(where.hasOwnProperty(k)) {
			var q_k;
			if(String(k).match(/\./)) {
				q_k = String(k).replace(/\./, "_");
				where_a.push(k+"=:"+q_k);
			} else {
				q_k = String(k);
				where_a.push("`"+k+"`=:"+k);
			}
			record[q_k] = where[k];
		}
	}
	return {where:where_a, record:record};
}

/** Get record by ID */
DatabaseSession.prototype.getRecord = function(table, record_id) {
	//system.stderr.writeln( "DEBUG: DatabaseSession.getRecord('"+table+"', "+record_id+")" );
	var options = buildOptionList(table, record_id);
	var query = "SELECT * FROM `"+this.table_prefix+table+"` WHERE " + options.where.join(' AND ');
	system.stderr.writeln( "DEBUG: query='"+query+"'" );
	var result = this.internal.queryObject(query, options.record);
	//system.stderr.writeln( "DEBUG: typeof(result[0])='"+typeof(result[0])+"'" );
	//system.stderr.writeln( "DEBUG: result[0]='"+result[0]+"'" );
	return result[0];
}

/** Get record by ID */
DatabaseSession.prototype.getRecordList = function(table, where, fields) {
	var undefined;
	var query = "SELECT ";
	
	if(fields !== undefined) {
		query += fields.join(', ');
	} else {
		query += '*';
	}
	
	query += " FROM `"+this.table_prefix+table+"`";
	//system.stderr.writeln( "DEBUG: DatabaseSession.getRecordList('"+table+"', "+where+")" );
	var result;
	if(where !== undefined) {
		var options = buildOptionList(table, where);
		query += " WHERE " + options.where.join(' AND ');
		system.stderr.writeln( "DEBUG: query='"+query+"'" );
		result = this.internal.queryObject(query, options.record);
	} else {
		system.stderr.writeln( "DEBUG: query='"+query+"'" );
		result = this.internal.query(query);
	}
	//system.stderr.writeln( "DEBUG: typeof(result)='"+typeof(result)+"'" );
	//system.stderr.writeln( "DEBUG: result='"+result+"'" );
	return result;
}

/** Delete record by ID */
DatabaseSession.prototype.deleteRecord = function(table, record_id) {
	system.stderr.writeln( "DB: " + table + ": Removing row ID# " + record_id );
	var result = this.internal.query(
		  "DELETE FROM `"+this.table_prefix+table+"` WHERE "+table+"_id=:record_id"
		, record_id
		);
	return true;
}

/** Set record by id from table */
DatabaseSession.prototype.setRecord = function(table, id, record) {
	var undefined;
	system.stderr.writeln("setRecord(table='" + table + "', id='" + id + "', record='" + record + "')");
	
	primary_key = table + "_id";
	
	var sets = [];
	for(var i in record) if (record.hasOwnProperty(i)) {
		if(record[i]===undefined) {
			system.stderr.writeln("setRecord: Error: record['"+i+"'] is undefined!");
			return;
		}
		sets.push("r." + i + "=:" + i);
		system.stderr.writeln("setRecord: Setting r."+i+"='" + record[i] + "'");
	}
	
	if(sets.length == 0) {
		system.stderr.writeln("setRecord: Warning! Nothing to set, nothing changed.");
		return;
	}
	
	if(id===undefined) {
		system.stderr.writeln("setRecord: Error: id is undefined!");
		return;
	}
	record[primary_key] = id;
	sets.push("r.updated=NOW()");
	
	var query = "UPDATE `"+ this.table_prefix + table +"` AS r"
	    + " SET " + sets.join(", ")
	    + " WHERE r."+primary_key+"=:"+primary_key
	    + " LIMIT 1";
	
	//system.stderr.writeln("DEBUG: query: " + query);
	
	this.internal.queryObject(query, record);
}

/** Add new record to table */
DatabaseSession.prototype.addRecord = function(table, record) {
	system.stderr.writeln("addRecord(table='" + table + "', record='" + record + "')");
	var keys = new Array();
	var values = new Array();
	
	keys.push("updated");
	values.push("NOW()");
	
	keys.push("creation");
	values.push("NOW()");
	
	for(var k in record) if (record.hasOwnProperty(k)) {
		//system.stderr.writeln("DEBUG: record[" + k + "] = '" + record[k] + "'");
		keys.push(k);
		values.push(":" + k);
	}
	
	if(keys.length == 0) {
		system.stderr.writeln("Warning! Nothing to add, nothing changed.");
		return 0;
	}
	
	var query = "INSERT INTO `"+ this.table_prefix + table +"`"
		+ " (" + keys.join(", ") + ")"
		+ " VALUES (" + values.join(", ") + ")";
	
	//system.stderr.writeln("DEBUG: query='" + query + "'");
	
	this.internal.queryObject(query, record);
	
	var id = this.lastInsertId();
	system.stderr.writeln("DB Added ID# " + id + " to table " + this.table_prefix + table);
	return id;
}

/** Setup generic operations for table(s) */
DatabaseSession.prototype.initGenericTable = function(table) {
	var that = this;
	if(!that.tables[table]) {
		//system.stderr.writeln("DEBUG: DatabaseSession.prototype.initGenericTable('" + table + "')");
		that.tables[table] = {};
		that.tables[table].get    = function(arg) { return that.getRecord(table, arg); };
		that.tables[table].set    = function(id, arg) { return that.setRecord(table, id, arg); };
		that.tables[table].add    = function(arg) { return that.addRecord(table, arg); };
		that.tables[table].list   = function(arg, fields) { return that.getRecordList(table, arg, fields); };
		that.tables[table].remove = function(arg) { return that.deleteRecord(table, arg); };
	}
}

/** Setup generic operations for table(s) */
DatabaseSession.prototype.initTables = function(list) {
	//system.stderr.writeln("DEBUG: DatabaseSession.prototype.initTables()");
	var undefined;	
	var that = this;
	if(that.tables === undefined) { that.tables = {}; }
	
	for(var i=0; i<list.length; i++) {
		//system.stderr.writeln("DEBUG: list[i]='" + list[i] + "')");
		that.initGenericTable(list[i]);
	}
	
	// Setup exceptions
	
}

/** Setup generic operations for link table(s) */
DatabaseSession.prototype.initLinkTable = function(link_table, table_a, table_b) {
	var undefined;
	var that = this;
	if(that.links === undefined) that.links = {};
	if( (that.links[link_table] === undefined) ) {
		if(that.links[link_table] === undefined) that.links[link_table] = {};
		that.links[link_table].exists = function(id_a, id_b) { return that.linkExists(link_table, table_a, id_a, table_b, id_b); };
		that.links[link_table].set    = function(id_a, id_b) { return that.linkSet(link_table, table_a, id_a, table_b, id_b); };
		that.links[link_table].remove = function(id_a, id_b) { return that.linkRemove(link_table, table_a, id_a, table_b, id_b); };
	}
}

/** Check if link exists between two IDs */
DatabaseSession.prototype.linkExists = function(link_table, table_a, id_a, table_b, id_b) {
	var key_a = table_a + "_id";
	var key_b = table_b + "_id";
	var options = {};
	options.where = ["`"+key_a+"`=:"+key_a, "`"+key_b+"`=:"+key_b];
	options.record = {};
	options.record[key_a] = id_a;
	options.record[key_b] = id_b;
	var query = "SELECT COUNT(*) AS count FROM `"+this.table_prefix+link_table+"` WHERE " + options.where.join(' AND ');
	system.stderr.writeln( "DEBUG: query='"+query+"'" );
	var result = this.internal.queryObject(query, options.record);
	if(!result) return;
	if(!result[0]) return;
	if(!result[0].count) return;
	return result[0].count > 0;
}

/** Add new record to table */
DatabaseSession.prototype.linkSet = function(link_table, table_a, id_a, table_b, id_b) {
	//system.stderr.writeln("linkSet(table='" + table + "', record='" + record + "')");
	var key_a = table_a + "_id";
	var key_b = table_b + "_id";
	
	var record = {};
	record[key_a] = id_a;
	record[key_b] = id_b;
	var keys = [key_a, key_b];
	var values = [id_a, id_b];
	
	var query = "INSERT INTO `"+ this.table_prefix + link_table +"`"
		+ " (" + keys.join(", ") + ")"
		+ " VALUES (" + values.join(", ") + ")";
	
	system.stderr.writeln( "DEBUG: query='"+query+"'" );
	this.internal.queryObject(query, record);
	
	var id = this.lastInsertId();
	system.stderr.writeln("Added DB link: "+table_a+"# " + id_a + " to " + table_b + "#" + id_b + " (" + this.table_prefix + link_table + ")");
	return id;
}

/** Delete record by ID */
DatabaseSession.prototype.linkRemove = function(link_table, table_a, id_a, table_b, id_b) {
	system.stderr.writeln( "DB: " + link_table + ": Removing link row: a# " + id_a + ", b# " + id_b  );
	var query = "DELETE FROM `"+this.table_prefix+link_table+"`"+
	            " WHERE "+table_a+"_id=:a_id"+
	            " AND "+table_b+"_id=:b_id"+
	            " LIMIT 1";
	system.stderr.writeln( "DEBUG: query='"+query+"'" );
	var result = this.internal.query(query, id_a, id_b);
	return true;
}

/* Get tables from database */
DatabaseSession.prototype.getTables = function() {
	var query = "SHOW TABLES";
	var rows = this.internal.query(query);
	var tables = [];
	for(var r in rows) if(rows.hasOwnProperty(r)) {
		var name = rows[r][0];
		tables.push(name);
	}
	return tables;
}

/* Get description of table */
DatabaseSession.prototype.describe = function(table) {
	var query = "DESCRIBE `" + table + "`";
	var rows = this.internal.query(query);
	var desc = {};
	for(var r in rows) if(rows.hasOwnProperty(r)) {
		var row = rows[r];
		var name = String(row.Field);
		desc[name] = {'field':name,
		              'type':String(row.Type),
		              'null':String(row.Null),
		              'key':String(row.Key),
		              'default':String(row.Default),
		              'extra':String(row.Extra) };
	}
	return desc;
}

/* EOF */
