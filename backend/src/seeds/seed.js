/**
 * Master seed script — runs in order: admin → services → categories
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Service = require('../models/Service');
const Category = require('../models/Category');
const connectDB = require('../config/db');

const defaultAdmin = {
  name: 'Creative Gift Art',
  email: 'admin@creativegiftart.com',
  password: 'Admin@123',
  role: 'superadmin',
};

const catalogue = [
  {
    service: { name: 'Digital Invitations', description: 'Beautiful digital invitation templates for every occasion.', order: 1 },
    categories: [
      { name: 'Wedding Invitations',      description: 'Elegant wedding invitation templates.',          order: 1 },
      { name: 'Engagement Invitations',   description: 'Romantic engagement invitation templates.',       order: 2 },
      { name: 'Reception Invitations',    description: 'Stylish wedding reception invitation templates.', order: 3 },
      { name: 'Save The Date',            description: 'Save the date cards for upcoming events.',        order: 4 },
      { name: 'Birthday Invitations',     description: 'Fun birthday invitation templates for all ages.', order: 5 },
      { name: 'Baby Shower Invitations',  description: 'Sweet baby shower invitation templates.',         order: 6 },
      { name: 'Housewarming Invitations', description: 'Warm housewarming party invitation templates.',   order: 7 },
    ],
  },
  {
    service: { name: 'Wedding Website Invitations', description: 'Interactive website-style wedding invitations.', order: 2 },
    categories: [
      { name: 'Wedding Website Designs', description: 'Fully designed wedding website invitations.', order: 1 },
    ],
  },
  {
    service: { name: 'Wedding & Event Stationery', description: 'Premium stationery designs for weddings and events.', order: 3 },
    categories: [
      { name: 'Monograms',       description: 'Custom monogram designs for weddings.',            order: 1 },
      { name: 'Wedding Crests',  description: 'Elegant family and wedding crest designs.',         order: 2 },
      { name: 'Welcome Boards',  description: 'Beautiful welcome board designs for events.',       order: 3 },
      { name: 'Seating Charts',  description: 'Stylish seating chart designs for events.',         order: 4 },
      { name: 'Menu Cards',      description: 'Elegant menu card designs for wedding receptions.', order: 5 },
      { name: 'Thank You Cards', description: 'Heartfelt thank you card designs.',                 order: 6 },
    ],
  },
  {
    service: { name: 'Customized Gifts', description: 'Personalised gift designs for your loved ones.', order: 4 },
    categories: [
      { name: 'Monograms',    description: 'Custom monogram designs for gifts.',  order: 1 },
      { name: 'Photo Frames', description: 'Personalised photo frame designs.',   order: 2 },
      { name: 'Wallet Cards', description: 'Custom wallet card designs.',          order: 3 },
      { name: 'Custom Mugs',  description: 'Personalised mug designs.',            order: 4 },
      { name: 'Mousepads',    description: 'Custom mousepad designs.',             order: 5 },
      { name: 'Keychains',    description: 'Personalised keychain designs.',       order: 6 },
    ],
  },
];

const runSeed = async () => {
  await connectDB();

  console.log('\n════════════════════════════════════════════════');
  console.log('    Creative Gift Art — Master Database Seed');
  console.log('════════════════════════════════════════════════\n');

  try {
    // ── 1. Admin ─────────────────────────────────────
    console.log('👤 Seeding admin...');
    const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });
    if (existingAdmin) {
      console.log('   ⏭️  Admin already exists. Skipping.\n');
    } else {
      await Admin.create(defaultAdmin);
      console.log(`   ✅ Admin created: ${defaultAdmin.email}`);
      console.log('   ⚠️  Change the default password after first login!\n');
    }

    // ── 2. Services & Categories ─────────────────────
    console.log('🗂️  Seeding services and categories...\n');
    let svcCreated = 0, svcSkipped = 0;
    let catCreated = 0, catSkipped = 0;

    for (const entry of catalogue) {
      // Service
      let service = await Service.findOne({
        name: { $regex: new RegExp(`^${entry.service.name}$`, 'i') },
      });

      if (service) {
        console.log(`   ⏭️  Service: '${entry.service.name}' already exists`);
        svcSkipped++;
      } else {
        service = await Service.create(entry.service);
        console.log(`   ✅ Service: '${service.name}'`);
        svcCreated++;
      }

      // Categories
      for (const catData of entry.categories) {
        const existing = await Category.findOne({
          name: { $regex: new RegExp(`^${catData.name}$`, 'i') },
          serviceId: service._id,
        });

        if (existing) {
          console.log(`      ⏭️  '${catData.name}' already exists`);
          catSkipped++;
        } else {
          await Category.create({ ...catData, serviceId: service._id });
          console.log(`      ✅ '${catData.name}'`);
          catCreated++;
        }
      }
    }

    console.log('\n────────────────────────────────────────────────');
    console.log(`📊 Services  : ${svcCreated} created, ${svcSkipped} skipped`);
    console.log(`📊 Categories: ${catCreated} created, ${catSkipped} skipped`);
    console.log('\n✅ Seeding completed successfully!');
    console.log('════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

runSeed();
