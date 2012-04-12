#!/usr/bin/env python
data = open('js/config.js').read()
i1 = data.find('UTORRENT_CONTROL_VERSION')
i2 = data.find('=', i1)
i3 = data.find(';', i2)
v = data[i2+1:i3].strip()
print 'version found',v


for filename in ['add',
                 'client',
                 'clients',
                 'login',
                 'pairing',
                 'torrent',
                 'torrents',
                 'uquest']:

    fo = open('%s.html' % filename)
    data = fo.read()
    fo.close()

    #print 'data','\n'.join(data.split('\n')[:20])

    def replace_versions_with_current(data):
        i = 0
        s1 = '.js?v='
        while True:
            i1 = data.find(s1, i)
            if i1 == -1:
                print 'no more scripts found'
                break
            i2 = data.find('"></script>', i1)
            i = i2
            print 'replaced js ver'
            data = data[ : i1 + len(s1) ] + v + data[ i2 : ]
        return data

    def replace_versions_css_with_current(data):
        i = 0
        s1 = '.css?v='
        while True:
            i1 = data.find(s1, i)
            if i1 == -1:
                print 'no more css found'
                break
            i2 = data.find('>', i1)
            i = i2
            print 'replaced css ver'
            data = data[ : i1 + len(s1) ] + v + data[ i1 + len(s1) + len(v) : ]

        return data


    newdata = replace_versions_with_current(data)
    newdata = replace_versions_css_with_current(newdata)


    print 'output is ','\n'.join(newdata.split('\n')[:20])

    fo = open('%s.html' % filename, 'w')
    fo.write(newdata)
    fo.close()
