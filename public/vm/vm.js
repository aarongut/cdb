(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ByteStream = function (byte_array) {
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
    return (unsigned_val & 0x7FFFFFFF) + (unsigned_val & 0x80000000);
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
    console.log(string_data);

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
            // this.string_pool.push(current_string);
            // current_string = "";
            this.string_pool.push(0);
        } else {
            this.string_pool.push(String.fromCharCode(c));
        }
    }

    this.function_count = stream.get_u2();

    this.function_pool = [];
    for (var i = 0; i < this.function_count; i++) {
        this.function_pool.push(new FunctionInfo(stream));
        this.function_pool[i].function_id = i;
    }

    this.native_count = stream.get_u2();
    this.native_pool = [];
    for (var i = 0; i < this.native_count; i++) {
        this.native_pool.push(new NativeInfo(stream));
    }
}

Bc0File.prototype.string_from_index = function (i) {
    var result = "";
    while (this.string_pool[i] !== 0 && i < this.string_pool.length) {
        result += this.string_pool[i];
        i++;
    }
    return result;
}

function parse(filename) {
    return new Bc0File(filename);
}

exports.getBytes = getBytes;
exports.parse = parse;

},{"./byte-stream":1,"fs":7}],3:[function(require,module,exports){
exports.NATIVE_FADD = 0
exports.NATIVE_FDIV = 1
exports.NATIVE_FLESS = 2
exports.NATIVE_FMUL = 3
exports.NATIVE_FSUB = 4
exports.NATIVE_FTOI = 5
exports.NATIVE_ITOF = 6
exports.NATIVE_PRINT_FPT = 7
exports.NATIVE_PRINT_HEX = 8
exports.NATIVE_PRINT_INT = 9

/* args */
exports.NATIVE_ARGS_FLAG = 10
exports.NATIVE_ARGS_INT = 11
exports.NATIVE_ARGS_PARSE = 12
exports.NATIVE_ARGS_STRING = 13

/* conio */
exports.NATIVE_EOF = 14
exports.NATIVE_FLUSH = 15
exports.NATIVE_PRINT = 16
exports.NATIVE_PRINTBOOL = 17
exports.NATIVE_PRINTCHAR = 18
exports.NATIVE_PRINTINT = 19
exports.NATIVE_PRINTLN = 20
exports.NATIVE_READLINE = 21

/* curses */
exports.NATIVE_C_ADDCH = 22
exports.NATIVE_C_CBREAK = 23
exports.NATIVE_C_CURS_SET = 24
exports.NATIVE_C_DELCH = 25
exports.NATIVE_C_ENDWIN = 26
exports.NATIVE_C_ERASE = 27
exports.NATIVE_C_GETCH = 28
exports.NATIVE_C_INITSCR = 29
exports.NATIVE_C_KEYPAD = 30
exports.NATIVE_C_MOVE = 31
exports.NATIVE_C_NOECHO = 32
exports.NATIVE_C_REFRESH = 33
exports.NATIVE_C_SUBWIN = 34
exports.NATIVE_C_WADDCH = 35
exports.NATIVE_C_WADDSTR = 36
exports.NATIVE_C_WCLEAR = 37
exports.NATIVE_C_WERASE = 38
exports.NATIVE_C_WMOVE = 39
exports.NATIVE_C_WREFRESH = 40
exports.NATIVE_C_WSTANDEND = 41
exports.NATIVE_C_WSTANDOUT = 42
exports.NATIVE_CC_GETBEGX = 43
exports.NATIVE_CC_GETBEGY = 44
exports.NATIVE_CC_GETMAXX = 45
exports.NATIVE_CC_GETMAXY = 46
exports.NATIVE_CC_GETX = 47
exports.NATIVE_CC_GETY = 48
exports.NATIVE_CC_HIGHLIGHT = 49
exports.NATIVE_CC_KEY_IS_BACKSPACE = 50
exports.NATIVE_CC_KEY_IS_DOWN = 51
exports.NATIVE_CC_KEY_IS_ENTER = 52
exports.NATIVE_CC_KEY_IS_LEFT = 53
exports.NATIVE_CC_KEY_IS_RIGHT = 54
exports.NATIVE_CC_KEY_IS_UP = 55
exports.NATIVE_CC_WBOLDOFF = 56
exports.NATIVE_CC_WBOLDON = 57
exports.NATIVE_CC_WDIMOFF = 58
exports.NATIVE_CC_WDIMON = 59
exports.NATIVE_CC_WREVERSEOFF = 60
exports.NATIVE_CC_WREVERSEON = 61
exports.NATIVE_CC_WUNDEROFF = 62
exports.NATIVE_CC_WUNDERON = 63

/* file */
exports.NATIVE_FILE_CLOSE = 64
exports.NATIVE_FILE_CLOSED = 65
exports.NATIVE_FILE_EOF = 66
exports.NATIVE_FILE_READ = 67
exports.NATIVE_FILE_READLINE = 68

/* img */
exports.NATIVE_IMAGE_CLONE = 69
exports.NATIVE_IMAGE_CREATE = 70
exports.NATIVE_IMAGE_DATA = 71
exports.NATIVE_IMAGE_HEIGHT = 72
exports.NATIVE_IMAGE_LOAD = 73
exports.NATIVE_IMAGE_SAVE = 74
exports.NATIVE_IMAGE_SUBIMAGE = 75
exports.NATIVE_IMAGE_WIDTH = 76

/* parse */
exports.NATIVE_INT_TOKENS = 77
exports.NATIVE_NUM_TOKENS = 78
exports.NATIVE_PARSE_BOOL = 79
exports.NATIVE_PARSE_INT = 80
exports.NATIVE_PARSE_INTS = 81
exports.NATIVE_PARSE_TOKENS = 82

/* string */
exports.NATIVE_CHAR_CHR = 83
exports.NATIVE_CHAR_ORD = 84
exports.NATIVE_STRING_CHARAT = 85
exports.NATIVE_STRING_COMPARE = 86
exports.NATIVE_STRING_EQUAL = 87
exports.NATIVE_STRING_FROM_CHARARRAY = 88
exports.NATIVE_STRING_FROMBOOL = 89
exports.NATIVE_STRING_FROMCHAR = 90
exports.NATIVE_STRING_FROMINT = 91
exports.NATIVE_STRING_JOIN = 92
exports.NATIVE_STRING_LENGTH = 93
exports.NATIVE_STRING_SUB = 94
exports.NATIVE_STRING_TERMINATED = 95
exports.NATIVE_STRING_TO_CHARARRAY = 96
exports.NATIVE_STRING_TOLOWER = 97

callbacks = {};
callbacks[exports.NATIVE_STRING_LENGTH] =
    function(args) {
        return args[0].length;
    };

callbacks[exports.NATIVE_STRING_TO_CHARARRAY] =
    function(args, vm) {
        var address = vm.heap.length;
        vm.heap.push(args[0].length+1);
        vm.heap.push(1);
        for (var i = 0; i < args[0].length; i++) {
            vm.heap.push(args[0][i]);
        }
        vm.heap.push(0);
        return address;
    };


callbacks[exports.NATIVE_STRING_FROM_CHARARRAY] =
    function(args, vm) {
        var i = args[0] + 2;
        var result = "";
        while (vm.heap[i] !== 0) {
            result += vm.heap[i];
            i++;
        }
        return result;
    };

callbacks[exports.NATIVE_CHAR_CHR] =
    function(args) {
        return String.fromCharCode(args[0]);
    };

callbacks[exports.NATIVE_CHAR_ORD] =
    function(args) {
        if (typeof args[0] == "string")
            return args[0].charCodeAt(0);
        return args[0];
    };

callbacks[exports.NATIVE_STRING_COMPARE] = function(args) {
  if (args[0] < args[1]) return -1;
  if (args[0] > args[1]) return 1;
  return 0;
}

callbacks[exports.NATIVE_STRING_EQUAL] = function(args) {
  return args[0] === args[1];
}

exports.default_callbacks = callbacks;

},{}],4:[function(require,module,exports){
op = require("./opcodes");

var INT_MIN = 0x80000000;
var INT_MAX = 0x7FFFFFFF;

function log(message) {
    if (verbose) console.log(message);
}

function c0_assertion_failure(val) {
    throw ("c0 assertion failure: " + val);
}

function c0_memory_error(val) {
    throw ("c0 memory error: " + val);
}

function num_to_i32(num) {
    log("num is 0x" + num.toString(16));
    log("num & 0x7FFFFFFF is " + (num & 0x7FFFFFFF));
    log("neg factor is " + ( (num & 0x80000000)));
    return (num & 0x7FFFFFFF) + ((num & 0x80000000));
}

function i32_to_array(i32) {
    return [(i32 & 0xFF),
            ((i32 >> 8) & 0xFF),
            ((i32 >> 16) & 0xFF),
            ((i32 >> 24) & 0xFF)];
}

function array_to_i32(array) {
    return array[0] +
        (array[1] << 8) +
        (array[2] << 16) +
        (array[3] << 24);
}

var StackFrame = function(file, f) {
    log("Creating stack frame");
    this.stack = [];
    this.pc = 0;
    this.program = f.code;
    this.function_id = f.function_id;
    this.variables = [];
    for (var i = 0; i < f.num_vars; i++)
        this.variables.push(0);
    this.file = file;
}

var ProgramState = function(parsed_file, callback_dict) {
    log("Creating program state with file " + parsed_file);
    var main_function = parsed_file.function_pool[0];

    this.frame = new StackFrame(parsed_file, parsed_file.function_pool[0]);
    this.call_stack = [];
    this.file = parsed_file;

    this.natives = {};

    for (var i = 0; i < 95; i++) {
        try {
            this.natives[i] = callback_dict[i];
        } catch (key_not_found) {
            this.natives[i] = function (arg) {
                console.log("Native function " + name + " called, ran method stub.");
                return 0;
            };
        }
    }

    this.breakpoints = [];

    // Memory is just a big array of bytes, right?
    // "Allocation" is appending onto this array
    // A pointer to memory is an index into this array.

    // Structs are stored as themselves
    // Arrays are stored as an entry for the number of elements
    // and then the array, byte-by-byte
    this.heap = [];
}

ProgramState.prototype.push = function(val) {
    this.frame.stack.push(val);
}

ProgramState.prototype.pop = function() {
    if (this.frame.stack === [])
        throw "Tried to pop from an empty stack!";
    return this.frame.stack.pop();
}

ProgramState.prototype.goto_offset = function() {
    var c1 = this.frame.program[this.frame.pc+1];
    var c2 = this.frame.program[this.frame.pc+2]

    var address_offset = (c1 << 8) + c2;
    // Handle negative values
    if ((address_offset & 0x8000) != 0)
        address_offset = -0x8000 + (address_offset & 0x7FFF);

    this.frame.pc += address_offset;
}

ProgramState.prototype.doIf = function(f) {
    var y = this.pop();
    var x = this.pop();
    if (f(x,y)) {
        this.goto_offset();
    } else {
        this.frame.pc += 3;
    }
}

ProgramState.prototype.step = function() {
    var opcode = this.frame.program[this.frame.pc]
    log("0x" + this.frame.pc.toString(16) + " Running opcode " +
        op.lookup_table[opcode]);
    switch (opcode) {
        // Stack manipulation
    case op.POP:
        this.frame.pc++;
        this.pop();
        break;
    case op.DUP:
        this.frame.pc++;
        var v = this.pop();
        this.push(v);
        this.push(v);
        break;
    case op.SWAP:
        this.frame.pc++;
        var v1 = this.pop();
        var v2 = this.pop();
        this.push(v1);
        this.push(v2);
        break;
    case op.BIPUSH:
        this.frame.pc += 2;
        var val = this.frame.program[this.frame.pc-1];

        // Do sign extension if necessary
        if ((val & 0x80) != 0)
            val = -0x80 + (val & 0x7F);
        this.push(val);
        break;

        // Returning from a function
    case op.RETURN:
        var retVal = this.pop();
        if (this.call_stack.length == 0)
            return retVal;

        this.frame = this.call_stack.pop();
        this.push(retVal);

        break;
        // Arithmetic
    case op.IADD:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        log("Adding " + x + " and " + y);
        this.push(num_to_i32(x+y));
        break;
    case op.ISUB:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        log("Subtracting " + x + " and " + y);
        this.push(num_to_i32(x-y));
        break;
    case op.IMUL:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        this.push(num_to_i32(x*y));
        break;
    case op.IDIV:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        if (y == 0) c0_arith_error("Divide by zero");
        if (x == INT_MIN && y == -1) c0_arith_error("Arithmetic overflow");

        // This does int division.
        // As I understand it, the ~~ is treated as the identity on integers
        // which forces the type to int, not float
        this.push(~~(x/y));
        break;
    case op.IREM:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        if (y == 0) c0_arith_error("Divide by zero");
        if (x == INT_MIN && y == -1) c0_arith_error("Arithmetic overflow");
        this.push(x%y);
        break;
    case op.IAND:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        this.push(x&y);
        break;
    case op.IOR:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        this.push(x|y);
        break;
    case op.IXOR:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        this.push(x^y);
        break;
    case op.ISHL:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        if (y < 0 || y > 31) c0_arith_error("Shifting by too many bits");
        this.push(x<<y);
        break;
    case op.ISHR:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        if (y < 0 || y > 31) c0_arith_error("Shifting by too many bits");
        this.push(x>>y);
        break;

        // Operations on local variables

    case op.VLOAD:
        this.frame.pc += 2;
        var index = this.frame.program[this.frame.pc-1];
        this.push(this.frame.variables[index]);
        break;
    case op.VSTORE:
        this.frame.pc += 2;
        var index = this.frame.program[this.frame.pc-1];
        var val = this.pop();
        this.frame.variables[index] = val;
        log("Set variable " + index + " to value " + val);
        break;
    case op.ACONST_NULL:
        this.frame.pc++;
        this.push(0);
        break;
    case op.ILDC:
        this.frame.pc += 3;
        var c1 = this.frame.program[this.frame.pc-2];
        var c2 = this.frame.program[this.frame.pc-1];
        var index = (c1 * 0x1000) + c2;

        this.push(this.file.int_pool[index]);
        break;
    case op.ALDC:
        this.frame.pc += 3;
        var c1 = this.frame.program[this.frame.pc-2];
        var c2 = this.frame.program[this.frame.pc-1];
        var index = (c1 * 0x1000) + c2;

        this.push(this.file.string_from_index(index));
        break;

        // Control flow
    case op.NOP:
        this.frame.pc++;
        break;
    case op.IF_CMPEQ:
        this.doIf(function (x,y) {return y == x;});
        break;
    case op.IF_CMPNE:
        this.doIf(function (x,y) {return y != x;});
        break;
    case op.IF_ICMPLT:
        this.doIf(function (x,y) {return y > x;});
        break;
    case op.IF_ICMPGE:
        this.doIf(function (x,y) {return y <= x;});
        break;
    case op.IF_ICMPGT:
        this.doIf(function (x,y) {return y < x;});
        break;
    case op.IF_ICMPLE:
        this.doIf(function (x,y) {return y >= x;});
        break;
    case op.GOTO:
        this.goto_offset();
        break;
    case op.ATHROW:
        this.frame.pc++;
        c0_user_error(this.pop());
        break;
    case op.ASSERT:
        this.frame.pc++;
        var a = this.pop();
        if (this.pop() == 0)
            c0_assertion_failure(a);
        break;

        // Function call operations

    case op.INVOKESTATIC:
        var c1 = this.frame.program[this.frame.pc+1];
        var c2 = this.frame.program[this.frame.pc+2];
        this.frame.pc += 3;

        var index = (c1 << 8) + c2;

        var f = this.file.function_pool[index];
        var newFrame = new StackFrame(this.file, f);
        for (var i = f.num_args - 1; i >= 0; i--) {
            newFrame.variables[i] = this.pop();
        }

        this.call_stack.push(this.frame);
        this.frame = newFrame;
        break;

    case op.INVOKENATIVE:
        var c1 = this.frame.program[this.frame.pc+1];
        var c2 = this.frame.program[this.frame.pc+2];
        this.frame.pc += 3;

        var index = (c1 << 8) + c2;

        var f = this.file.native_pool[index];
        var arg_array = [];
        for (var i = f.num_args - 1; i >= 0; i--)
            arg_array[i] = this.pop();

        var native_function = this.natives[f.function_table_index];
        if (native_function === undefined) {
            native_function = function (ignored) {
                console.log("Could not find native function with index " +
                            f.function_table_index);
                return 0;
            };
            console.log("Unknown native function index " + f.function_table_index);
        }
        log("Calling native function with index " + index + " with arguments " +
            arg_array);
        this.push(native_function(arg_array, this));
        break;

        // Memory allocation operations:

    case op.NEW:
        var size = this.frame.program[this.frame.pc+1];
        var address = this.heap.length;

        for (var i = 0; i < size; i++) this.heap.push(0);

        this.push(address);
        this.frame.pc += 2;
        break;

    case op.NEWARRAY:
        var size = this.frame.program[this.frame.pc+1];
        var address = this.heap.length;
        var num_elements = this.pop();
        if (num_elements < 0) c0_memory_error("Array size must be nonnegative");

        this.heap.push(num_elements);
        this.heap.push(size);

        for (var i = 0; i < num_elements; i++) {
            for (var j = 0; j < size; j++)
                this.heap.push(0);
        }

        this.push(address);
        this.frame.pc += 2;
        break;

    case op.ARRAYLENGTH:
        var pointer = this.pop();
        this.push(this.heap[pointer]);
        break;

        // Memory access operations:

    case op.AADDF:
        // Read offset into a struct
        var offset = this.frame.program[this.frame.pc + 1];
        var index = this.pop();
        this.push(index + offset);
        this.frame.pc += 2;
        break;

    case op.AADDS:
        // Read offset into an array
        var elt_index = this.pop();
        var index = this.pop();

        if (typeof index == "string") {
            this.push(index.slice(elt_index));
        } else {
            var array_length = this.heap[index];
            var elt_size = this.heap[index+1];
            if (elt_index >= array_length)
                c0_memory_error("Array index out of bounds.");
            this.push(index + 2 + (elt_size*elt_index));
        }
        this.frame.pc++;
        break;

    case op.IMLOAD:
        var addr = this.pop();
        // Get int32 from bytes
        var c1 = this.heap[addr];
        var c2 = this.heap[addr+1];
        var c3 = this.heap[addr+2];
        var c4 = this.heap[addr+3];
        var combined = array_to_i32([c1, c2, c3, c4]);
        this.push(combined);
        this.frame.pc++;
        break;

    case op.IMSTORE:
        var value = this.pop();
        var addr = this.pop();
        var array = i32_to_array(value);

        for (var i = 0; i < 4; i++)
            this.heap[addr + i] = array[i];
        this.frame.pc++;
        break;

    case op.AMLOAD:
        var addr = this.pop();
        this.push(this.heap[addr]);
        this.frame.pc++;
        break;

    case op.AMSTORE:
        var value = this.pop();
        var addr = this.pop();
        this.heap[addr] = value;
        this.frame.pc++;
        break;

    case op.CMLOAD:
        var addr = this.pop();
        if (typeof addr == "string")
            this.push(addr);
        else
            this.push(this.heap[addr]);
        this.frame.pc++;
        break;

    case op.CMSTORE:
        var value = this.pop();
        var addr = this.pop();
        this.heap[addr] = value;
        this.frame.pc++;
        break;

    default:
        var opcode_name;
        try {
            opcode_name = op.lookup_table[opcode];
        } catch (ignored) {
            opcode_name = "UNKNOWN";
        }
        console.log("Error: Unknown opcode: 0x" + opcode.toString(16) +
                    " (" + opcode_name + ")\n");
        throw "Error - unknown opcode";
    }
}

ProgramState.prototype.set_breakpoint = function(function_index, opcode_index) {
    this.breakpoints.push([function_index, opcode_index]);
}

function initialize_vm(file, callbacks, v) {
    verbose = typeof v !== 'undefined' ? v : true;
    log("Initializing with file " + file);

    var state = new ProgramState(file, callbacks);

    if (verbose) log(file);

    log("Beginning execution");

    return state;
}

function run_vm(vm) {
    while (true) {
        for (breakpoint in vm.breakpoints) {
            if (vm.frame.function_id == breakpoint[0] &&
                vm.frame.pc == breakpoint[1]) {
                console.log("Breakpoint reached!");
                return vm;
            }
        }

        var val = vm.step();
        if (val !== undefined) return val;

        if (verbose) {
            console.log("Machine vm:");
            console.log("  Current Stack Frame:");
            console.log("    Stack: " + vm.frame.stack);
            console.log("    PC:    " + vm.frame.pc);
            console.log("    Vars:  " + vm.frame.variables);
            // console.log("    Code:  " + vm.frame.program);
            console.log("  Heap: " + vm.heap);
        }
    }
}

        // if (at_breakpoint) {
        //   save state (maybe in a global in this file?)
        //   return;
        // }
// Takes in a parsed .bc0 file and runs it
function execute(file, callbacks, v) {
    var state = initialize_vm(file, callbacks, v);
    return run_vm(state);
}

function push(v) {
  console.log("Pretend I pushed " + v);
}


exports.execute = execute;
exports.initialize_vm = initialize_vm;
exports.run_vm = run_vm;
exports.push = push;

},{"./opcodes":6}],5:[function(require,module,exports){
parser = require("./bytecode-parser");
c0vm = require("./c0vm.js");
c0ffi = require("./c0ffi.js");

// UI interaction functions

function print(arg) {
  $("#output").val($("#output").val() + arg);
}

callbacks = c0ffi.default_callbacks;

// conio
  callbacks[c0ffi.NATIVE_PRINT] = function(args) {
    print(args[0]);
    return 0;
  }
  callbacks[c0ffi.NATIVE_PRINTLN] = function(args) {
    print(args[0]);
    print("\n");
  }
  callbacks[c0ffi.NATIVE_PRINTBOOL] = function(args) {
    if (args[0])
      print("false");
    else
      print("true");
  }
  callbacks[c0ffi.NATIVE_PRINTCHAR] = function(args) {
    print(String.fromCharCode(args[0]));
  }
  callbacks[c0ffi.NATIVE_READLINE] = function(args) {
    return prompt("","");
  }
  callbacks[c0ffi.NATIVE_PRINTINT] = function(args) {
    print(args[0]);
  }

  console.log(callbacks);

$("#run").click(function() {
  var input = $("#bytecode").val().replace(/(\r\n|\n|\r)/gm,"");

  $("#output").val("");

  var file = parser.parse($("#bytecode").val());
  c0vm.execute(file, callbacks, true);
});

},{"./bytecode-parser":2,"./c0ffi.js":3,"./c0vm.js":4}],6:[function(require,module,exports){
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
    0x9F: "IF_CMPEQ",
    0xA0: "IF_CMPNE",
    0xA1: "IF_ICMPLT",
    0xA2: "IF_ICMPGE",
    0xA3: "IF_ICMPGT",
    0xA4: "IF_ICMPLE",
    0xA7: "GOTO",
    0xBF: "ATHROW",
    0xCF: "ASSERT",
    0xB8: "INVOKESTATIC",
    0xB7: "INVOKENATIVE",
    0xB0: "RETURN"
};

},{}],7:[function(require,module,exports){

},{}]},{},[4,2,1,6,3,5]);
