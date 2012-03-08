#!/bin/bash

mkdir -p compiled

if [ -f "/usr/bin/smjs" ]; then 
    js_interpreter=/usr/bin/smjs; 
elif [ -f "/usr/bin/d8" ]; then
    js_interpreter=/usr/bin/d8; 
elif [ -f "/usr/bin/js" ]; then
    js_interpreter=/usr/bin/js;
elif [ -f "/usr/local/bin/js" ]; then
    js_interpreter=/usr/local/bin/js;
elif [ -f "/opt/local/bin/js" ]; then
    js_interpreter=/opt/local/bin/js;
else
    echo "No JavaScript interpreter found."
    exit 1
fi

RETURN_VALUE=0
for module in "conduit_deps"; do
#for module in "gui/toolbar" "gui/gadget"; do
    echo compiling $module

        output=compiled/$(echo $module | sed 's/\//-/'); 
        js_list=`${js_interpreter} -e "load('lib/jsload.js', 'tags.js');var jsLoader = new JSLoad(tags, '');print('--js '+jsLoader.getSrcToLoad(['${module}']).join(' --js '));"`
	echo js list is $js_list;

    java -jar support-files/compiler.jar --compilation_level=SIMPLE_OPTIMIZATIONS --third_party=true ${js_list} --js_output_file ${output}.js
	if [ 0 -ne $? ]; then
        RETURN_VALUE=1
    fi
done
exit $RETURN_VALUE
