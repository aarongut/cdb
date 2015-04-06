parser = require("../src/bytecode-parser.js")
c0vm = require("../src/c0vm.js")

var callbacks = {}

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
    var result = c0vm.execute(parser.parse("test.bc0"), callbacks, false);
    test.ok(result == 0, "test.bc0 - Did not print to screen correctly");
    test.done();
}

exports.testISHR = doTest("ishr.c0.bc0", -1);

exports.testISQRT = doTest("isqrt.c0.bc0", 122);

exports.testMID = doTest("mid.c0.bc0", 155);

// This one should throw an exception because an assertion fails
exports.testSample25 = function(test) {
    test.throws(c0vm.execute(parser.parse("sample2.5.c0.bc0"), callbacks, false));
    test.done();
}

exports.testIF = doTest("testif.c0.bc0", 32);

exports.testDSQUARED = doTest("dsquared.c0.bc0", 17068);
    
exports.testArrays = function(test) {
    var result = c0vm.execute(parser.parse("arrays.c0.bc0"), callbacks, false);
    test.ok(false, "test.bc0 - Did not print to screen correctly");
    test.done();
}

exports.testStructs = function(test) {
    var result = c0vm.execute(parser.parse("structs.c0.bc0"), callbacks, false);
    test.ok(false, "test.bc0 - Did not print to screen correctly");
    test.done();
}
