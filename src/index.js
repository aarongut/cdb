parser = require("./bytecode-parser");
c0vm = require("./c0vm.js");

// console.log("Reading in sample bytecode file:");
// console.log(parser.getBytes("../test/test.bc0"));
// console.log("That was the sample bytecode file" +
//             " -- it probably took up your whole terminal screen.");
// var file = parser.parse("../test/test.bc0");
// console.log(file);
// console.log(file.function_pool[0].code);

var file = parser.parse("../test/iadd.c0.bc0");
console.log("Result is " + c0vm.execute(file));
