(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ByteStream = function (byte_array) {
    console.log("Instance created.");
    this.byte_array = byte_array;
    this.index = 0;
};

ByteStream.prototype.get_u1 = function() {
    var result = this.byte_array[this.index];
    this.index += 1;
    return result;
}

ByteStream.prototype.get_u2 = function() {
    var high = this.get_u1();
    var low = this.get_u1();
    return (high << 8) + low;
}

ByteStream.prototype.get_u4 = function() {
    var high = this.get_u2();
    var low = this.get_u2();
    return (high * 0x10000) + low;
}

ByteStream.prototype.get_i4 = function() {
    var unsigned_val = this.get_u4();
    var sign_mult = (unsigned_val & 0x80000000) ? -1 : 1;
    return (unsigned_val & 0x7FFFFFFF) * sign_mult;
}

ByteStream.prototype.get_bytes = function(n) {
    var result = [];
    for (var i = 0; i < n; i++) {
        result.push(this.get_u1());
    }
    return result;
}

exports.ByteStream = ByteStream;

},{}],2:[function(require,module,exports){
fs = require("fs");
byte_stream = require("./byte-stream");

// This is a simple, kinda hacky bytecode parser for .bc0 files
// Now takes in raw bytecode
function getBytes(data) {
  /*
    var data = fs.readFileSync(filename);
    
    if (data == null) {
        if (err["code"] === "ENOENT")
            console.log("Error: file " + filename + " does not exist.");
        else
            console.log("Error: " + err);
        return;
    }
    */

    // Data contains our file, but we want it as a string
    var string_data = data.toString();

    // Strip all the comments for easier parsing
    var without_comments = string_data.replace(new RegExp("#.*", "gi"), "");

    // Each byte should now be a pair of two hex digits.
    // Put all these in an array.
    var bytes = [];
    without_comments.replace(
        new RegExp("([0123456789ABCDEF][0123456789ABCDEF])", "gi"),
        function(next_byte) {
            bytes.push(parseInt(next_byte, 16));
        });

    // We now have an array of bytes. That's probably everything we need, right?
    console.log(bytes);
    return bytes;

}

var FunctionInfo = function (stream) {
    this.num_args = stream.get_u2();
    this.num_vars = stream.get_u2();
    this.code_length = stream.get_u2();
    this.code = stream.get_bytes(this.code_length);
}

var NativeInfo = function (stream) {
    this.num_args = stream.get_u2();
    this.function_table_index = stream.get_u2();
}

var Bc0File = function (filename) {
    var file = getBytes(filename);
    var stream = new byte_stream.ByteStream(file);
    
    var magic = stream.get_u4();
    if (magic != 0xc0c0ffee) {
        console.log("Error - file is not a c0 bytecode file");
        return null;
    }

    // I don't know that we need this, but here it is
    this.version_arch = stream.get_u2();

    this.int_count = stream.get_u2();

    this.int_pool = [];
    for (var i = 0; i < this.int_count; i++) {
        this.int_pool[i] = stream.get_i4();
    }

    this.string_count = stream.get_u2();
    
    this.string_pool = [];
    var current_string = "";
    for (var i = 0; i < this.string_count; i++) {
        var c = stream.get_u1();
        if (c == 0) {
            this.string_pool.push(current_string);
            current_string = "";
        } else {
            current_string += String.fromCharCode(c);
        }
    }

    this.function_count = stream.get_u2();

    this.function_pool = [];
    for (var i = 0; i < this.function_count; i++) {
        this.function_pool.push(new FunctionInfo(stream));
    }

    this.native_count = stream.get_u2();
    this.native_pool = [];
    for (var i = 0; i < this.native_count; i++) {
        this.native_pool.push(new NativeInfo(stream));
    }
}

function parse(filename) {
    return new Bc0File(filename);
}

exports.getBytes = getBytes;
exports.parse = parse;

},{"./byte-stream":1,"fs":6}],3:[function(require,module,exports){
op = require("./opcodes");

var ProgramState = function(parsed_file) {
    var main_function = parsed_file.function_pool[0];
    
    this.stack = []
    this.pc = 0;
    this.program = main_function.code;
    this.variables = [];
    for (var i = 0; i < main_function.num_vars; i++)
        variables.push(0);
    this.file = parsed_file;
}


ProgramState.prototype.doIf = function(shouldJump) {
    if (shouldJump) {
        var address_offset = (this.program[this.pc+1] * 0x1000) + 
            this.program[this.pc+2];
        this.pc += address_offset;
    } else {
        this.pc += 3;
    }
}

ProgramState.prototype.step = function() {
    console.log("Running opcode " + op.lookup_table[this.program[this.pc]]);
    switch (this.program[this.pc]) {
        // Stack manipulation
    case op.POP:
        this.pc++;
        this.stack.pop();
        break;
    case op.DUP:
        this.pc++;
        var v = this.stack.pop();
        this.stack.push(v);
        this.stack.push(v);
        break;
    case op.SWAP:
        this.pc++;
        var v1 = this.stack.pop();
        var v2 = this.stack.pop();
        this.stack.push(v1);
        this.stack.push(v2);
        break;
    case op.BIPUSH:
        this.pc += 2;
        var val = this.program[this.pc-1];

        // Do sign extension if necessary
        if (val & 0x80 != 0)
            val = -0x80 + (val & 0x7F);
        this.stack.push(val);
        break;

        // Returning from a function
    case op.RETURN:
        var retVal = this.stack.pop();
        throw retVal;

        // Arithmetic
    case op.IADD:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        console.log("Adding " + x + " and " + y);
        this.stack.push((x+y) % 0x100000000);
        break;
    case op.ISUB:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.stack.push((x-y) % 0x100000000);
        break;
    case op.IMUL:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.stack.push((x*y) % 0x100000000);
        break;
    case op.IDIV:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        if (y == 0) c0_arith_error("Divide by zero");
        if (x == INT_MIN && y == -1) c0_arith_error("Arithmetic overflow");

        // This does int division.
        // As I understand it, the ~~ is treated as the identity on integers
        // which forces the type to int, not float
        this.stack.push(~~(x/y));
        break;
    case op.IREM:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        if (y == 0) c0_arith_error("Divide by zero");
        if (x == INT_MIN && y == -1) c0_arith_error("Arithmetic overflow");
        this.stack.push(x%y);
        break;
    case op.IAND:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.stack.push(x&y);
        break;
    case op.IOR:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.stack.push(x|y);
        break;
    case op.IXOR:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.stack.push(x^y);
        break;
    case op.ISHL:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        if (y < 0 || y > 31) c0_arith_error("Shifting by too many bits");
        this.stack.push(x<<y);
        break;
    case op.ISHR:
        this.pc++;
        var y = this.stack.pop();
        var x = this.stack.pop();
        if (y < 0 || y > 31) c0_arith_error("Shifting by too many bits");
        this.stack.push(x>>y);
        break;

        // Operations on local variables

    case op.VLOAD:
        this.pc += 2;
        var index = this.program[this.pc-1];
        this.stack.push(this.variables[index]);
        break;
    case op.VSTORE:
        this.pc += 2;
        var index = this.program[this.pc-1];
        this.variables[index] = this.stack.pop();
        break;
    case op.ACONST_NULL:
        this.pc++;
        this.stack.push(0);
        break;
    case op.ILDC:
        this.pc += 3;
        var c1 = this.program[this.pc-2];
        var c2 = this.program[this.pc-1];
        var index = (c1 * 0x1000) + c2;

        this.stack.push(this.file.int_pool[index]);
        break;
    case op.ALDC:
        console.log("Error: I don't know how to handle ALDC yet");
        throw "Error - can't handle ALDC";

        // Control flow
    case op.NOP:
        this.pc++;
        break;
    case op.IF_CMPEQ:
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.doIf(y == x);
        break;
    case op.IF_CMPNE:
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.doIf(y != x);
        break;
    case op.IF_CMPLT:
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.doIf(y > x);
        break;
    case op.IF_CMPGE:
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.doIf(y <= x);
        break;
    case op.IF_CMPGT:
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.doIf(y < x);
        break;
    case op.IF_CMPLE:
        var y = this.stack.pop();
        var x = this.stack.pop();
        this.doIf(y >= x);
        break;
    case op.GOTO:
        this.doIf(true);
        break;
    case op.ATHROW:
        this.pc++;
        c0_user_error(this.stack.pop());
        break;
    case op.ASSERT:
        this.pc++;
        var a = this.stack.pop();
        if (this.stack.pop() == 0)
            c0_assertion_failure(a);
        break;

    default:
        console.log("Error: Unknown opcode\n");
        throw "Error - unknown opcode";
    }
    return false;
}

// Takes in a parsed .bc0 file and runs it
function execute(f) {
    console.log("Beginning execution of file " + f);

    var state = new ProgramState(f);
    
    while (true) {
        // I'm not sure how to structure this control flow yet,
        // so if anyone has a better idea, let me know
        try {
            state.step();
        } catch (val) {
            return val;
        }

        // if (at_breakpoint) {
        //   save state (maybe in a global in this file?)
        //   return;
        // }
    }        
}

exports.execute = execute;

// opcode definitions


},{"./opcodes":5}],4:[function(require,module,exports){
parser = require("./bytecode-parser");
c0vm = require("./c0vm.js");

// console.log("Reading in sample bytecode file:");
// console.log(parser.getBytes("../test/test.bc0"));
// console.log("That was the sample bytecode file" +
//             " -- it probably took up your whole terminal screen.");
// var file = parser.parse("../test/test.bc0");
// console.log(file);
// console.log(file.function_pool[0].code);

$("#run").click(function() {
  var file = parser.parse($("#bytecode").text);
  $("#output").text(c0vm.execute(file));
});

},{"./bytecode-parser":2,"./c0vm.js":3}],5:[function(require,module,exports){
/* arithmetic operations */
exports.IADD = 0x60;
exports.IAND = 0x7E;
exports.IDIV = 0x6C;
exports.IMUL = 0x68;
exports.IOR = 0x80;
exports.IREM = 0x70;
exports.ISHL = 0x78;
exports.ISHR = 0x7A;
exports.ISUB = 0x64;
exports.IXOR = 0x82;

/* stack operations */
exports.DUP = 0x59;
exports.POP = 0x57;
exports.SWAP = 0x5F;

/* memory allocation */
exports.NEWARRAY = 0xBC;
exports.ARRAYLENGTH = 0xBE;
exports.NEW = 0xBB;

/* memory access */
exports.AADDF = 0x62;
exports.AADDS = 0x63;
exports.IMLOAD = 0x2E;
exports.AMLOAD = 0x2F;
exports.IMSTORE = 0x4E;
exports.AMSTORE = 0x4F;
exports.CMLOAD = 0x34;
exports.CMSTORE = 0x55;

/* local variables */
exports.VLOAD = 0x15;
exports.VSTORE = 0x36;

/* constants */
exports.ACONST_NULL = 0x01;
exports.BIPUSH = 0x10;
exports.ILDC = 0x13;
exports.ALDC = 0x14;

/* control flow */
exports.NOP = 0x00;
exports.IF_CMPEQ = 0x9F;
exports.IF_CMPNE = 0xA0;
exports.IF_ICMPLT = 0xA1;
exports.IF_ICMPGE = 0xA2;
exports.IF_ICMPGT = 0xA3;
exports.IF_ICMPLE = 0xA4;
exports.GOTO = 0xA7;
exports.ATHROW = 0xBF;
exports.ASSERT = 0xCF;

/* function calls and returns */
exports.INVOKESTATIC = 0xB8;
exports.INVOKENATIVE = 0xB7;
exports.RETURN = 0xB0


exports.lookup_table = {
    0x60: "IADD",
    0x7E: "IAND",
    0x6C: "IDIV",
    0x68: "IMUL",
    0x80: "IOR",
    0x70: "IREM",
    0x78: "ISHL",
    0x7A: "ISHR",
    0x64: "ISUB",
    0x82: "IXOR",
    0x59: "DUP",
    0x57: "POP",
    0x5F: "SWAP",
    0xBC: "NEWARRAY",
    0xBE: "ARRAYLENGTH",
    0xBB: "NEW",
    0x62: "AADDF",
    0x63: "AADDS",
    0x2E: "IMLOAD",
    0x2F: "AMLOAD",
    0x4E: "IMSTORE",
    0x4F: "AMSTORE",
    0x34: "CMLOAD",
    0x55: "CMSTORE",
    0x15: "VLOAD",
    0x36: "VSTORE",
    0x01: "ACONST",
    0x10: "BIPUSH",
    0x13: "ILDC",
    0x14: "ALDC",
    0x00: "NOP",
    0x9F: "IF",
    0xA0: "IF",
    0xA1: "IF",
    0xA2: "IF",
    0xA3: "IF",
    0xA4: "IF",
    0xA7: "GOTO",
    0xBF: "ATHROW",
    0xCF: "ASSERT",
    0xB8: "INVOKESTATIC",
    0xB7: "INVOKENATIVE",
    0xB0: "RETURN"
};

},{}],6:[function(require,module,exports){

},{}]},{},[3,2,1,5,4]);
