/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */

var path = require('path');

function accesorString(value) {
	var childProperties = value.split(".");
	var length = childProperties.length;
	var propertyString = "global";
	var preString = "";

	for(var i = 0; i <= length; i++) {
		if(i > 0)
			preString += "if(!" + propertyString + ") " + propertyString + " = {};\n";
		if(i !== length)
			propertyString += "[" + JSON.stringify(childProperties[i]) + "]";
	}

	return {preString: preString, propertyString: propertyString};
}

module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	// Change the request from an /abolute/path.js to a relative ./path.js
	// This prevents [chunkhash] values from changing when running webpack
	// builds in different directories.
	const newRequestPath = remainingRequest.replace(
		this.resourcePath,
		'.' + path.sep + path.relative(this.context, this.resourcePath)
	);
	this.cacheable && this.cacheable();
	if(!this.query) throw new Error("query parameter is missing");

	var preString = accesorString(this.query.substr(1)).preString;
	var propertyString = accesorString(this.query.substr(1)).propertyString;
	var objString = JSON.stringify("-!" + newRequestPath);
	return preString + "for (prop in require(" + objString + ")) {if (require(" + objString + ").hasOwnProperty(prop)) {"
		+ propertyString + "[prop] = require(" + objString + ")[prop]}}; module.exports = " + propertyString;
};
