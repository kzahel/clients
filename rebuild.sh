CURVER=1.6

./putinversion.py
./compile-javascript.sh
./package.sh
mkdir -p toolbar/package/$CURVER
mv package.zip toolbar/package/$CURVER
cd toolbar/package/$CURVER
git reset --hard
echo 'sleeping!'
sleep 2
git pull
unzip -o package.zip
rm package.zip
cd ../..
git add package
git commit -a -m 'new toolbar build'
echo 'sleeping!...'
sleep 2
git push
echo 'sleeping!'
sleep 2
python bumptag.py
cd ..

