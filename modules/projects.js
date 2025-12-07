// WEB322 – Assignment 3
// Student Name: YI-LIEN HSIEH
// Student ID  : 105889240
// Date        : 12-05-2025
// Section     : WEB322 NAA

require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

let sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: Sequelize.STRING
}, {
  timestamps: false
});

const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: Sequelize.STRING,
  feature_img_url: Sequelize.STRING,
  summary_short: Sequelize.TEXT,
  intro_short: Sequelize.TEXT,
  impact: Sequelize.TEXT,
  original_source_url: Sequelize.STRING
}, {
  timestamps: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({
    include: [Sector],
    order: [['id', 'ASC']]
  });
}

function getProjectById(projectId) {
  return Project.findAll({
    where: { id: projectId },
    include: [Sector]
  }).then(data => {
    if (data.length > 0) {
      return data[0];
    } else {
      throw 'Unable to find requested project';
    }
  });
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Sequelize.Op.iLike]: `%${sector}%`
      }
    },
    order: [['id', 'ASC']]
  }).then(projects => {
    if (projects.length > 0) {
      return projects;
    } else {
      throw 'Unable to find requested projects';
    }
  });
}

function addProject(projectData) {
  return new Promise((resolve, reject) => {
    Project.create(projectData)
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function editProject(id, projectData) {
  return new Promise((resolve, reject) => {
    Project.update(projectData, {
      where: { id: id }
    })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function deleteProject(id) {
  return new Promise((resolve, reject) => {
    Project.destroy({
      where: { id: id }
    })
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  editProject,
  deleteProject
};