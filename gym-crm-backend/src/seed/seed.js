require('dotenv').config();
const connectDB = require('../config/db');
const Gym = require('../models/Gym');
const User = require('../models/User');
const Package = require('../models/Package');

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ email: 'owner@demogym.com' });
  if (existing) {
    console.log('Demo data already exists. Skipping seed.');
    process.exit(0);
  }

  const gym = await Gym.create({
    name: 'Demo Fitness Gym',
    address: 'MG Road, Kanpur',
    phone: '9999999999',
    email: 'owner@demogym.com'
  });

  const owner = await User.create(
    {
      gym: gym._id,
      name: 'Demo Owner',
      email: 'owner@demogym.com',
      phone: '9999999999',
      password: 'password123',
      role: 'owner'
    },
    
  );

  gym.owner = owner._id;
  await gym.save();

  await Package.insertMany([
    { gym: gym._id, name: 'Monthly', durationInDays: 30, price: 1500 },
    { gym: gym._id, name: '3 Months', durationInDays: 90, price: 4000 },
    { gym: gym._id, name: '6 Months', durationInDays: 180, price: 7000 },
    { gym: gym._id, name: '1 Year', durationInDays: 365, price: 12000 }
  ]);

  console.log('Seed complete. Login with owner@demogym.com / password123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
