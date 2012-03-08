rm package.zip
zip -r package.zip *.html *.js *.css compiled/*.js js/*.js lib/*.js falcon-api/js/*.js btapp/pairing.btapp css/images/toolbar -x '*/.git/*' -x '*~' -x '#*#'
