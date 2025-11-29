'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const resourceData = [
      {
        id: 1,
        name: 'Oxygen Supply Tank A',
        category: 'oxygen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Water Reservoir Main',
        category: 'water',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Food Storage Unit 1',
        category: 'food',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Life Support Spare Parts',
        category: 'spare_parts',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Emergency Oxygen Reserve',
        category: 'oxygen',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Recycled Water Tank',
        category: 'water',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: 'Protein Pack Storage',
        category: 'food',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('resource_data', resourceData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('resource_data', null, {});
  }
};
