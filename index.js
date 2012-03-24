var server =           require('./server');
var router =           require('./router');
var requestHandler  =  require('./requestHandler');


var handle = {};

handle['/upload'] = requestHandler.upload;
handle['/convert'] = requestHandler.convert;
handle['/show'] = requestHandler.show;
handle['/download'] = requestHandler.download;

server.start(router.route, handle);
