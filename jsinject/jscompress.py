import getopt
import sys

input_file = ''
output_filename = 'default.out'

print 'ARGV      :', sys.argv[1:]

options, rem = getopt.gnu_getopt(sys.argv[1:], 'o:v', ['input=',
                                                             'output=', 
                                                             ])
print 'OPTIONS   :', options

for opt, arg in options:
    if opt in ('-i', '--input'):
       input_file = arg
    elif opt in ('-o', '--output'):
        output_filename = arg

print 'INPUT     :', input_file
print 'OUTPUT    :', output_filename

linestring = open(input_file, 'r').read()
f = open(output_filename, 'a')
f.write("/* " + input_file + " */\n\"")
f.write(linestring.replace('\n', "\\n"))
f.write("\"\n\n")
f.close()