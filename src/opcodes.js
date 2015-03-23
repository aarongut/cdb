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
