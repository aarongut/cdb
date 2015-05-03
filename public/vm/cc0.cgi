#!/usr/bin/python
from subprocess import call, CalledProcessError
from urllib import quote_plus, unquote_plus
from json import dumps
import cgitb, cgi
import sys

cgitb.enable()


form = cgi.FieldStorage()

infile = open('/tmp/a.c0', 'w')
infile.write(unquote_plus(form["data"].value))
infile.close()

stderr = open('/tmp/a.err', 'w')

if call(['/afs/andrew.cmu.edu/course/15/122/bin/cc0', '-b', '/tmp/a.c0',
         '-o', '/tmp/a.bc0'], stderr=stderr, stdout=stderr) == 0:
    bytecode = open('/tmp/a.bc0', 'r')
    data = bytecode.read()
    bytecode.close()
    stderr.close()
else:
    stderr.close()
    stderr = open('/tmp/a.err', 'r')
    data  = stderr.read()
    stderr.close()


name = "test"

print("Content-type:text/json\n\n")
print dumps({"data": quote_plus(data),
             "name": quote_plus(name),
             "input": form["data"].value)})
