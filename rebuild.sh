./putinversion.py
./compile-javascript.sh
./package.sh
mv package.zip toolbar/package
cd toolbar/package
git reset --hard
echo 'sleeping!'
sleep 2
git pull
unzip -o package.zip
rm package.zip
cd ..
git add package
git commit -a -m 'new toolbar build'
echo 'sleeping!...'
sleep 2
git push
echo 'sleeping!'
sleep 2
python bumptag.py
cd ..

