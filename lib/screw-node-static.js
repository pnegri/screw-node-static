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
    params.app.respondWithNotFound( params.response );
    return true;
  }
  
  var findResource = params.request.url.replace( params.static_file, '' ).replace(/\//g,'');

  if (!this.resources[ findResource ]) {
    params.app.respondWithNotFound( params.response );
    return true;
  }

  params.request.url = params.static_file;

  this.resources[ findResource].serve( params.request, params.response,
    function (err,result) {
      if (err) {
        params.app.respondWithNotFound( params.response )
      }
    }
  );
  return true;
}

NodeStaticController.bootstrap = function( application ) {
  if (!application || !application.config || !application.config.nodeStatic || !application.config.nodeStatic.assets) return;

  this.routes = {};
  this.resources = [];

  for ( resource_name in application.config.nodeStatic.assets ) {
    var resource_config = application.config.nodeStatic.assets[ resource_name ];
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
