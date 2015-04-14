parser = require("./bytecode-parser");
c0vm = require("./c0vm.js");
c0ffi = require("./c0ffi.js");

// console.log("Reading in sample bytecode file:");
// console.log(parser.getBytes("../test/test.bc0"));
// console.log("That was the sample bytecode file" +
//             " -- it probably took up your whole terminal screen.");
// var file = parser.parse("../test/test.bc0");
// console.log(file);
// console.log(file.function_pool[0].code);

// UI interaction functions

function print(arg) {
  $("#output").append(arg);
}

callbacks = {};
callbacks[c0ffi.NATIVE_PRINT] = function(args) {
  print(args[0]);
  print("<br />");
}

callbacks[c0ffi.NATIVE_PRINTINT] = function(args) {
  print(args[0]);
  print("<br />");
}

console.log(callbacks);

$("#run").click(function() {
  var input = $("#bytecode").html().replace(/(\r\n|\n|\r)/gm,"");
  var file = parser.parse($("#bytecode").text());
  print("<br />");
  print(c0vm.execute(file, callbacks));
});
