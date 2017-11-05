var express = require('express')
  , logger = require('morgan')
  , app = express()
  , bodyParser = require('body-parser')
  , expressValidator = require('express-validator')
  , pg = require('pg')
  , format = require('pg-format')
  , encrypting = require(__dirname + '/encrypting.js')
  , configFile = require(__dirname + '/config.js')
  , config = {
      user: configFile.username,
      password: configFile.password,
      database: configFile.database,
      max: configFile.max,
      idleTimeoutMillis: configFile.idleTimeoutMillis
    }
  , pool = new pg.Pool(config)
  , dbClient
  , pug = require('pug')
  , homePage = pug.compileFile(__dirname + '/source/templates/home.pug')
  , aboutPage = pug.compileFile(__dirname + '/source/templates/about.pug')
  , standingsPage = pug.compileFile(__dirname + '/source/templates/standings.pug')
  , cupPage = pug.compileFile(__dirname + '/source/templates/cup.pug')
  , teamsPage = pug.compileFile(__dirname + '/source/templates/teams.pug')
  , playersPage = pug.compileFile(__dirname + '/source/templates/players.pug')
  , registerPage = pug.compileFile(__dirname + '/source/templates/register.pug')
  , loginPage = pug.compileFile(__dirname + '/source/templates/login.pug')


pool.connect(function (err, client, done) {
  if (err) throw err
  dbClient = client
})

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(expressValidator())

app.get('/', function (req, res, next) {
  try {
    var html = homePage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/about', function (req, res, next) {
  try {
    var html = aboutPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/standings', function (req, res, next) {
  try {
    var html = standingsPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/cup', function (req, res, next) {
  try {
    var html = cupPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/teams', function (req, res, next) {
  try {
    var html = teamsPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/players', function (req, res, next) {
  try {
    var html = playersPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/register', function (req, res, next) {
  try {
    var html = registerPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/login', function (req, res, next) {
  try {
    var html = loginPage()
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.post('/register', function (req, res) {
  try {
    req.checkBody('username', 'Username may only contain alphanumeric characters.').isAlphanumeric()
    req.checkBody('email', 'Invalid email.').isEmail()
    req.checkBody('password', 'Password must be at least 6 characters long.').isLength({min:6})
    req.checkBody('confirmPassword', 'Passwords do not match.').matches(req.body.password)

    var errors = req.validationErrors()
    if (errors) {
      res.render('/register', { errors: errors })
      return
    }else {
      username = req.body.username
      email = req.body.email
      pw = req.body.password
      pw2 = req.body.confirmPassword

      if (dbClient) {
        hashedPassword = encrypting.saltHashPassword(pw)
        query = format('INSERT INTO users (email, username, password, salt) \
                        VALUES (%1$L, %2$L, %3$L, %4$L)', email, username, hashedPassword.hash, hashedPassword.salt)
        dbClient.query(query, function (err, result) {
          if (err) {
            throw err
          }else {
            res.redirect('/login')
          }
        })
      }else { console.log('dbClient unavailable'); return false }
    }
  } catch (e) {
    throw e
  }
})

app.post('/login', function (req, res) {
  try {
    username = req.body.username
    pw = req.body.password

    if (dbClient) {
      query = format('SELECT * FROM users WHERE username = %1$L;', username)
      dbClient.query(query, function (err, result) {
        if (err) {
          throw err
        }else if (result.rows[0]) {
          user = result.rows[0]
          salt = user.salt
          hashedPassword = user.password
          hashedPW = encrypting.sha512(pw, salt).passwordHash
          if (hashedPassword == hashedPW) {
            console.log('Login successful!')
            res.redirect('/')
          }else {
            console.log('Login unsuccessful!')
            res.redirect('/login')
          }
        }else {
            console.log('Login unsuccessful!')
            res.redirect('/login')
          }
      })
    }
  }catch (e) {
    throw e
  }
})

function getUsers(username) {
  query = format('SELECT * FROM users WHERE username = %1$L;', username)
  var users;
  dbClient.query(query, function (err, result) {
    if (err) {
      throw err
    }else {
      users = result.rows
    }
  })
  return users
}

app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})