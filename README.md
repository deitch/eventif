# eventif
Clean, conditional event handlers.

## Overview
eventif simplifies event handling. Instead of doing this:

````javascript
emitter.on('anevent',function(a,b){
	if (a === 1 && b !== 1) {
		// do something
	} else if (a !== 1 && b === 2) {
		// do something else
	} else if (a > 5) {
		// another thing
	} else if (b < 20) {
		// and another something
	} else {
		// default case
	}
});

emitter.emit(2,20);
emitter.emit(1,0);
emitter.emit(-1);
````

Do this:

````javascript
emitter.on({a: 1, b: 2}, handler1);
emitter.on({a: 0}, handler2);
emitter.on({a: {from: 3, to: 10}, b: -1, _join: 'OR'}, handler3);
````

Clean, simple, short *readable* handlers. 


## Installation
Simple:

````bash
npm install eventif
````


## Usage
Eventif follows the syntax and style of [Nodejs Event Emitter](https://nodejs.org/dist/latest-v4.x/docs/api/events.html). 

You follow three simple steps:

1. Create or enable an eventif emitter
2. Create zero, one or more handlers
3. Emit events

### Create An Event Emitter
You have 2 ways to create an eventif emitter:

* Create a new eventif emitter
* Enable an existing event emitter to be eventif-capable

#### Create a New Emitter
You can create a new eventif-compliant emitter by having it inheirt from eventif. As the example in the docs shows, you can use either classical nodejs prototypal inheritance:

````javascript
const Eventif = require('eventif');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, Eventif);

myEmitter = new MyEmitter();
````

Or, if you prefer, you can use ES6-style syntax:

````javascript
const EventIf = require('eventif');

class MyEmitter extends EventIf {}

const myEmitter = new MyEmitter();
````

In both of the above examples, you are creating a new emitter by inheriting from `eventif` instead of from `events`.

#### Enable an Existing Emitter
**NOTE: Enabling is not functional yet.**

If you already have a standard event emitter which, somewhere down the line, inherits from `events`, you may not be able to change it to inherit from `eventif` instead. In that case, instead of creating a new event emitter, you *enable* the existing one to be eventif capable. 

````javascript
const Eventif = require('eventif');
const EventEmitter = require('events');
const util = require('util');

function MyEmitter() {
  EventEmitter.call(this);
}
util.inherits(MyEmitter, Eventif);

myEmitter = new MyEmitter();
Eventif.y(myEmitter);
// or an alias
Eventif.enable(myEmitter);
````

Now we have an eventif-capable emitter. Let's use it!

### Create zero or more handlers
How would you create a normal event handler? With `on`!

````javascript
myEmitter.on('anevent',function(a,b){
	// do something
});
````

How would you create an eventif-capable handler? **In exactly the same way!**

````javascript
myEmitter.on('anevent',function(a,b){
	// do something
});
````

*Handlers do not need to be changed to support eventif.* 

However, you now have the *option* to make those handlers conditional:

````javascript
myEmitter.on('anevent',{a:1, b:0},function(a,b){
	// do something
});
````

As you can see, handlers really do not *need* to be changed. Of course, you may *want* to change them, now that all of that extraneous `if-else if-else if-else` or perhaps `switch-case-case-case-case-case-default` code can go away!

The signature for emitter functions is as follows:

* `emitter.on(event,conditions,handler)`
* `emitter.once(event,conditions,handler)`
* `emitter.emit(event,[param1,param2,...,paramN])`


See below for details on the correct syntax for conditions and how it matches parameters.

#### No Conditions
If you call `on()` or `once()` with no conditions at all, it is handled directly by the original event emitter.

````javascript
myEmitter.on('anevent',function(a,b){
	// do something
});
````

The above means, "for every event of type 'anevent', *always* call the handler". 

#### Using once
eventif fully supports `once()`. The [rules for `once()`](https://nodejs.org/dist/latest-v4.x/docs/api/events.html#events_emitter_once_event_listener) state that "This listener is invoked only the next time event is triggered, after which it is removed."

eventif follows the same logic. The handler is removed after the handler actually is invoked. Thus, if the handler would have been invoked if not for eventif, but the conditions do not match, then the handler remains in place. It is removed **only** after the actual handler function has been called at least once.

````javascript
myEmitter.once({a:1},'anevent',function(a,b){
	// do something
});
myEmitter.emit('anevent'); // handler is NOT run or removed
myEmitter.emit('anevent',2); // handler is NOT run or removed
myEmitter.emit('anevent',1); // handler IS run and removed
myEmitter.emit('anevent',1); // handler already WAS removed, so it is NOT run
````

On the other hand, if you used a traditional event emitter, or even eventif without any conditions:

````javascript
myEmitter.once('anevent',function(a,b){
	// do something
});
myEmitter.emit('anevent'); // handler IS run and removed
myEmitter.emit('anevent',2); // handler already WAS removed, so it is NOT run
````





### Emit Events
This is easy. Just emit events like you always do!

````JavaScript
myEmitter.emit('anevent');
// or if you want to pass parameters
myEmitter.emit('anevent',1,0,"hello world!");
````



## Conditions and Syntax
In order for your conditions to work correctly, you need to specify the correct conditions syntax. 

The syntax is the JSQL syntax of [searchjs](https://github.com/deitch/searchjs). The condition is what you pass as the (optional) second argument to `.on()` or `.once()`. The data checked against the condition is constructed of the name of the event and the parameters to your handler.

Let's take that apart. 

Here's a simple example:

````javascript
emitter.on('anevent',/* some condition */,function(a,b){
	// do something
});
emitter.emit('anevent',1,"hello");
````

Your handler expects the first argument to the event to be saved as `a` and the second as `b`. Thus, the object tested against will be:

````json
{a:1, b:"hello"}
````

On the other hand, if you created the handler as follows:

````javascript
emitter.on('anevent',/* some condition */,function(q,f){
	// do something
});
emitter.emit('anevent',1,"hello");
````

Then the data to test the condition against would be:

````json
{q:1, f:"hello"}
````

In addition, the parameters are saved in order:

````json
{1:1, 2: "hello"}
````


All that really happens with each event emission is:

1. Create a new object `{}`
2. Populate the object with the parameters to the event call `{1:1, 2:"hello"}`
3. If the handler has named arguments, populate the object with the named parameters `{1:1, 2:"hello", a:1, b:"hello"}`
4. Call `searchjs.matchObject(data,condition)`, e.g. `searchjs.match({1:1, 2:"hello", a:1, b:"hello"}, {1:1})`.
5. If `matchObject()` returns `true`, call the handler, else do not.


### Examples
In each example, we will show if it matches, and thus the handler is called, and why or why not.

##### Example 1

````javascript
emitter.on('anevent',function(){
});
emitter.emit('anevent',1,2,'hello','jim',25,{a:1});
````

**YES:** With no condition, the handler always is called.


##### Example 2

````javascript
emitter.on('anevent',{order:1,name:"jim"},function(order,count,message,name){
});
emitter.emit('anevent',1,2,'hello','jim',25,{a:1});
````

**YES:** 

* `order` is 1st argument to function, which means 1st parameter to `emit()`. In condition, `order:1` means it must equal 1. It does, and it matches.
* `name` is 4th argument to function, which means 4th parameter to `emit()`. In condition, `name:"jim"` means it must equal "jim". It does, and it matches.

##### Example 3

````javascript
emitter.on('anevent',{order:1,name:"jill"},function(order,count,message,name){
});
emitter.emit('anevent',1,2,'hello','jim',25,{a:1});
````

**NO:** 

* `order` is 1st argument to function, which means 1st parameter to `emit()`. In condition, `order:1` means it must equal 1. It does, and it matches.
* `name` is 4th argument to function, which means 4th parameter to `emit()`. In condition, `name:"jill"` means it must equal "jill", but it equals "jim", so it fails.

##### Example 4

````javascript
emitter.on('anevent',{3:"jim"},function(){
});
emitter.emit('anevent',1,2,'hello','jim',25,{a:1});
````

**YES:** 

* Condition says that the 4th argument (3 from index 0) must be "jim". The 4th parameter (after the event), or 3rd from index 0, is indeed "jim".

##### Example 5

````javascript
emitter.on('anevent',{order:1,name:"jill",_join:"OR"},function(order,count,message,name){
});
emitter.emit('anevent',1,2,'hello','jim',25,{a:1});
````

**YES:** 

Condition says that "order" must equal 1 **OR** "name" must equal "jill". Since one of them is correct ("order" === 1), it matches.

##### Example 6

````javascript
emitter.on('anevent',{count:{from: 1, to: 50} },function(order,count,message,name){
});
emitter.emit('anevent',1,32,'hello','jim',25,{a:1});
````

**YES:** 

Condition says that "order" must be from 1 to 50. Since "order" is equal to 32, it is in the range and matches.



