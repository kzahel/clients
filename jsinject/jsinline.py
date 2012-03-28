import sys
import getopt
import fileinput

def main():
    input_file_name = ''
    output_file_name = 'default.out'
    script_var_name = None

    print 'ARGV      :', sys.argv[1:]

    options, rem = getopt.gnu_getopt(sys.argv[1:], 'o:v', ['input=',
                                                           'output=',
                                                           'varname=',
                                                          ])
    print 'OPTIONS   :', options

    for opt, arg in options:
        if opt in ('-i', '--input'):
           input_file_name = arg
        elif opt in ('-o', '--output'):
            output_file_name = arg
        elif opt in ('-v', '--varname'):
            script_var_name = arg

    print 'INPUT     :', input_file_name
    print 'OUTPUT    :', output_file_name
    print 'NAME      :', script_var_name

    with open(input_file_name, 'r') as f:
        input_string = f.read()

    output_string = input_string.replace('\n', "\\n")
    
    if script_var_name is None:
        outstring = ''.join(["/* ", input_file_name, " */\n", 
                             "\"", output_string, "\"\n\n"])
        with open(output_file_name, 'a') as f:
            f.write(outstring)
    else :
        outstring = ''.join([script_var_name, " \"", output_string, "\",\n"])
	for line in fileinput.input(output_file_name, inplace=1):
            if script_var_name in line:
                line = outstring
            sys.stdout.write(line)

if __name__ == "__main__":
    main()