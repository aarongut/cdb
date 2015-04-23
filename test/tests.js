parser = require("../public/vm/bytecode-parser.js");
c0vm = require("../public/vm/c0vm.js");
c0ffi = require("../public/vm/c0ffi.js");

var callbacks = c0ffi.default_callbacks;
console.log("Initial callbacks: " + callbacks[c0ffi.NATIVE_STRING_LENGTH](["hi"]));
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

function doTest(filename, expected_result) {
    return function(test) {
        var result = c0vm.execute(parser.parseFile(filename), callbacks, false);
        test.ok(result == expected_result,
                filename + " - did not get expected result " + expected_result +
               ", instead got " + result);
        test.done();
    }
}

exports.testIADD = doTest("iadd.c0.bc0", -2);

exports.testPrint = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parseFile("test.bc0"), callbacks, false);
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
        c0vm.execute(parser.parseFile("sample2.5.c0.bc0"), callbacks, false)
    });
    test.done();
}

exports.testIF = doTest("testif.c0.bc0", 32);

exports.testDSQUARED = doTest("dsquared.c0.bc0", 17068);
    
exports.testArrays = function(test) {
    test.throws(function () {
        c0vm.execute(parser.parseFile("arrays.c0.bc0"), callbacks, false)
    });
    test.done();
}

exports.testMoreArray = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parseFile("moreArrays.c0.bc0"), callbacks, false);
    test.ok(printout == "2312",
            "moreArrays.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}

exports.testStructs = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parseFile("structs.c0.bc0"), callbacks, false);
    test.ok(printout == "potato chip123",
            "structs.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}

exports.testAbort = function(test) {
    test.throws(function () {
        c0vm.execute(parser.parseFile("abort.c0.bc0"), callbacks, false);
    });
    test.done();
}

exports.testArith = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parseFile("arith.c0.bc0"), callbacks, false);
    test.ok(printout == "-2147483648   2147483647   -375   -2147483648   -9   -1   12   \n-12   12   Modulus testing   11-1   5   1   Testing constants   -251   Testing inequalities   \ny1  y2  y3  n4  n5  n6  y7  Testing bitwise operators   \n992000   1045310   53250   -12083   Testing bit shifting\n-2147483648   7360588088-31-19\n",
            "arith.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}

exports.testPIAZZA1 = doTest("piazza1.c0.bc0", 18);

exports.testSTRINGS = function(test) {
    printout = "";
    var result = c0vm.execute(parser.parseFile("strings.c0.bc0"), callbacks, false);
    test.ok(printout == "hello there!?",
            "strings.c0.bc0 - Did not print to screen correctly, result was " + 
            printout);
    test.done();
}

exports.testBREAKPOINT1 = function(test) {
    var vm = c0vm.initialize_vm(parser.parseFile("easyMath.c0.bc0"),
                                callbacks, false);
    vm.set_breakpoint(0, 4);
    var result = vm.run();
    test.ok(result === vm,
            "VM did not stop at breakpoint, instead returned " + result);
    test.ok(vm.frame.stack[0] == 23 &&
            vm.frame.stack[1] == 19,
            "VM stack incorrect");
    result = vm.run();
    test.ok(result == 1748, "VM did not resume operation correctly, gave result " + result);
    test.done();
}
