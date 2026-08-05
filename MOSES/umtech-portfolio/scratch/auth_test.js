const fetch = require('node-fetch');
(async () => {
  // Register a new user
  const registerRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestUser', email: 'testuser123@example.com', password: 'TestPass123' })
  });
  console.log('Register status', registerRes.status);
  const regData = await registerRes.json().catch(() => ({}));
  console.log('Register data', regData);

  // Login with the new user
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testuser123@example.com', password: 'TestPass123' })
  });
  console.log('Login status', loginRes.status);
  const loginData = await loginRes.json().catch(() => ({}));
  console.log('Login data', loginData);

  // Extract auth cookie
  const setCookie = loginRes.headers.get('set-cookie');
  const cookie = setCookie ? setCookie.split(';')[0] : '';

  // Attempt to post a project (should be forbidden for a normal user)
  const projectRes = await fetch('http://localhost:3000/api/projects/manage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({
      title: 'Integration Test Project',
      description: 'A project created by integration test',
      coverImage: 'https://example.com/image.png',
      liveLink: 'https://example.com',
      techStack: ['React', 'Next.js']
    })
  });
  console.log('Project POST status', projectRes.status);
  const projData = await projectRes.json().catch(() => ({}));
  console.log('Project POST data', projData);
})();
