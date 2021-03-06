"use strict";

const events = require('events'), introspector = require('./introspector'), search = require('searchjs');

const createClass = function (parent) {
	if (parent === null || parent === undefined || !(parent === events || parent.prototype instanceof events)) {
		return null;
	}
	class cl extends parent {
		on(ev, cond, handler) {
			let condition, args, that = this;
			// explore the handler and get its arguments
		
		
			// the no condition use case
			if (handler === undefined && typeof(cond) === "function") {
				return super.on(ev,cond);
			}
		
			condition = cond;
			args = introspector.argNames(handler);
		
			// an actual condition
			return super.on(ev,function () {
				let parms = {};
				// construct the data set to match against
				// loop through the array
				for (let i in arguments) {
					parms[i] = arguments[i];
					if (args[i] !== null && args[i] !== undefined) {
						parms[args[i]] = arguments[i];
					}
				}
			
				// if the condition matched, call it, else ignore
				if (search.matchObject(parms,condition)) {
					return handler.apply(that,arguments);
				}
			});
		}
		once(ev, cond, handler) {
			let condition, args, that = this, oncehandler;
			// explore the handler and get its arguments
		
		
			// the no condition use case
			if (handler === undefined && typeof(cond) === "function") {
				return super.once(ev,cond);
			}
		
			condition = cond;
			args = introspector.argNames(handler);
		
			// an actual condition
			oncehandler = function () {
				let parms = {};
				// construct the data set to match against
				// loop through the array
				for (let i in arguments) {
					parms[i] = arguments[i];
					if (args[i] !== null && args[i] !== undefined) {
						parms[args[i]] = arguments[i];
					}
				}
			
				// if the condition matched, call it, else ignore
				if (search.matchObject(parms,condition)) {
					let ret = handler.apply(that,arguments);
					// stop it from running again
					that.removeListener(ev, oncehandler);
				}
			};
			return super.on(ev,oncehandler);
		}
	}
	return cl;
};

const EventIf = createClass(events);

EventIf.y = function (target) {
	const SubIf = createClass(target);
	return SubIf;
};
// enable is just an alias for y
EventIf.enable = EventIf.y;

module.exports = EventIf;

// next steps:
// 2- create the .y/.enable function
