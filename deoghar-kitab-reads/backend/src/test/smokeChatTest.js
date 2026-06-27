(async ()=>{
  try {
    const base = 'http://127.0.0.1:3003'; // use explicit IPv4 to avoid name resolution issues;
    console.log('Registering Alice');
    let res = await fetch(base + '/api/users/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Alice', email: 'alicex_' + Date.now() + '@test.local', password: 'password', userType: 'buyer' }) });
    const a = await res.json();
    console.log('Alice:', a._id || JSON.stringify(a));

    console.log('Registering Bob');
    res = await fetch(base + '/api/users/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Bob', email: 'bobx_' + Date.now() + '@test.local', password: 'password', userType: 'seller' }) });
    const b = await res.json();
    console.log('Bob:', b._id || JSON.stringify(b));

    console.log('Login Alice');
    res = await fetch(base + '/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: a.email || a._id || a.email, password: 'password' }) });
    const jA = await res.json();
    const tokenA = jA.token;
    console.log('Alice token present:', !!tokenA);

    console.log('Login Bob');
    res = await fetch(base + '/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: b.email || b._id || b.email, password: 'password' }) });
    const jB = await res.json();
    const tokenB = jB.token;
    console.log('Bob token present:', !!tokenB);

    console.log('Create chat (Alice -> Bob)');
    res = await fetch(base + '/api/chat/create', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }, body: JSON.stringify({ participantIds: [jA.id || jA._id, jB.id || jB._id], bookId: null }) });
    const chat = await res.json();
    console.log('Chat:', chat._id || JSON.stringify(chat));

    const chatId = chat._id || chat.id;
    console.log('Send message as Alice');
    res = await fetch(base + `/api/chat/${chatId}/message`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` }, body: JSON.stringify({ text: 'Hello Bob from Alice' }) });
    const sendRes = await res.json();
    console.log('Send result:', JSON.stringify(sendRes));

    console.log('Fetch notifications for Bob');
    res = await fetch(base + '/api/notifications', { method: 'GET', headers: { 'Authorization': `Bearer ${tokenB}` } });
    const notifs = await res.json();
    console.log('Notifications:', JSON.stringify(notifs));

  } catch (e) {
    console.error('Test error', e);
  }
})();
