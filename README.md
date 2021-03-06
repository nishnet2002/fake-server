#fake-server

[![Build Status](https://travis-ci.org/yahoo/fake-server.svg)](https://travis-ci.org/yahoo/fake-server)

Fake-server is a generic and non-intrusive tool used to mock any server response. It has been designed to address issues when running tests against unstable or slow external servers.

===========

### How it works

The idea is to create a webserver listening in a different port and make your tests bring it up and configure how it should behave against each different request. "Configuration" can be done by posting the parameters and desired response to the server, or through configuration files inside ./default_routes/.

For every request, fake-server will try to match against the configured URIs and return the expected response.

### Advantages

- No need to instrument your code (as long as the external server endpoint is configurable :P)
- Generic enough to work with blackbox or whitebox tests.
- No database required


### Quickstart (two really basic scenarios)

Clone this repository (npm package coming soon)
> git clone git@github.com:yahoo/fake-server.git

Start (it will start a server on port 3012)
> node server.js

Let's say you want "/test"  to always return "hello" and "/foo" to return a 404. 

All you have to do is `POST` to http://localhost:3012/add/ the following data:

Configure /test by posting:
> { route: '/test',  
> responseCode: 200,  
> responseBody: "hello" }  

one of the many ways to do this is using cURL:
```
curl http://localhost:3012/add -X POST -H "Content-Type:application/json" -H "Accept:application/json"  \ 
 -d '{"route":"/test","responseCode":200,"responseBody":"hello"}' 
```

now let's configure our 404 example by sending this to the server:
> { route: '/foo',  
> responseCode: 404,  
> responseBody: "Not found" }  

using cURL:
``` 
curl http://localhost:3012/add -X POST -H "Content-Type:application/json" -H "Accept:application/json" \  
 -d '{"route":"/foo","responseCode":404,"responseBody":"Not found"}' 
```

now, in your browser you can see the results:  
http://localhost:3012/foo  
http://localhost:3012/test  


### What else can fake-server do?

Configuration is done by sending a POST request to /add or by placing a json file containing configurations inside a "routes" object (see default_routes/sample.json for reference). Here are the supported features for this version:  

##### Routes can be RegEx

This will match http://localhost:3012/news/007 as well as http://localhost:3012/news/1231293871293827:  

> { route: '/news/[0-9]'  
> responseCode: 200,  
> responseBody: 'whatever you want' }  

##### Response can be a file. In this case, fake-server will respond with the output of that file.

The following configuration example will return the output of ./mock_data/sample.json *(notice the parameter is called responseData instead of responseBody)*

> { route: '/',  
> responseCode: 200,  
> responseData: './mock_data/sample.json' }  


##### Same endpoint can have different responses 

This will return '200' in the first two requests to '/' and 403 on the third request  

> { route: '/',  
> responseCode: 200,  
> responseBody: 'ok' }  

note that I will be adding an 'at' parameter to configure the special behavior to the third request:  

> { route: '/',  
> responseCode: 403,  
> responseBody: 'Thou shall not pass!',  
> at: 3 }  


##### Delay response

The following will delay server response in one second:  

> { route: '/slow/.*',  
> responseCode: 200,  
> responseBody: 'OK',  
> delay: 1000 }  

##### Resetting server configuration

To avoid the need to restart fake-server in order to clear the configuration, we've implemented a special endpoint called `/flush`. By sending a `DELETE` request to http://localhost:3012/flush, you will erase all previously configured responses.


### Limitations
- Fake-server matches only URI, it won't work with `POST` body data (although you can `POST` to a fake URI)
- There are two reserved endpoints: POST '/add' and  `DELETE` '/flush'. These cannot be used by your application.
- There is still no support for custom headers in response or for headers in general.  


### Get in touch:  

* bigo (matheus@yahoo-inc.com)  
* julio (julionn@yahoo-inc.com)  
