stack = []
pc = 0;
program = [];
variables = [];

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
            stack.push(program[pc-1]);
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
            stack.push((x+y) % 0x100);
            break;
        case ISUB:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push((x-y) % 0x100);
            break;
        case IMUL:
            pc++;
            var y = stack.pop();
            var x = stack.pop();
            stack.push((x*y) % 0x100);
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
