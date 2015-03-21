fs = require("fs");

// This is a simple, kinda hacky bytecode parser for .bc0 files
function getBytes(filename) {
    data = fs.readFileSync(filename);
    
    if (data == null) {
        if (err["code"] === "ENOENT")
            console.log("Error: file " + filename + " does not exist.");
        else
            console.log("Error: " + err);
        return;
    }

    // Data contains our file, but we want it as a string
    string_data = data.toString();

    // Strip all the comments for easier parsing
    without_comments = string_data.replace(new RegExp("#.*", "gi"), "");

    // Each byte should now be a pair of two hex digits.
    // Put all these in an array.
    bytes = [];
    without_comments.replace(
        new RegExp("([0123456789ABCDEF][0123456789ABCDEF])", "gi"),
        function(next_byte) {
            bytes.push(parseInt(next_byte, 16));
        });

    // We now have an array of bytes. That's probably everything we need, right?
    return bytes;

}

exports.getBytes = getBytes;
