op = require("./opcodes");

var INT_MIN = 0x80000000;
var INT_MAX = 0x7FFFFFFF;

var verbose = false;
function log(message) {
    if (verbose) console.log(message);
}

function c0_assertion_failure(val) {
    throw "c0 assertion failure: " + val;
}

var StackFrame = function(file, f) {
    log("Creating stack frame");
    this.stack = [];
    this.pc = 0;
    this.program = f.code;
    this.variables = [];
    for (var i = 0; i < f.num_vars; i++)
        this.variables.push(0);
    this.file = file;
}

var ProgramState = function(parsed_file) {
    log("Creating program state with file " + parsed_file);
    var main_function = parsed_file.function_pool[0];

    this.frame = new StackFrame(parsed_file, parsed_file.function_pool[0]);
    this.call_stack = [];
    this.file = parsed_file;

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
            throw retVal;

        this.frame = this.call_stack.pop();
        this.push(retVal);

        break;
        // Arithmetic
    case op.IADD:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        log("Adding " + x + " and " + y);
        this.push((x+y) % 0x100000000);
        break;
    case op.ISUB:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        this.push((x-y) % 0x100000000);
        break;
    case op.IMUL:
        this.frame.pc++;
        var y = this.pop();
        var x = this.pop();
        this.push((x*y) % 0x100000000);
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
        console.log("y="+y+", x="+x);
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
        this.frame.variables[index] = this.pop();
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

        this.push(this.file.string_pool[index]);
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
        this.push(this.heap[index + offset]);
        this.frame.pc += 2;
        break;

    case op.AADDS:
        // Read offset into an array
        var elt_index = this.pop();
        var index = this.pop();
        var array_length = this.heap[index];
        var elt_size = this.heap[index+1];
        if (elt_index >= array_length) c0_memory_error("Array index out of bounds.");
        this.push(this.heap[index + 2 + elt_size*elt_index]);
        this.frame.pc++;
        break;

    case op.IMLOAD:
        var addr = this.pop();
        // Get int32 from bytes
        var val = this.heapdsfjsldkfjsd
        this.push(this.heap[addr]);
        this.frame.pc++;
        break;

    case op.IMSTORE:
        

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
    return false;
}

// Takes in a parsed .bc0 file and runs it
function execute(file, callbacks, v) {
    verbose = typeof v !== 'undefined' ? v : true;
    log("Initializing with file " + file);

    var state = new ProgramState(file);

    log("Beginning execution");
    
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
