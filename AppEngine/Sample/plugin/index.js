const
    Requester = require("./requester");


Requester.addHandler((req) => {
    if (req.request != null) {
        if (req.request.Request === 'getText') {
            req.response('Welcome from NodeJs');
            return true;
        }
    }

    req.response({error: 'Invalid request', req});
});
