stack = []
pc = 0;
program = [];
variables = [];

function doIf(shouldJump) {
    if (shouldJump) {
        var address_offset = (program[pc+1] * 0x1000) + program[pc+2];
        pc += address_offset;
    } else {
        pc += 3;
    }
}

// Takes in a parsed .bc0 file and runs it
function execute(file) {
    console.log("Beginning execution of file " + file);
    main_function = file.function_pool[0];
    program = main_function.code;
    for (var i = 0; i < main_function.num_vars; i++)
        variables.push(0);
    while (true) {
        console.log("Running opcode " + program[pc].toString(16));
        switch (program[pc]) {
            // Stack manipulation
        case POP:
            pc++;
            stack.pop();
            break;
        case DUP:
            pc++;
            var v = stack.pop();
            stack.push(v);
            stack.push(v);
            break;
        case SWAP:
            pc++;
            var v1 = stack.pop();
            var v2 = stack.pop();
            stack.push(v1);
            stack.push(v2);
            break;
        case BIPUSH:
            pc += 2;
            var val = program[pc-1];

            // Do sign extension if necessary
            if (val & 0x80 != 0)
                val = -0x80 + (val & 0x7F);
            stack.push(val);
            break;

            // Returning from a function
        case RETURN:
            var retVal = stack.pop();
            return retVal;

            // Arithmetic
        case IADD:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            console.log("Adding " + x + " and " + y);
            stack.push((x+y) % 0x100000000);
            break;
        case ISUB:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push((x-y) % 0x100000000);
            break;
        case IMUL:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push((x*y) % 0x100000000);
            break;
        case IDIV:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            if (y == 0) c0_arith_error("Divide by zero");
            if (x == INT_MIN && y == -1) c0_arith_error("Arithmetic overflow");

            // This does int division.
            // As I understand it, the ~~ is treated as the identity on integers
            // which forces the type to int, not float
            stack.push(~~(x/y));
            break;
        case IREM:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            if (y == 0) c0_arith_error("Divide by zero");
            if (x == INT_MIN && y == -1) c0_arith_error("Arithmetic overflow");
            stack.push(x%y);
            break;
        case IAND:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push(x&y);
            break;
        case IOR:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push(x|y);
            break;
        case IXOR:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push(x^y);
            break;
        case ISHL:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            if (y < 0 || y > 31) c0_arith_error("Shifting by too many bits");
            stack.push(x<<y);
            break;
        case ISHR:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            if (y < 0 || y > 31) c0_arith_error("Shifting by too many bits");
            stack.push(x>>y);
            break;

            // Operations on local variables

        case VLOAD:
            pc += 2;
            var index = program[pc-1];
            stack.push(variables[index]);
            break;
        case VSTORE:
            pc +=2 ;
            var index = program[pc-1];
            variables[index] = stack.pop();
            break;
        case ACONST_NULL:
            pc++;
            stack.push(0);
            break;
        case ILDC:
            pc += 3;
            var c1 = program[pc-2];
            var c2 = program[pc-1];
            var index = (c1 * 0x1000) + c2;

            stack.push(file.int_pool[index]);
            break;
        case ALDC:
            console.log("Error: I don't know how to handle ALDC yet");
            return;

            // Control flow
        case NOP:
            pc++;
            break;
        case IF_CMPEQ:
            var y = stack.pop();
            var x = stack.pop();
            doIf(y == x);
            break;
        case IF_CMPNE:
            var y = stack.pop();
            var x = stack.pop();
            doIf(y != x);
            break;
        case IF_CMPLT:
            var y = stack.pop();
            var x = stack.pop();
            doIf(y > x);
            break;
        case IF_CMPGE:
            var y = stack.pop();
            var x = stack.pop();
            doIf(y <= x);
            break;
        case IF_CMPGT:
            var y = stack.pop();
            var x = stack.pop();
            doIf(y < x);
            break;
        case IF_CMPLE:
            var y = stack.pop();
            var x = stack.pop();
            doIf(y >= x);
            break;
        case GOTO:
            doIf(true);
            break;
        case ATHROW:
            pc++;
            c0_user_error(stack.pop());
            break;
        case ASSERT:
            pc++;
            var a = stack.pop();
            if (stack.pop() == 0)
                c0_assertion_failure(a);
            break;

        default:
            console.log("Error: Unknown opcode\n");
            return;
        }
    }
}

exports.execute = execute;

// opcode definitions

/* arithmetic operations */
IADD = 0x60;
IAND = 0x7E;
IDIV = 0x6C;
IMUL = 0x68;
IOR = 0x80;
IREM = 0x70;
ISHL = 0x78;
ISHR = 0x7A;
ISUB = 0x64;
IXOR = 0x82;

/* stack operations */
DUP = 0x59;
POP = 0x57;
SWAP = 0x5F;

/* memory allocation */
NEWARRAY = 0xBC;
ARRAYLENGTH = 0xBE;
NEW = 0xBB;

/* memory access */
AADDF = 0x62;
AADDS = 0x63;
IMLOAD = 0x2E;
AMLOAD = 0x2F;
IMSTORE = 0x4E;
AMSTORE = 0x4F;
CMLOAD = 0x34;
CMSTORE = 0x55;

/* local variables */
VLOAD = 0x15;
VSTORE = 0x36;

/* constants */
ACONST_NULL = 0x01;
BIPUSH = 0x10;
ILDC = 0x13;
ALDC = 0x14;

/* control flow */
NOP = 0x00;
IF_CMPEQ = 0x9F;
IF_CMPNE = 0xA0;
IF_ICMPLT = 0xA1;
IF_ICMPGE = 0xA2;
IF_ICMPGT = 0xA3;
IF_ICMPLE = 0xA4;
GOTO = 0xA7;
ATHROW = 0xBF;
ASSERT = 0xCF;

/* function calls and returns */
INVOKESTATIC = 0xB8;
INVOKENATIVE = 0xB7;
RETURN = 0xB0
