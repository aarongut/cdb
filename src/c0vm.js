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

