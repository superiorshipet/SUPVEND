const mongoose = require('mongoose');
require('dotenv').config();

async function testCart() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Cart = require('./src/modules/cart/cart.model.js');
    const User = require('./src/modules/user/user.model.js');
    
    // Find test user
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found');
      process.exit(1);
    }
    console.log('✅ Found user:', user._id);
    
    // Try to find or create cart
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      console.log('Creating new cart...');
      cart = new Cart({
        userId: user._id,
        items: [],
        subtotal: 0,
        total: 0,
        discountAmount: 0
      });
      await cart.save();
      console.log('✅ Cart created:', cart._id);
    } else {
      console.log('✅ Cart found:', cart._id);
      console.log('Cart items:', cart.items.length);
    }
    
    console.log('\n✅ Cart test successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testCart();
