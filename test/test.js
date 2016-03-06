/*global describe,before,it, beforeEach */
/*jslint debug:true, esnext:true, node:true, expr:true */

"use strict";

const EventIf = require('../lib'), events = require('events'), sinon = require('sinon'), should = require('should');

before(function(done){
	debugger;
	done();
});

let emitter;
let allTests = function () {
	const spy = sinon.spy(), ev = 'anevent',
	/*jshint unused:false*/
	handler = function (a,b) {spy();} ;
	/*jshint unused:true*/
	
	describe('no condition', function(){
		before(function(){
			spy.reset();
			emitter.on(ev,handler);
			emitter.emit(ev);
		});
		it('should always call', function(){
			spy.calledOnce.should.be.true;
		});
	});
	describe('condition', function(){
		describe('named', function(){
			before(function(){
				emitter.removeAllListeners(ev);
				emitter.on(ev,{a:1,b:2},handler);
			});
			beforeEach(function(){
				spy.reset();
			});
			it('should call for matched condition', function(){
				emitter.emit(ev,1,2);
				spy.calledOnce.should.eql(true);
			});
			it('should not call for unmatched condition', function(){
				emitter.emit(ev,1,0);
				spy.called.should.eql(false);
			});
		});
		describe('ordered', function(){
			before(function(){
				emitter.removeAllListeners(ev);
				emitter.on(ev,{0:1,1:2},handler);
			});
			beforeEach(function(){
				spy.reset();
			});
			it('should call for matched condition', function(){
				emitter.emit(ev,1,2);
				spy.calledOnce.should.eql(true);
			});
			it('should not call for unmatched condition', function(){
				emitter.emit(ev,1,0);
				spy.called.should.eql(false);
			});
		});
		describe('once', function(){
			before(function(){
				emitter.removeAllListeners(ev);
				emitter.once(ev,{0:1,1:2},handler);
			});
			before(function(){
				spy.reset();
			});
			describe('when unmatched', function(){
				it('should not call', function(){
					emitter.emit(ev,1,0);
					spy.called.should.eql(false);
				});
				describe('and then when matched', function(){
					it('should call', function(){
						emitter.emit(ev,1,2);
						spy.calledOnce.should.eql(true);
					});
					describe('and then when matched again', function(){
						it('should not call again', function(){
							emitter.emit(ev,1,2);
							spy.calledOnce.should.eql(true);
						});
					});
				});
			});
		});
	});
};

describe('eventif', function(){
	describe('create emitter', function(){
		before(function(){
			class MyEmitter extends EventIf {}
			emitter = new MyEmitter();
		});
		allTests();
	});
	describe('eventif-y emitter', function(){
		before(function(){
			class MyEmitter extends events {}
			emitter = EventIf.y(MyEmitter);
			emitter = new emitter();
		});
		allTests();
	});
	describe('enable emitter', function(){
		before(function(){
			class MyEmitter extends events {}
			emitter = EventIf.enable(MyEmitter);
			emitter = new emitter();
		});
		allTests();
	});
});


