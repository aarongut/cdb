fs = require("fs");
byte_stream = require("./byte-stream");

// This is a simple, kinda hacky bytecode parser for .bc0 files
// Now takes in raw bytecode
function getBytes(data) {
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
    return bytes;

}

function getLineNumbers(data) {
    var string_data = data.toString();

    // Strip all the comments for easier parsing
    var without_comments = string_data.replace(new RegExp("#.*", "gi"), "");

    // Each byte should now be a pair of two hex digits.
    // Put all these in an array.
    var lines = without_comments.split("\n");
    var line_numbers = [];
    for (var line_number = 0; line_number < lines.length; line_number++ ) {
        lines[line_number].replace(
            new RegExp("([0123456789ABCDEF][0123456789ABCDEF])", "gi"),
            function(next_byte) {
                // +1 because lines start at 1, for some weird reason.
                // Who doesn't start counting at 0?
                line_numbers.push(line_number+1);
            });
    }
    return line_numbers;
}

var FunctionInfo = function (stream) {
    this.num_args = stream.get_u2();
    this.num_vars = stream.get_u2();
    this.code_length = stream.get_u2();
    this.code_byte_offset = stream.index;
    this.code = stream.get_bytes(this.code_length);
}

var NativeInfo = function (stream) {
    this.num_args = stream.get_u2();
    this.function_table_index = stream.get_u2();
}

var Bc0File = function (bytecode) {
    var file = getBytes(bytecode);
    this.line_numbers = getLineNumbers(bytecode);
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

Bc0File.prototype.line_for_indices = function(function_index, byte_offset) {
    var offset_in_file = this.function_pool[function_index].code_byte_offset + 
        byte_offset;
    return this.line_numbers[offset_in_file];
}

Bc0File.prototype.indicies_for_line = function(line) {
    // Performs a linear search through the (bytecode to line number) map
    // to find the bytecode offsets corresponding to a line number
    var function_index = 0;
    while (function_index < this.function_pool.length - 1) {
        var function_start = this.function_pool[function_index + 1].code_byte_offset;
        if (this.line_numbers[function_start] > line) break;
        function_start++;
    }

    // function_index should now be set to the index of the function containing our line
    var f = this.function_pool[function_index];
    var offset = 0;
    while (offset < f.code.length - 1) {
        if (this.line_numbers[f.code_byte_offset + offset] > line) break;
        offset++;
    }
    return [function_index, offset];
}

function parse(bytecode) {
    return new Bc0File(bytecode);
}

function parseFile(filename) {
    var data = fs.readFileSync(filename);
    
    if (data == null) {
        if (err["code"] === "ENOENT")
            console.log("Error: file " + filename + " does not exist.");
        else
            console.log("Error: " + err);
        return;
    }

    return parse(data);
}

exports.getBytes = getBytes;
exports.parse = parse;
exports.parseFile = parseFile;
