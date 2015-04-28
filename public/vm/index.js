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
  state = c0vm.execute(file, callbacks, true);
  state = c0vm.initialize_vm(file, callbacks, true);
});

$("#break").click(function() {
  var input = $("#breakpoints").val().replace(/(\r\n|\n|\r)/gm,"");
  var temp = input.split(",");
  for (a in temp) {
    temp2 = temp[a].split(" ");
    state.set_breakpoint(parseInt(temp2[0], 10), parseInt(temp2[1], 10));
  }

  $("#output").val("");
  $("#breakpoints").val("");
  $("#internals").val("");
});

$("#continue").click(function () {
  c0vm.run_vm(state);
});

$("#step").click(function () {
  state.step();
});
