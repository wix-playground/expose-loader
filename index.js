/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var path = require('path');

function accesorString(value) {
	var childProperties = value.split(".");
	var length = childProperties.length;
	var propertyString = "global";
	var result = "";

	for(var i = 0; i < length; i++) {
		if(i > 0)
			result += "if(!" + propertyString + ") " + propertyString + " = {};\n";
		propertyString += "[" + JSON.stringify(childProperties[i]) + "]";
	}

	return {result: result, propertyString: propertyString};
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
	return accesorString(this.query.substr(1)).result += "module.exports = " + accesorString(this.query.substr(1)).propertyString + " = Object.assign ? Object.assign(" +
		accesorString(this.query.substr(1)).propertyString + " || {}, require(" + JSON.stringify("-!" + newRequestPath) + ")) : {};";
};