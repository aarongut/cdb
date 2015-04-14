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
