parser = require("../src/bytecode-parser.js");
c0vm = require("../src/c0vm.js");
c0ffi = require("../src/c0ffi.js");

var callbacks = {}
var printout = "";

callbacks[c0ffi.NATIVE_PRINT] = function(args) {
    printout += args[0];
    return 0;
}

callbacks[c0ffi.NATIVE_PRINTINT] = function(args) {
    printout += args[0];
    return 0;
}

callbacks[c0ffi.NATIVE_PRINTLN] = function(args) {
    printout += (args[0] + "\n");
    return 0;
}

callbacks[c0ffi.NATIVE_STRING_LENGTH] = function(args) {
    return args[0].length;
}

callbacks[c0ffi.NATIVE_STRING_TO_CHARARRAY] = function(args) {
    return args[0];
}

callbacks[c0ffi.NATIVE_STRING_FROM_CHARARRAY] = function(args) {
    console.log("string_from_chararray: " + args);
    return args[0];
}

callbacks[c0ffi.NATIVE_CHAR_CHR] = function(args) {
    return String.fromCharCode(args[0]);
}

callbacks[c0ffi.NATIVE_CHAR_ORD] = function(args) {
    console.log("native_car_ord: " + args);
    if (typeof args[0] == "string")
        return args[0].charCodeAt(0);
    return args[0];
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
        c0vm.execute(parser.parse("arrays.c0.bc0"), callbacks, false)
    });
    test.done();
}

exports.testMoreArray = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parse("moreArrays.c0.bc0"), callbacks, false);
    test.ok(printout == "2312",
            "moreArrays.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
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

exports.testAbort = function(test) {
    test.throws(function () {
        c0vm.execute(parser.parse("abort.c0.bc0"), callbacks, false);
    });
    test.done();
}

exports.testArith = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parse("arith.c0.bc0"), callbacks, false);
    test.ok(printout == "-2147483648   2147483647   -375   -2147483648   -9   -1   12   \n-12   12   Modulus testing   11-1   5   1   Testing constants   -251   Testing inequalities   \ny1  y2  y3  n4  n5  n6  y7  Testing bitwise operators   \n992000   1045310   53250   -12083   Testing bit shifting\n-2147483648   7360588088-31-19\n",
            "arith.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}

exports.testPIAZZA1 = doTest("piazza1.c0.bc0", 18);

exports.testSTRINGS = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parse("strings.c0.bc0"), callbacks, false);
    test.ok(printout == "hello there!?",
            "strings.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}
