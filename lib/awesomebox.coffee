fs = require 'fs'
Rest = require 'rest.node'

encode = (v) -> encodeURIComponent(v).replace('.', '%2E')

Api = {
  User: class UserApi
    constructor: (@client) ->
    get: (cb) -> @client.get('/me', cb)
    create: (data, cb) -> @client.post('/users', data, cb)
    reserve: (data, cb) -> @client.post('/users/reserve', data, cb)
    destroy: (cb) -> @client.delete('/me', cb)
  
  Apps: class AppsApi
    constructor: (@client) ->
    list: (cb) -> @client.get('/apps', cb)
    create: (name, cb) -> @client.post('/apps', {name: name}, cb)
  
  App: class AppApi
    constructor: (@client, @app) ->
      @domains = new Api.Domains(@client, @app)
      @versions = new Api.Versions(@client, @app)
    
    get: (cb) -> @client.get("/apps/#{encode(@app)}", cb)
    # status: (cb) -> @client.get("/apps/#{encode(@app)}/status", cb)
    # stop: (cb) -> @client.get("/apps/#{encode(@app)}/stop", cb)
    # start: (cb) -> @client.get("/apps/#{encode(@app)}/start", cb)
    # logs: (cb) -> @client.get("/apps/#{encode(@app)}/logs", cb)
    update: (file, cb) ->
      req = @client.put("/apps/#{encode(@app)}", cb)
      req.form().append('file', fs.createReadStream(file))
      req.on('error', cb)
    version: (version) -> new Api.Version(@client, @app, version)
  
  Domains: class DomainsApi
    constructor: (@client, @app) ->
    list: (cb) -> @client.get("/apps/#{encode(@app)}/domains", cb)
    add: (domain, cb) -> @client.post("/apps/#{encode(@app)}/domains", {domain: domain}, cb)
    remove: (domain, cb) -> @client.delete("/apps/#{encode(@app)}/domains/#{encode(domain)}", cb)
  
  Versions: class VersionsApi
    constructor: (@client, @app) ->
    list: (cb) -> @client.get("/apps/#{encode(@app)}/versions", cb)
    remove: (version, cb) -> @client.delete("/apps/#{encode(@app)}/versions/#{encode(version)}", cb)
  
  Version: class VersionApi
    constructor: (@client, @app, @version) ->
    start: (cb) -> @client.post("/apps/#{encode(@app)}/versions/#{encode(@version)}/start", cb)
    stop: (cb) -> @client.post("/apps/#{encode(@app)}/versions/#{encode(@version)}/stop", cb)
    status: (cb) -> @client.get("/apps/#{encode(@app)}/versions/#{encode(@version)}/status", cb)
    bless: (cb) -> @client.post("/apps/#{encode(@app)}/versions/#{encode(@version)}/bless", cb)
    logs: (cb) -> @client.get("/apps/#{encode(@app)}/versions/#{encode(@version)}/logs", cb)
}

class Awesomebox extends Rest
  @hooks:
    json: (request_opts, opts) ->
      request_opts.headers ?= {}
      request_opts.headers.Accept = 'application/json'
    
    api_key: (api_key) ->
      (request_opts, opts) ->
        request_opts.headers ?= {}
        request_opts.headers['x-awesomebox-key'] = api_key
    
    email_password: (email, password) ->
      (request_opts, opts) ->
        request_opts.auth =
          user: email
          pass: password
    
    get: (request_opts, opts) ->
      request_opts.qs = opts
    
    post: (request_opts, opts) ->
      request_opts.form = opts
  
  constructor: (@options = {}) ->
    super(base_url: @options.base_url or 'http://api.awesomebox.es')
    
    @hook('pre:request', Awesomebox.hooks.json)
    @hook('pre:request', Awesomebox.hooks.api_key(@options.api_key)) if @options.api_key?
    @hook('pre:request', Awesomebox.hooks.email_password(@options.email, @options.password)) if @options.email? and @options.password?
    @hook('pre:post', Awesomebox.hooks.post)
    @hook('pre:get', Awesomebox.hooks.get)
    
    @user = new Api.User(@)
    @apps = new Api.Apps(@)
  
  app: (app) -> new Api.App(@, app)

module.exports = Awesomebox
