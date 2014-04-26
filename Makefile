start:
	mkdir -p logs
	NODE_ENV=$(env) forever start -a -l forever.log -o logs/out.log -e logs/error.log --minUpTime 5000 --spinSleepTime 2000 `pwd`/encoder.js

stop:
	forever stop `pwd`/encoder.js

restart:
	stop
	start

