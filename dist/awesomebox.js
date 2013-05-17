(function() {
  var Api, AppApi, AppsApi, Awesomebox, DomainsApi, Rest, UserApi, VersionApi, VersionsApi, encode, fs,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs');

  Rest = require('rest.node');

  encode = function(v) {
    return encodeURIComponent(v).replace('.', '%2E');
  };

  Api = {
    User: UserApi = (function() {

      function UserApi(client) {
        this.client = client;
      }

      UserApi.prototype.get = function(cb) {
        return this.client.get('/me', cb);
      };

      UserApi.prototype.create = function(data, cb) {
        return this.client.post('/users', data, cb);
      };

      UserApi.prototype.reserve = function(data, cb) {
        return this.client.post('/users/reserve', data, cb);
      };

      UserApi.prototype.destroy = function(cb) {
        return this.client["delete"]('/me', cb);
      };

      return UserApi;

    })(),
    Apps: AppsApi = (function() {

      function AppsApi(client) {
        this.client = client;
      }

      AppsApi.prototype.list = function(cb) {
        return this.client.get('/apps', cb);
      };

      AppsApi.prototype.create = function(name, cb) {
        return this.client.post('/apps', {
          name: name
        }, cb);
      };

      return AppsApi;

    })(),
    App: AppApi = (function() {

      function AppApi(client, app) {
        this.client = client;
        this.app = app;
        this.domains = new Api.Domains(this.client, this.app);
        this.versions = new Api.Versions(this.client, this.app);
      }

      AppApi.prototype.get = function(cb) {
        return this.client.get("/apps/" + (encode(this.app)), cb);
      };

      AppApi.prototype.update = function(file, cb) {
        var req;
        req = this.client.put("/apps/" + (encode(this.app)), cb);
        req.form().append('file', fs.createReadStream(file));
        return req.on('error', cb);
      };

      AppApi.prototype.version = function(version) {
        return new Api.Version(this.client, this.app, version);
      };

      return AppApi;

    })(),
    Domains: DomainsApi = (function() {

      function DomainsApi(client, app) {
        this.client = client;
        this.app = app;
      }

      DomainsApi.prototype.list = function(cb) {
        return this.client.get("/apps/" + (encode(this.app)) + "/domains", cb);
      };

      DomainsApi.prototype.add = function(domain, cb) {
        return this.client.post("/apps/" + (encode(this.app)) + "/domains", {
          domain: domain
        }, cb);
      };

      DomainsApi.prototype.remove = function(domain, cb) {
        return this.client["delete"]("/apps/" + (encode(this.app)) + "/domains/" + (encode(domain)), cb);
      };

      return DomainsApi;

    })(),
    Versions: VersionsApi = (function() {

      function VersionsApi(client, app) {
        this.client = client;
        this.app = app;
      }

      VersionsApi.prototype.list = function(cb) {
        return this.client.get("/apps/" + (encode(this.app)) + "/versions", cb);
      };

      VersionsApi.prototype.remove = function(version, cb) {
        return this.client["delete"]("/apps/" + (encode(this.app)) + "/versions/" + (encode(version)), cb);
      };

      return VersionsApi;

    })(),
    Version: VersionApi = (function() {

      function VersionApi(client, app, version) {
        this.client = client;
        this.app = app;
        this.version = version;
        ({
          start: function(cb) {
            return this.client.post("/apps/" + (encode(this.app)) + "/versions/" + (encode(this.version)) + "/start", cb);
          },
          stop: function(cb) {
            return this.client.post("/apps/" + (encode(this.app)) + "/versions/" + (encode(this.version)) + "/stop", cb);
          }
        });
      }

      return VersionApi;

    })()
  };

  Awesomebox = (function(_super) {

    __extends(Awesomebox, _super);

    Awesomebox.hooks = {
      json: function(request_opts, opts) {
        var _ref;
        if ((_ref = request_opts.headers) == null) {
          request_opts.headers = {};
        }
        return request_opts.headers.Accept = 'application/json';
      },
      api_key: function(api_key) {
        return function(request_opts, opts) {
          var _ref;
          if ((_ref = request_opts.headers) == null) {
            request_opts.headers = {};
          }
          return request_opts.headers['x-awesomebox-key'] = api_key;
        };
      },
      email_password: function(email, password) {
        return function(request_opts, opts) {
          return request_opts.auth = {
            user: email,
            pass: password
          };
        };
      },
      get: function(request_opts, opts) {
        return request_opts.qs = opts;
      },
      post: function(request_opts, opts) {
        return request_opts.form = opts;
      }
    };

    function Awesomebox(options) {
      this.options = options != null ? options : {};
      Awesomebox.__super__.constructor.call(this, {
        base_url: this.options.base_url || 'http://api.awesomebox.es'
      });
      this.hook('pre:request', Awesomebox.hooks.json);
      if (this.options.api_key != null) {
        this.hook('pre:request', Awesomebox.hooks.api_key(this.options.api_key));
      }
      if ((this.options.email != null) && (this.options.password != null)) {
        this.hook('pre:request', Awesomebox.hooks.email_password(this.options.email, this.options.password));
      }
      this.hook('pre:post', Awesomebox.hooks.post);
      this.hook('pre:get', Awesomebox.hooks.get);
      this.user = new Api.User(this);
      this.apps = new Api.Apps(this);
    }

    Awesomebox.prototype.app = function(app) {
      return new Api.App(this, app);
    };

    return Awesomebox;

  })(Rest);

  module.exports = Awesomebox;

}).call(this);
