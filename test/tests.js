parser = require("../src/bytecode-parser.js")
c0vm = require("../src/c0vm.js")

var callbacks = {}

// Tests that IADD, BIPUSH, and RETURN (from main) work
exports.testIADD = function(test) {
    var result = c0vm.execute(parser.parse("iadd.c0.bc0"), callbacks, false);
    test.ok(result == -2, "iadd.c0.bc0 - Error in IADD, BIPUSH, or RETURN");
    test.done();
};

exports.testPrint = function(test) {
    var result = c0vm.execute(parser.parse("test.bc0"), callbacks, false);
    test.ok(result == 0, "test.bc0 - Did not print to screen correctly");
    test.done();
}

exports.testISHR = function(test) {
    var result = c0vm.execute(parser.parse("ishr.c0.bc0"), callbacks, false);
    test.ok(result == -1, "ishr.c0.bc0 - -1 >> 1 gave " + result + ", not -1");
    test.done();
}
