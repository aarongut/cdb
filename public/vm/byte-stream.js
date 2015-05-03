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
