// importing and using modules
import {GCD} from './math.js';
console.log('GCD(84, 52):', GCD(84, 52));
// can rename imports as follows:
import {factorial as myFactorial} from './math.js';
console.log('myFactorial(5):', myFactorial(5));


// importing classes, instantiating objects and using methods
// importing a 'default export'
import Book from './Book.js';
const book1 = new Book('myFirstBook', 'Andy');
// accesses getter method 'availiable'
console.log('book1:', book1.available);
// sets reserved status via 'reserve' setter method
book1.reserve = true;
console.log('book1:', book1.available);

// class ComicBook extends Book
// importing a 'named export' using {}
import {ComicBook} from './Book.js';
const book2 = new ComicBook('myComic', 'Andy', 'illustrating co');
// with ‘.’ the key must be static, i.e. already part of the object whereas with [] the can be dynamic or an expression, i.e something evaluated at runtime such as the result of a function evaluation.
console.log('book2 illustrator (using "."):', book2.illustrator);
console.log('book2 illustrator (using "[]"):', book2['illustrator']);


'use strict';               // to prevent us from overwriting important stuff

const c = 'constant';       // a constant value, assignment to c is no longer allowed

let v = 'variable';         // a primitive variable

let a = [1, 2, 3, false];   // an array

let o = {                   // an object
    'key1': 1,
    'key2': 'something'
};


// Different ways to declare functions in JavaScript
// b has default value of 6
function one(a, b=6){
    return a+b;
}
let two = function(a, b){
    return a+b;
}
let three = (a,b)=>a+b;
// o.key3 now points to function two:
o['key3'] = two;


// To use a funtion, just use it and give it parameters:
console.log('using a function "one(4,5)":', one(4,5));
console.log('c:', c);
console.log('v:', v);
console.log('a:', a);
console.log('o:', o);
console.log("o['key1']:", o['key1']);
console.log('o.key2', o.key2);
console.log('o.key3', o.key3);


