// Modules are a way for us to handle complexity in JavaScript applications. Put simply, a module is a JavaScript file that defines variables accessible to other modules.

// By prepending the keyword export in front of both of these functions, we are making this file a module. 

export function GCD(a, b){
    if(b===0) return a;
    return GCD(b, a%b);
}

export function factorial(n){
    if(n===0) return 1;
    return n * factorial(n-1);
}