parser = require("./bytecode-parser");
c0vm = require("./c0vm.js");
c0ffi = require("./c0ffi.js");

// console.log("Reading in sample bytecode file:");
// console.log(parser.getBytes("../test/test.bc0"));
// console.log("That was the sample bytecode file" +
//             " -- it probably took up your whole terminal screen.");
// var file = parser.parse("../test/test.bc0");
// console.log(file);
// console.log(file.function_pool[0].code);

callbacks = {};
callbacks[c0ffi.NATIVE_PRINT] = function(args) {
    console.log("Print function says: " + args[0]);
    return 0;
}
callbacks[c0ffi.NATIVE_PRINTINT] = function(args) {
    console.log("Printint function says: " + args[0]);
    return 0;
}

console.log(callbacks);

var file = parser.parse("../test/structs.c0.bc0");
console.log("Result is " + c0vm.execute(file, callbacks));

