UGLIFY = /usr/local/bin/uglifyjs

default: compress

compress: 
	${UGLIFY} js/v.js --compress --mangle --output js/v.min.js
	${UGLIFY} js/main.js --compress --mangle --output js/main.min.js