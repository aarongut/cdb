FILES = c0vm.js bytecode-parser.js byte-stream.js opcodes.js c0ffi.js index.js

all: $(FILES)
	browserify $(FILES) -o vm.js

clean:
	rm -f vm.js
