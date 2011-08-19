/* SDC -- System Data Collector */

Extension.load("fastcgi");

/* Our error message. It's visible to the network. */
function MyError(msg, sample) {
	if(this instanceof arguments.callee) {
		this.msg = msg;
		this.sample = sample;
	} else {
		return new MyError(msg, sample);
	}
}

MyError.prototype.toString = function() { return this.msg; }

/* Our error message. It's not visible to the network. */
function HiddenError(msg, sample) {
	if(this instanceof arguments.callee) {
		this.msg = msg;
		this.sample = sample;
	} else {
		return new HiddenError(msg, sample);
	}
}

HiddenError.prototype.toString = function() { return this.msg; }

/* Data Sample */
function DataSample(arg) {
	if(this instanceof arguments.callee) {
		
		this.config = {};
		if(arg.config) {
			var config_keys = ["system", "service"];
			for(var c in config_keys) if(config_keys.hasOwnProperty(c)) {
				var key = String(config_keys[c]);
				if(this.config[key]) throw MyError("key exists already: "+key);
				if(arg.config[key]) { this.config[key] = String(arg.config[key]).trim(); }
			}
		}
		
		this.data = {};
		this.keys = [];
		if(arg.data) {
			for(var i in arg.data) if(arg.data.hasOwnProperty(i)) {
				var key = String(i).toLowerCase().trim();
				this.data[key] = String(arg.data[i]).trim();
				this.keys.push(key);
			}
		}
		
	} else {
		return new DataSample(arg);
	}
}

/* */
DataSample.prototype.toString = function() {
	var config_items = [];
	for(var i in this.config) if(this.config.hasOwnProperty(i)) {
		config_items.push("'" + i + "':'" + this.config[i] + "'");
	}
	
	var data_items = [];
	for(var i in this.data) if(this.data.hasOwnProperty(i)) {
		data_items.push("'" + i + "':'" + this.data[i] + "'");
	}
	
	return "{'config':{" + config_items.join(", ") +
	       "}, 'data':{" + data_items.join(", ") + "}}";
}

/* */
function SQLKeyFormat(key) {
	return String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/* */
function SQLTableFormat(key) {
	return String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/* Schema for database */
function DataSchema(arg) {
	if(this instanceof arguments.callee) {
		this.table = arg.table;
		this.keys = arg.keys || [];
		this.types = arg.types || {};
	} else {
		return new DataSchema(arg);
	}
}

/* Build schema from sample */
DataSchema.buildFromSample = function(sample) {
	if(! (sample instanceof DataSample) ) throw HiddenError("not DataSample");
	
	var table = SQLTableFormat(sample.config.service);
	
	var types = {};
	for(var k in sample.keys) if(sample.keys.hasOwnProperty(k)) {
		var key = sample.keys[k];
		var value = sample.data[key];
		var type = (value.length <= 255) ? 'VARCHAR(255)' : TEXT;
		types[key] = type;
	}
	
	return DataSchema({table:table,keys:sample.keys,types:types});
}

/* Build schema from argument */
DataSchema.build = function(arg) {
	if(arg instanceof DataSample) return DataSchema.buildFromSample(arg);
	throw HiddenError("Unknown type: "+String(arg));
}

/* Build CREATE TABLE query for SQL */
DataSchema.prototype.buildCreateTableQuery = function() {
	var undefined;
	var table = this.table;
	var fields = ["`row_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT",
	              "`creation` TIMESTAMP",
	              "`remote_addr` VARCHAR(255)",
	              "`remote_user` VARCHAR(255)",
	              "`system` VARCHAR(255)",
	              "`service` VARCHAR(255)"];
	for(var k in this.keys) if(this.keys.hasOwnProperty(k)) {
		var key = this.keys[k];
		var type = this.types[key];
		if(type === undefined) throw HiddenError("No type for key: "+key, this);
		fields.push("`data_" + SQLKeyFormat(key) + "` " + type);
	}
	fields.push("PRIMARY KEY(row_id)");
	return "CREATE TABLE `"+table+"` ("+ fields.join(", ") +") CHARACTER SET utf8";
}

/* Build CREATE TABLE query for SQL */
DataSchema.prototype.buildInsertQuery = function() {
	var undefined;
	var table = this.table;
	if(table === undefined) throw HiddenError("table undefined", this);
	var sqlkeys = ["creation", "remote_addr", "remote_user", "system", "service"];
	var fields = ["NOW()", ":x_remote_addr", ":x_remote_user", ":x_system", ":x_service"];
	for(var k in this.keys) if(this.keys.hasOwnProperty(k)) {
		var key = this.keys[k];
		var sqlkey = "data_" + SQLKeyFormat(key);
		sqlkeys.push(sqlkey);
		fields.push(":" + sqlkey);
	}
	return "INSERT INTO `"+table+"` ("+ sqlkeys.join(", ") +") VALUES (" + fields.join(", ") + ")";
}

/* Build ALTER TABLE query for SQL */
DataSchema.prototype.buildAlterTableAddColumnQuery = function(key) {
	var undefined;
	var table = this.table;
	var sqlkey = "data_" + SQLKeyFormat(key);
	var type = this.types[key];
	if(type === undefined) throw HiddenError("type undefined", this);
	return "ALTER TABLE `"+table+"` ADD COLUMN `"+sqlkey+"` " + type;
}

/* Global cache object */
var CACHE = {table:{}};

/* */
function get_database_table_missing_keys(schema) {
	init_database();
	var undefined;
	var missing = [];
	var fresh_cache = false;
	if(!CACHE.table[schema.table]) {
		CACHE.table[schema.table] = DATABASE.describe(schema.table);
		fresh_cache = true;
	}
	var desc = CACHE.table[schema.table];
	for(var k in schema.keys) if(schema.keys.hasOwnProperty(k)) {
		var key = schema.keys[k];
		var sqlkey = "data_" + SQLKeyFormat(key);
		if(desc[sqlkey] === undefined) { missing.push(key); }
	}
	if( (!fresh_cache) && (missing.length !== 0) ) {
		delete CACHE.table[schema.table];
		return get_database_table_missing_keys(schema);
	}
	return missing;
}

/* FastCGI runner */
FastCGI.runner(function(request) {
	try {
		var undefined;
		
		Extension.load("filesystem");
		Extension.load("string");
		//Extension.load("json2");
		
		// Shutdown after this request if there is changed files
		if(Filesystem.hasChangedFiles(["/usr/bin/js", "collector.js"])) {
			request.fastcgi.shutdown();
		}
		
		// Collect data from POST
		if(request.cgi.post) {
			var post = request.cgi.post;
			var sample = DataSample({config:post.config, data:post.data});
			
			if(sample.config.system === undefined) throw MyError("config.system unset", sample);
			if(sample.config.service === undefined) throw MyError("config.service unset", sample);
			if(sample.keys.length == 0) throw MyError("No data keys", sample);
			
			try {
				Extension.load("./database.js");
				init_database();
				
				var dbtables = {};
				var list_of_tables = DATABASE.getTables();
				for(var i in list_of_tables) if(list_of_tables.hasOwnProperty(i)) {
					var name = list_of_tables[i];
					dbtables[name] = true;
				}
				
				var schema = DataSchema.build(sample);
				
				var table = schema.table;
				
				// Create table if does not exist
				if(dbtables[table] === undefined) {
					var query = schema.buildCreateTableQuery();
					//system.stderr.writeln("DEBUG: query: " + query);
					DATABASE.internal.query(query);
					
					var query = "ALTER TABLE `"+ schema.table +"` AUTO_INCREMENT = 10001";
					//system.stderr.writeln("DEBUG: query: " + query);
					DATABASE.internal.query(query);
				}
				
				// Modify table if it has new keys
				var missing_keys = get_database_table_missing_keys(schema);
				if(missing_keys.length !== 0) {
					for(var m in missing_keys) if(missing_keys.hasOwnProperty(m)) {
						var key = missing_keys[m];
						var query = schema.buildAlterTableAddColumnQuery(key);
						//system.stderr.writeln("DEBUG: query: " + query);
						DATABASE.internal.query(query);
					}
				}
			
				// Insert sample to table
				var query = schema.buildInsertQuery();
				//system.stderr.writeln("DEBUG: query: " + query);
				var record = {};
				record["x_remote_addr"] = request.env.REMOTE_ADDR;
				record["x_remote_user"] = request.env.REMOTE_USER;
				record["x_system"] = sample.config.system;
				record["x_service"] = sample.config.service;
				for(var d in sample.data) if(sample.data.hasOwnProperty(d)) {
					var sqlkey = "data_" + SQLKeyFormat(d);
					record[sqlkey] = sample.data[d];
				}
				DATABASE.internal.queryObject(query, record);
			} catch (e) {
				if(typeof e === 'object' && (!e.sample)) {
					e.sample = sample;
					throw e;
				} else if(typeof e === 'object' && e.sample) {
					throw e;
				} else {
					var ee = HiddenError("Capsulated exception", sample);
					ee.original_exception = e;
					throw ee;
				}
			}
			request.stdout.writeln("Content-Type: text/plain\n\n0 OK");
			return;
		}
		
		// Output unknown error
		throw MyError("Unknown action");
		
	} catch(e) {
		var msg = String(e);
		system.stderr.writeln("Collector: Exception: " + msg);
		
		if(typeof e === 'object') {
			for(var i in e) if(e.hasOwnProperty(i)) {
				system.stderr.writeln("* " + String(i) + ": " + String(e[i]));
			}
		}
		
		if(e instanceof MyError) {
			request.stdout.writeln("Content-Type: text/plain\n\n1 EXCEPTION :" + msg);
		} else {
			request.stdout.writeln("Content-Type: text/plain\n\n1 EXCEPTION :See error logs.");
		}
		return;
	}
	
}); // FastCGI.runner

/* EOF */
