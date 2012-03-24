var html = require('node-static');


var route = function(pathname, query, handle, res, req) {
    console.log('About to route request for ' + pathname);
    if(typeof handle[pathname] === 'function') {
        console.log(handle[pathname]);
        if(query != undefined) {
            handle[pathname](res, req, query.url);
        } else  handle[pathname](res, req);
    } else {
        var file = new(html.Server)('./webroot');
        file.serve(req, res);
    }
}

exports.route = route;