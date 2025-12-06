/********************************************************************************
* WEB322 – Assignment 03
* Name: YI-LIEN HSIEH
* Student ID: 105889240
* Date: 11-23-2025
* Published URL: https://web-322-asgn3-yi-lien-hsieh.vercel.app/
********************************************************************************/

require('dotenv').config();
const express = require('express');
const clientSessions = require('client-sessions');
const projectData = require('./modules/projects');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSIONSECRET,
  duration: 24 * 60 * 60 * 1000,
  activeDuration: 1000 * 60 * 5
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/solutions/projects', (req, res) => {
  if (req.query.sector) {
    projectData.getProjectsBySector(req.query.sector)
      .then(data => res.render('projects', { projects: data }))
      .catch(err => res.render('500', { message: err }));
  } else {
    projectData.getAllProjects()
      .then(data => res.render('projects', { projects: data }))
      .catch(err => res.render('500', { message: err }));
  }
});

app.get('/solutions/projects/:id', (req, res) => {
  projectData.getProjectById(req.params.id)
    .then(data => res.render('project', { project: data }))
    .catch(err => res.status(404).render('404', { message: err }));
});

app.get('/solutions/addProject', ensureLogin, (req, res) => {
  res.render('addProject');
});

app.post('/solutions/addProject', ensureLogin, (req, res) => {
  projectData.addProject(req.body)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {
  projectData.getProjectById(req.params.id)
    .then(data => res.render('editProject', { project: data }))
    .catch(err => res.status(404).render('404', { message: err }));
});

app.post('/solutions/editProject', ensureLogin, (req, res) => {
  projectData.editProject(req.body.id, req.body)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

app.get('/solutions/deleteProject/:id', ensureLogin, (req, res) => {
  projectData.deleteProject(req.params.id)
    .then(() => res.redirect('/solutions/projects'))
    .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
});

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: "", userName: "" });
});

app.post('/login', (req, res) => {
  if (req.body.userName === process.env.ADMINUSER && 
      req.body.password === process.env.ADMINPASSWORD) {
    req.session.user = {
      userName: process.env.ADMINUSER
    };
    res.redirect('/solutions/projects');
  } else {
    res.render('login', {
      errorMessage: 'Invalid User Name or Password',
      userName: req.body.userName
    });
  }
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).render('404', { message: "Page not found" });
});

projectData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server listening on: ${HTTP_PORT}`);
    });
  })
  .catch(err => {
    console.log(`Unable to start server: ${err}`);
  });