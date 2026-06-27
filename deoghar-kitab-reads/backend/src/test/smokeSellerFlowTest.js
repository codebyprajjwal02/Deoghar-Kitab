(async () => {
  try {
    const base = 'http://127.0.0.1:3003';
    const timestamp = Date.now();

    console.log('Registering admin user');
    let res = await fetch(base + '/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin User', email: `admin_${timestamp}@test.local`, password: 'admin123', userType: 'admin' })
    });
    const admin = await res.json();
    console.log('Admin registered:', admin._id || JSON.stringify(admin));

    console.log('Registering seller user');
    res = await fetch(base + '/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Seller User', email: `seller_${timestamp}@test.local`, password: 'seller123', userType: 'seller' })
    });
    const seller = await res.json();
    console.log('Seller registered:', seller._id || JSON.stringify(seller));

    console.log('Registering buyer user');
    res = await fetch(base + '/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Buyer User', email: `buyer_${timestamp}@test.local`, password: 'buyer123', userType: 'buyer' })
    });
    const buyer = await res.json();
    console.log('Buyer registered:', buyer._id || JSON.stringify(buyer));

    console.log('Logging in admin');
    res = await fetch(base + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: admin.email, password: 'admin123' })
    });
    const adminLogin = await res.json();
    console.log('Admin login token present:', !!adminLogin.token);

    console.log('Logging in seller');
    res = await fetch(base + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: seller.email, password: 'seller123' })
    });
    const sellerLogin = await res.json();
    console.log('Seller login token present:', !!sellerLogin.token);

    console.log('Logging in buyer');
    res = await fetch(base + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: buyer.email, password: 'buyer123' })
    });
    const buyerLogin = await res.json();
    console.log('Buyer login token present:', !!buyerLogin.token);

    console.log('Seller requests seller approval');
    res = await fetch(base + `/api/users/${seller._id}/request-seller`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerLogin.token}` },
      body: JSON.stringify({ name: 'Seller User', phone: '9876543210', location: 'Deoghar', bio: 'Selling books for students' })
    });
    const requestResponse = await res.json();
    console.log('Seller request response:', JSON.stringify(requestResponse));

    console.log('Admin approves seller');
    res = await fetch(base + `/api/users/${seller._id}/approve-seller`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminLogin.token}` }
    });
    const approveResponse = await res.json();
    console.log('Approve response:', JSON.stringify(approveResponse));

    console.log('Seller tries to create a book');
    res = await fetch(base + '/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sellerLogin.token}` },
      body: JSON.stringify({
        title: 'Physics for JEE',
        author: 'H.C. Verma',
        description: 'Second-hand book in Good condition',
        price: 250,
        category: 'ncert',
        condition: 'Good',
        images: [],
        sellerName: 'Seller User',
        contactInfo: { phone: '9876543210', email: seller.email }
      })
    });
    const bookCreate = await res.json();
    console.log('Book create response:', JSON.stringify(bookCreate));

    console.log('Buyer tries to create a book (should fail)');
    res = await fetch(base + '/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerLogin.token}` },
      body: JSON.stringify({
        title: 'Chemistry for NEET',
        author: 'O.P. Tandon',
        description: 'Buyer should not be allowed',
        price: 200,
        category: 'ncert',
        condition: 'good',
        images: [],
        sellerName: 'Buyer User',
        contactInfo: { phone: '9000000000', email: buyer.email }
      })
    });
    const buyerBook = await res.json();
    console.log('Buyer book response:', JSON.stringify(buyerBook));

    console.log('Test finished');
  } catch (error) {
    console.error('Seller flow test error:', error);
  }
})();