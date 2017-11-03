var express = require('express')
  , logger = require('morgan')
  , app = express()
  , jade = require('jade')
  , homePage = jade.compileFile(__dirname + '/source/templates/home.jade')
  , aboutPage = jade.compileFile(__dirname + '/source/templates/about.jade')
  , standingsPage = jade.compileFile(__dirname + '/source/templates/standings.jade')
  , cupPage = jade.compileFile(__dirname + '/source/templates/cup.jade')
  , teamsPage = jade.compileFile(__dirname + '/source/templates/teams.jade')
  , playersPage = jade.compileFile(__dirname + '/source/templates/players.jade')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))

app.get('/', function (req, res, next) {
  try {
    var html = homePage({ title: 'Home' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/about', function (req, res, next) {
  try {
    var html = aboutPage({ title: 'About' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/standings', function (req, res, next) {
  try {
    var html = standingsPage({ title: 'League Standings' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/cup', function (req, res, next) {
  try {
    var html = cupPage({ title: 'Open Cup' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/teams', function (req, res, next) {
  try {
    var html = teamsPage({ title: 'Teams' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.get('/players', function (req, res, next) {
  try {
    var html = playersPage({ title: 'Players' })
    res.send(html)
  } catch (e) {
    next(e)
  }
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})