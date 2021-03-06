/* jshint -W097, -W083, esnext: true*/
/* global module, require, console, process, setInterval */ "use strict";

var cronbit = require("../lib/cronbit"), data, errors = [];

// ----------------------------------------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------------------------------------

data = [

	// ["condition", "now-time", "type:(minute, hour, dom, month, dow)"]

	// valid
	[
		// range only
		["0-59/10",	20, 0],
		["0-59/5",	25, 0],
		["0-59/5",	55, 0],
		["0-59/2",	22, 0],
		["0-59",	47, 0],

		["12-16/2", 12, 1],
		["12-16/2", 14, 1],
		["12-16/2", 16, 1],
		["0-59/5",   0, 0],
		["0-59/3",   3, 0],
		["0-59/3",   0, 0],
		["0-59/15", 45, 0],
		["0-59/25", 50, 0],
		["0-59/21", 42, 0],
		["0-59/30",  0, 0],
		["0-59/30", 30, 0],
		["0-59/15", 45, 0],
		["0-23/2",  12, 0],
		["0-23/2",   0, 1],
		["0-23",    23, 0],
		

		// list only
		["1,2,3,4,5,6,7,8,9",		 8, 0],
		["7,8,9,10,11,12,13",		 8, 0],
		["13,14,15,16,20,23,21",	23, 0],
		["47,55,12,34,9,3,2,1,5",	55, 0],
		["47,55,12,34,9,3,2,1,5",	12, 0],
		["47,55,12,34,9,3,2,1,5",	34, 0],
		["47,55,12,34,9,3,2,1,5",	 3, 0],
		["47,55,12,34,9,3,2,1,5",	 5, 0],
		["47,55,12,34,9,3,2,1,5",	 1, 0],
		["47,55,12,34,9,3,2,1,5",	47, 0],
		["1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23", 23, 1],

		// // range + list
		["1,2,3,4,5,6,7,25-29",		 4, 0],
		["1,2,3,4,5,6,7,25-29",		25, 0],
		["1,2,3,4,5,6,7,25-29",		29, 0],
		["34,37,45,47,48,55,0-22",	22, 0],
		["34,37,45,47,48,55,0-22",	 0, 0],
		["34,37,45,47,48,55,0-22",	11, 0],
		["34,37,45,47,48,55,0-22",	34, 0],
		["34,37,45,47,48,55,0-22",	48, 0],
		["34,37,45,47,48,55,1-22",	22, 0],
		["34,37,45,47,48,55,1-22",	 1, 0],
		["1-22,45,46,47,48,49,59",	 1, 0],
		["1-22,45,46,47,48,49,59",	22, 0],
		["1-22,45,46,47,48,49,59",	59, 0],
		["1-22,45,46,47,48,49,59",	46, 0],
		["26,27,28,29,1-22,45,46",	26, 0],
		["26,27,28,29,1-22,45,46",	 1, 0],
		["26,27,28,29,1-22,45,46",	22, 0],
		["26,27,28,29,1-22,45,46",	45, 0]
	],

	// invalid
	[
		// range only
		["0-59/10",	22, 0],
		["0-59/5",	22, 0],
		["0-59/5",	59, 0],
		["0-59/2",	43, 0],
		["0-55",	56, 0],
		["23-55",	22, 0],
		["0-59/20",  8, 0],
		["0-59/3",   7, 0],
		["0-59/7",   0, 0],
		["0-59/15", 48, 0],
		["0-59/25", 48, 0],

		["12-16/2", 13, 1],
		["12-16/2", 15, 1],
		["12-16/2", 17, 1],
		["12-16/2", 18, 1],

		// list only
		["1,2,3,4,5,6,7,8",  59, 0],
		["1,2,3,4,5,6,7,8",   9, 0],
		["59,58,57,56,55", 	  9, 0],
		["59,58,57,56,55", 	 54, 0],
		["59,58,57,56,55", 	 29, 0],
		["59,58,57,56,55", 	 31, 0],
		["59,58,57,56,55", 	 33, 0],

		// range + list
		["1,2,3,4,5,55-59",	 45, 0],
		["1,2,3,4,5,55-59",	  0, 0],
		["1,2,3,4,5,55-59",   6, 0],
		["1,2,3,4,5,55-59",  28, 0],
		["1,2,3,4,5,55-59",  29, 0],
		["1,2,3,4,5,55-59",  30, 0],
		["1,2,3,4,5,55-59",  31, 0],
		["1,2,3,4,5,55-59",  32, 0],
		["1-15,55,32,34,58", 59, 0],
		["1-15,55,32,34,58",  0, 0],
		["1-15,55,32,34,58", 33, 0],
		["1-15,55,32,34,58", 35, 0],

		// found errors
		["0-59/20", 30, 0],
		["0-59/7",  30, 0],
		["0-59/7",  31, 0],
		["0-59/25",  0, 0],
		["0-59/15", 50, 0],
	]
];

var range = cronbit.main.setRange,
	list  = cronbit.main.setList,
	bitma = cronbit.helpers.bitMatch;

// ----------------------------------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------------------------------

log("--- Checking Valid CRON Jobs ---\n");
for (let i = 0, len = data[0].length; i < len; i++) {
	let temp = cronbit.parse.cronArray(data[0][i][0], data[0][i][2]),
		time = data[0][i][1],
		type = data[0][i][2];

	if (temp.errors.length > 0) {
		errors.push(temp.errors);
		continue;
	}

	switch(temp.action) {
		case "mix":
			let mask = range(temp.range, type);
				mask = list(temp.list, mask);

			assert(bitma(mask, list([time])),
				" now: " + time + " cond: " + data[0][i][0]);
			break;

		case "range":
			assert(bitma(range(temp.range, type, temp.step), list([time])),
				" now: " + time + " cond: " + data[0][i][0]);
			break;

		case "list":
			assert(bitma(list(temp.list), list([time])),
				" now: " + time + " cond: " + data[0][i][0]);
			break;

		default:
			errors.push("unknown actions: " + temp.action);
	}
}

log("\n\n--- Checking Invalid CRON Jobs ---\n");
for (let i = 0, len = data[1].length; i < len; i++) {
let temp = cronbit.parse.cronArray( data[1][i][0],  data[1][i][2]),
		time = data[1][i][1],
		type = data[1][i][2];

	if (temp.errors.length > 0) {
		errors.push(temp.errors);
		continue;
	}

	switch(temp.action) {
		case "mix":
			let mask = range(temp.range, type);
				mask = list(temp.list, mask);

			assert(!bitma(mask, range([time])),
				" now: " + time + " cond: " +  data[1][i][0]);
			break;

		case "range":
			assert(!bitma(range(temp.range, type, temp.step), range([time])),
				" now: " + time + " cond: " +  data[1][i][0]);
			break;

		case "list":
			assert(!bitma(list(temp.list), range([time])),
				" now: " + time + " cond: " +  data[1][i][0]);
			break;

		default:
			errors.push("unknown actions: " + temp.action);
	}
}

log("\n\n--- Failed CRON Jobs:[%s] ---", errors.length);
if (errors.length > 0) {
	log(errors);
}
log();

// ----------------------------------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------------------------------

function log() {
	/* jshint validthis:true */
	console.log.apply(this, arguments);
}

function assert(val, msg) {
	if (!val) {
		errors.push(msg);
	}
	log("ASSERT " + (val ? "PASS" : "____") + " " + msg);
}