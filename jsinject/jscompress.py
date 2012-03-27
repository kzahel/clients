import getopt
import sys
import fileinput

def replaceAll(file,searchExp,replaceExp):
    for line in fileinput.input(file, inplace=1):
        if searchExp in line:
            line = line.replace(searchExp,replaceExp)
        sys.stdout.write(line)

def main():
    input_file = ''
    output_filename = 'default.out'
    script_var_name = None

    print 'ARGV      :', sys.argv[1:]

    options, rem = getopt.gnu_getopt(sys.argv[1:], 'o:v', ['input=',
                                                           'output=',
                                                           'varname=',
                                                          ])
    print 'OPTIONS   :', options

    for opt, arg in options:
        if opt in ('-i', '--input'):
           input_file = arg
        elif opt in ('-o', '--output'):
            output_filename = arg
        elif opt in ('-v', '--varname'):
            script_var_name = arg

    print 'INPUT     :', input_file
    print 'OUTPUT    :', output_filename
    print 'NAME      :', script_var_name


    linestring = open(input_file, 'r').read()
    
    if script_var_name is None:
        outstring = ''.join(["/* ", input_file, " */\n", 
                             "\"", linestring.replace('\n', "\\n"), "\"\n\n"])
        f = open(output_filename, 'a')
        f.write(outstring)
        f.close()
    else :
        outstring = ''.join([script_var_name, " \"", linestring.replace('\n', "\\n"), "\",\n"])
	for line in fileinput.input(output_filename, inplace=1):
            if script_var_name in line:
                line = outstring
            sys.stdout.write(line)

if __name__ == "__main__":
    main()