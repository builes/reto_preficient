'use strict';

const { faker } = require('@faker-js/faker');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const resources = [
      // Oxygen Supply Tank A
      {
        id: 1,
        quantity: faker.number.int({ min: 15000, max: 25000 }),
        criticalLevel: 5000,
        maximumLevel: 25000,
        unit: 'L',
        resourceDataId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Water Reservoir Main
      {
        id: 2,
        quantity: faker.number.int({ min: 200, max: 500 }),
        criticalLevel: 80,
        maximumLevel: 500,
        unit: 'L',
        resourceDataId: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Food Storage Unit 1
      {
        id: 3,
        quantity: faker.number.int({ min: 80, max: 180 }),
        criticalLevel: 30,
        maximumLevel: 180,
        unit: 'kg',
        resourceDataId: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Life Support Spare Parts
      {
        id: 4,
        quantity: faker.number.int({ min: 40, max: 100 }),
        criticalLevel: 20,
        maximumLevel: 100,
        unit: 'u',
        resourceDataId: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Emergency Oxygen Reserve
      {
        id: 5,
        quantity: faker.number.int({ min: 8000, max: 15000 }),
        criticalLevel: 3000,
        maximumLevel: 15000,
        unit: 'L',
        resourceDataId: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Recycled Water Tank
      {
        id: 6,
        quantity: faker.number.int({ min: 100, max: 300 }),
        criticalLevel: 50,
        maximumLevel: 300,
        unit: 'L',
        resourceDataId: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Protein Pack Storage
      {
        id: 7,
        quantity: faker.number.int({ min: 40, max: 100 }),
        criticalLevel: 15,
        maximumLevel: 100,
        unit: 'kg',
        resourceDataId: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('resources', resources, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('resources', null, {});
  }
};
