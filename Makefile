build:
	uglifyjs sanidate.js > sanidate-`grep @version sanidate.js | sed 's/ \* @version //'`.min.js

doc:
	cat sanidate.js | grep "^\ \+\*\ *" | sed 's| \+\* \?||' | sed 's|^/||' | grep -v '^@' > README.mkd
