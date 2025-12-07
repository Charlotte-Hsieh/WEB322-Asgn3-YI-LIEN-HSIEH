/********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy.
*
* Name: YI-LIEN HSIEH   Student ID: 105889240   Date: 12-05-2025
********************************************************************************/

/********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy.
*
* Name: YI-LIEN HSIEH   Student ID: 105889240   Date: 12-05-2025
*
* Published URL: ___________________________________________________
*
********************************************************************************/

require('dotenv').config();

const express = require('express');
const path = require('path');
const clientSessions = require('client-sessions');
const projectData = require('./modules/projects');

const app = express();
const PORT = process.env.PORT || 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(clientSessions({
  cookieName: 'session',
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
    return res.redirect('/login');
  }
  next();
}

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/solutions/projects', (req, res) => {
  const sector = req.query.sector;

  const source = sector
    ? projectData.getProjectsBySector(sector)
    : projectData.getAllProjects();

  source
    .then(projects => {
      res.render('projects', { projects, sector });
    })
    .catch(err => {
      res.status(404).render('404', { message: err });
    });
});

app.get('/solutions/projects/:id', (req, res) => {
  projectData.getProjectById(req.params.id)
    .then(project => {
      res.render('project', { project });
    })
    .catch(err => {
      res.status(404).render('404', { message: err });
    });
});

app.get('/solutions/addProject', ensureLogin, (req, res) => {
  res.render('addProject');
});

app.post('/solutions/addProject', ensureLogin, (req, res) => {
  projectData.addProject(req.body)
    .then(() => {
      res.redirect('/solutions/projects');
    })
    .catch(err => {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      });
    });
});

app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {
  projectData.getProjectById(req.params.id)
    .then(project => {
      res.render('editProject', { project });
    })
    .catch(err => {
      res.status(404).render('404', { message: err });
    });
});

app.post('/solutions/editProject', ensureLogin, (req, res) => {
  const id = req.body.id;

  projectData.editProject(id, req.body)
    .then(() => {
      res.redirect('/solutions/projects');
    })
    .catch(err => {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      });
    });
});

app.get('/solutions/deleteProject/:id', ensureLogin, (req, res) => {
  projectData.deleteProject(req.params.id)
    .then(() => {
      res.redirect('/solutions/projects');
    })
    .catch(err => {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`
      });
    });
});

app.get('/login', (req, res) => {
  res.render('login', { errorMessage: '', userName: '' });
});

app.post('/login', (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  if (
    userName === process.env.ADMINUSER &&
    password === process.env.ADMINPASSWORD
  ) {
    req.session.user = {
      userName: process.env.ADMINUSER
    };
    return res.redirect('/solutions/projects');
  }

  res.render('login', {
    errorMessage: 'Invalid User Name or Password',
    userName: userName
  });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.use((req, res) => {
  res.status(404).render('404', {
    message: "I'm sorry, we're unable to find what you're looking for"
  });
});

projectData.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log(`Unable to start server: ${err}`);
  });