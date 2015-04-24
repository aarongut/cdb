parser = require("./bytecode-parser");
c0vm = require("./c0vm.js");
c0ffi = require("./c0ffi.js");

// UI interaction functions

function print(arg) {
  $("#output").val($("#output").val() + arg);
}

callbacks = c0ffi.default_callbacks;

// conio
  callbacks[c0ffi.NATIVE_PRINT] = function(args) {
    print(args[0]);
    return 0;
  }
  callbacks[c0ffi.NATIVE_PRINTLN] = function(args) {
    print(args[0]);
    print("\n");
  }
  callbacks[c0ffi.NATIVE_PRINTBOOL] = function(args) {
    if (args[0])
      print("false");
    else
      print("true");
  }
  callbacks[c0ffi.NATIVE_PRINTCHAR] = function(args) {
    print(String.fromCharCode(args[0]));
  }
  callbacks[c0ffi.NATIVE_READLINE] = function(args) {
    return prompt("","");
  }
  callbacks[c0ffi.NATIVE_PRINTINT] = function(args) {
    print(args[0]);
  }

  console.log(callbacks);

$("#run").click(function() {
  var input = $("#bytecode").val().replace(/(\r\n|\n|\r)/gm,"");

  $("#output").val("");

  var file = parser.parse($("#bytecode").val());
  c0vm.execute(file, callbacks, true);
});
