parser = require("../src/bytecode-parser.js");
c0vm = require("../src/c0vm.js");
c0ffi = require("../src/c0ffi.js");

var callbacks = {}
var printout = "";

callbacks[c0ffi.NATIVE_PRINT] = function(args) {
    printout += args[0];
}

callbacks[c0ffi.NATIVE_PRINTINT] = function(args) {
    printout += args[0];
}

callbacks[c0ffi.NATIVE_PRINTLN] = function(args) {
    printout += (args[0] + "\n");
}

function doTest(filename, expected_result) {
    return function(test) {
        var result = c0vm.execute(parser.parse(filename), callbacks, false);
        test.ok(result == expected_result,
                filename + " - did not get expected result " + expected_result +
               ", instead got " + result);
        test.done();
    }
}

exports.testIADD = doTest("iadd.c0.bc0", -2);

exports.testPrint = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parse("test.bc0"), callbacks, false);
    test.ok(printout == "Hello, world.\nYou don't look so good.\n",
            "test.bc0 - Did not print to screen correctly: output was " + printout);
    test.done();
}

exports.testISHR = doTest("ishr.c0.bc0", -1);

exports.testISQRT = doTest("isqrt.c0.bc0", 122);

exports.testMID = doTest("mid.c0.bc0", 155);

// This one should throw an exception because an assertion fails
exports.testSample25 = function(test) {
    test.throws(function () {
        c0vm.execute(parser.parse("sample2.5.c0.bc0"), callbacks, false)
    });
    test.done();
}

exports.testIF = doTest("testif.c0.bc0", 32);

exports.testDSQUARED = doTest("dsquared.c0.bc0", 17068);
    
exports.testArrays = function(test) {
    test.throws(function () {
        c0vm.execute(parser.parse("arrays.c0.bc0"), callbacks, true)
    });
    test.done();
}

exports.testStructs = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parse("structs.c0.bc0"), callbacks, false);
    test.ok(printout == "potato chip123",
            "structs.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}

