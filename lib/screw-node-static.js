var Http = require('http');
var FS = require('fs');
var Url = require('url');

var NodeStatic = require('node-static');

var NodeStaticController = function() {}

NodeStaticController.get_file = function( params ) {
  /*
  params.response.writeHead( 200, {"Content-Type":"text/plain"} );
  params.response.write('Hello world');
  params.response.end();
  */
  //params.request.url = params.request.url.replace( '/cdn', '' );
  
  //params.request.url = params.static_file;
  
  if (!params.static_file) {
    params.response.respondWithNotFound()
    return true;
  }
  
  var findResource = params.request.url.replace( params.static_file, '' ).replace(/\//g,'');

  if (!this.resources[ findResource ]) {
    params.response.respondWithNotFound( );
    return true;
  }

  params.request.url = params.static_file;

  this.resources[ findResource].serve( params.request, params.response,
    function (err,result) {
      if (err) {
        params.response.respondWithNotFound(  )
      }
    }
  );
  return true;
}

NodeStaticController.bootstrap = function( application ) {

  config = require(application.config.baseDirectory + '/config/node_static.coffee');
  if (config[ application.environment() ])
  {
    config = config[ application.environment() ]
  }
  
  if (!config)
  {
    return false;
  }

  this.routes = {};
  this.resources = [];

  for ( resource_name in config.nodeStatic.assets ) {
    var resource_config = config.nodeStatic.assets[ resource_name ];
    this.routes[ '/' + resource_name + '/{static_file}' ] = 'get_file';
    this.resources[ resource_name ] = new NodeStatic.Server( resource_config.directory, resource_config.config  );
  }
}

NodeStaticController.getRoutes = function() {
  return this.routes;
}

NodeStaticController.prototype = {
  routes: {},
  resources: [],
}

module.exports = NodeStaticController;
