Awesomebox = require '../lib/awesomebox'

print = -> console.log arguments

# client = new Awesomebox()
# client.user.create {email: 'matt.insler@gmail.com'}, (err, api_key) ->
#   return console.log(err.message) if err?
#   
#   client = new Awesomebox(api_key: api_key)
#   client.user.get(print)

client = new Awesomebox(api_key: '9ef6084f1ab6afffead1182f2fea12d6fdc213fb33f49d18c97e5bd1b715929c')
client.user.get(print)
# client.app('foo').update(__dirname + '/basic.coffee', print)
