require('dotenv').config();
const axios = require('axios');

const port = process.env.PORT || 5000;

const testFilters = async () => {
  try {
    console.log('🧪 Testing product filters...\n');
    
    const tests = [
      { name: 'All products', url: `http://localhost:${port}/api/products` },
      { name: 'Best sellers', url: `http://localhost:${port}/api/products?isBestSeller=true` },
      { name: 'New arrivals', url: `http://localhost:${port}/api/products?isNewArrival=true` },
      { name: 'Featured', url: `http://localhost:${port}/api/products?isFeatured=true` },
      { name: 'Bánh products', url: `http://localhost:${port}/api/products?mainCategory=bánh` },
      { name: 'Nước products', url: `http://localhost:${port}/api/products?mainCategory=nước` }
    ];
    
    for (const test of tests) {
      try {
        const response = await axios.get(test.url);
        console.log(`✅ ${test.name}: ${response.data.products.length} products`);
        
        // Show first few product names for verification
        if (response.data.products.length > 0) {
          const names = response.data.products.slice(0, 3).map(p => p.name).join(', ');
          console.log(`   Examples: ${names}${response.data.products.length > 3 ? '...' : ''}\n`);
        } else {
          console.log('   No products found\n');
        }
      } catch (err) {
        console.log(`❌ ${test.name}: Error - ${err.message}\n`);
      }
    }
  } catch (error) {
    console.error('❌ General Error:', error.message);
  }
};

testFilters();
