/**
 * seedCategories.js
 * Seeds categories linked to their parent services.
 * Run seedServices.js first, or use the master seed.js which runs everything in order.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Service = require('../models/Service');
const Category = require('../models/Category');
const connectDB = require('../config/db');

const catalogue = [
  {
    serviceName: 'Digital Invitations',
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
    serviceName: 'Wedding Website Invitations',
    categories: [
      { name: 'Wedding Website Designs', description: 'Fully designed wedding website invitations.', order: 1 },
    ],
  },
  {
    serviceName: 'Wedding & Event Stationery',
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
    serviceName: 'Customized Gifts',
    categories: [
      { name: 'Gift Monograms',    description: 'Custom monogram designs for gifts.',  order: 1 },
      { name: 'Photo Frames', description: 'Personalised photo frame designs.',   order: 2 },
      { name: 'Wallet Cards', description: 'Custom wallet card designs.',          order: 3 },
      { name: 'Custom Mugs',  description: 'Personalised mug designs.',            order: 4 },
      { name: 'Mousepads',    description: 'Custom mousepad designs.',             order: 5 },
      { name: 'Keychains',    description: 'Personalised keychain designs.',       order: 6 },
    ],
  },
];

const seedCategories = async () => {
  await connectDB();

  try {
    let created = 0;
    let skipped = 0;

    for (const entry of catalogue) {
      const service = await Service.findOne({
        name: { $regex: new RegExp(`^${entry.serviceName}$`, 'i') },
      });

      if (!service) {
        console.log(`⚠️  Service '${entry.serviceName}' not found — skipping its categories. Run seed:services first.`);
        continue;
      }

      for (const catData of entry.categories) {
        const existing = await Category.findOne({
          name: { $regex: new RegExp(`^${catData.name}$`, 'i') },
          serviceId: service._id,
        });

        if (existing) {
          console.log(`⏭️  Skipping '${catData.name}' — already exists under '${service.name}'`);
          skipped++;
        } else {
          await Category.create({ ...catData, serviceId: service._id });
          console.log(`✅ Created '${catData.name}' under '${service.name}'`);
          created++;
        }
      }
    }

    console.log(`\n📊 Summary: ${created} created, ${skipped} skipped`);
  } catch (error) {
    console.error('❌ Category seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedCategories();
