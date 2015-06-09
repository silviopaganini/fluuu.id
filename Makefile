UGLIFY = /usr/local/bin/uglifyjs
VENDORS = js/vendors/

default: 
	${UGLIFY} ${VENDORS}raf.js ${VENDORS}stats.js ${VENDORS}three.js ${VENDORS}three.orbit.js ${VENDORS}wagner/Wagner.js ${VENDORS}wagner/Wagner.base.js ${VENDORS}wagner/ShaderLoader.js js/main.js -b -o js/main.min.js

# ${UGLIFY} js/v.js --compress --mangle --output js/v.min.js
# ${UGLIFY} js/main.js --compress --mangle --output js/main.min.js

compress: 
	${UGLIFY} ${VENDORS}raf.js ${VENDORS}three.js ${VENDORS}three.orbit.js ${VENDORS}wagner/Wagner.js ${VENDORS}wagner/Wagner.base.js js/main.js --compress -o js/main.min.js