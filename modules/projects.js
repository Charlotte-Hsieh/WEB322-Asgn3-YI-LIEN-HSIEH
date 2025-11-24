/********************************************************************************
* WEB322 – Assignment 03
* Name: YI-LIEN HSIEH
* Student ID: 105889240
* Date: 11-23-2025
* Published URL: https://web-322-asgn3-yi-lien-hsieh.vercel.app
********************************************************************************/
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
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false }
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
  createdAt: false,
  updatedAt: false
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
  createdAt: false,
  updatedAt: false
});

Project.belongsTo(Sector, {foreignKey: 'sector_id'});

function initialize() {
  return sequelize.sync();
}

function getAllProjects() {
  return Project.findAll({ include: [Sector] });
}

function getProjectById(projectId) {
  return Project.findAll({ 
    include: [Sector], 
    where: { id: projectId } 
  }).then(data => {
    if (data.length > 0) return data[0];
    throw "Unable to find requested project";
  });
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [Sector],
    where: {
      '$Sector.sector_name$': {
        [Sequelize.Op.iLike]: `%${sector}%`
      }
    }
  }).then(data => {
    if (data.length > 0) return data;
    throw "Unable to find requested projects";
  });
}

function addProject(projectData) {
  return Project.create(projectData)
    .catch(err => {
      throw err.errors[0].message;
    });
}

function editProject(id, projectData) {
  return Project.update(projectData, { where: { id: id } })
    .catch(err => {
      throw err.errors[0].message;
    });
}

function deleteProject(id) {
  return Project.destroy({ where: { id: id } })
    .catch(err => {
      throw err.errors[0].message;
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