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
