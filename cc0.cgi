#!/usr/bin/python
from subprocess import call, CalledProcessError
from urllib import quote, unquote
from json import dumps
import cgitb, cgi
import sys

cgitb.enable()


form = cgi.FieldStorage()

infile = open('/tmp/a.c0', 'w')
infile.write(unquote(form["data"].value))
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

print("Content-type:application/json\n\n")

print("callback(")
print dumps({"data": quote(data),
             "name": quote(name),
             "input": form["data"].value})

print(");")
