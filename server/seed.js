const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Category = require('./models/Category');
const Partner = require('./models/Partner');
const Food = require('./models/Food');

const categories = [
  { name: 'Burgers', slug: 'burgers', icon: '🍔', sortOrder: 1 },
  { name: 'Pizza', slug: 'pizza', icon: '🍕', sortOrder: 2 },
  { name: 'Sushi', slug: 'sushi', icon: '🍱', sortOrder: 3 },
  { name: 'Chinese', slug: 'chinese', icon: '🥡', sortOrder: 4 },
  { name: 'Indian', slug: 'indian', icon: '🍛', sortOrder: 5 },
  { name: 'Pasta', slug: 'pasta', icon: '🍝', sortOrder: 6 },
  { name: 'Salads', slug: 'salads', icon: '🥗', sortOrder: 7 },
  { name: 'Desserts', slug: 'desserts', icon: '🍰', sortOrder: 8 },
  { name: 'Drinks', slug: 'drinks', icon: '🥤', sortOrder: 9 },
  { name: 'Breakfast', slug: 'breakfast', icon: '🍳', sortOrder: 10 },
  { name: 'Tacos', slug: 'tacos', icon: '🌮', sortOrder: 11 },
  { name: 'Sandwiches', slug: 'sandwiches', icon: '🥪', sortOrder: 12 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await User.deleteMany({ role: { $ne: 'admin' } });

    // Seed categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@foodie.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Created admin user: admin@foodie.com / admin123');

    // Create demo partner user
    const partnerUser = await User.create({
      name: 'John\'s Kitchen',
      email: 'partner@foodie.com',
      password: 'partner123',
      role: 'partner'
    });

    const partner = await Partner.create({
      user: partnerUser._id,
      shopName: "John's Burger House",
      description: 'Best burgers in town! Made with fresh, locally-sourced ingredients.',
      cuisine: ['American', 'Burgers'],
      isApproved: true,
      isOpen: true,
      deliveryTime: { min: 20, max: 35 },
      deliveryFee: 2.99,
      minimumOrder: 10,
      rating: { average: 4.5, count: 128 }
    });
    console.log('✅ Created demo partner: partner@foodie.com / partner123');

    // Create demo customer
    await User.create({
      name: 'Demo User',
      email: 'user@foodie.com',
      password: 'user123',
      role: 'user'
    });
    console.log('✅ Created demo user: user@foodie.com / user123');

    // Create sample food items
    const burgerCat = createdCategories.find(c => c.slug === 'burgers');
    const sampleFoods = [
      {
        name: 'Classic Smash Burger',
        description: 'Double smashed patty, American cheese, special sauce, crispy lettuce, pickles',
        price: 12.99,
        category: burgerCat._id,
        partner: partner._id,
        isVeg: false,
        isFeatured: true,
        rating: { average: 4.7, count: 89 },
        images: [{ url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', public_id: 'burger1' }]
      },
      {
        name: 'Crispy Chicken Burger',
        description: 'Crispy fried chicken, coleslaw, jalapeño mayo, brioche bun',
        price: 11.99,
        category: burgerCat._id,
        partner: partner._id,
        isFeatured: true,
        rating: { average: 4.5, count: 67 },
        images: [{ url: 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?w=400', public_id: 'burger2' }]
      },
    ];

    await Food.insertMany(sampleFoods);
    console.log('✅ Created sample food items');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('  Admin:   admin@foodie.com   / admin123');
    console.log('  Partner: partner@foodie.com / partner123');
    console.log('  User:    user@foodie.com    / user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seed();
