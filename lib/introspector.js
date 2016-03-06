/*jslint node:true */

module.exports = {
	argNames: function (fn) {
	// Extract function string representation: hopefully we can count on it ?
	  var s = fn.toString();

	  // The cool thing is: this can only be a syntactically valid function declaration
	  s = s                               // "function name (a, b, c) { body }"
	    .substring(                       //                "a, b, c"
	      s.indexOf('(')+1,               // ----------------^
	      s.indexOf(')')                  //                 ------^
	    );

	  // Cleanup the string, ignore spaces and linefeeds, only identifiers matter
	  s = s.replace(/[\r\n\s]*/g, '');    // "a,b,c"

	  // Let's be ES6-ready: any argument can be followed by '= default value'
	  s = s                               // a,b="\"toto\"",c='hello',d=3342,e,f
	    .replace(/\\+['"]/g, '')          // a,b="toto",c='hello',d=3342,e,f
	    .replace(/=\s*(["']).*?\1/g, '')  // a,b,c,d=3342,e,f
	    .replace(/=.*?(,|$)/g, '');       // a,b,c,d,e,f

	  return s.split(',');                // ["a", "b", "c"]	
	}
};