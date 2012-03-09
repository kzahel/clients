rm package.zip
zip -r package.zip *.html *.js *.css css/*.css compiled/*.js js/*.js lib/*.js falcon-api/js btapp/pairing.btapp.js css/images/toolbar -x '*/.git/*' -x '*~' -x '#*#'
