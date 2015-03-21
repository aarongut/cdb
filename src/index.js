parser = require("./bytecode-parser");

console.log("Reading in sample bytecode file:");
console.log(parser.getBytes("../test/test.bc0"));
console.log("That was the sample bytecode file" +
            " -- it probably took up your whole terminal screen.");
