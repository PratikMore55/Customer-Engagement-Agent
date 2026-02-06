// Simple Backend Verification
// This checks if the core AI functionality is working

const API_URL = 'http://localhost:5000/api';

async function verify() {
  console.log('Backend Verification\n');

  // 1. Check server is running
  console.log('1. Checking server...');
  try {
    const health = await fetch(`${API_URL}/health`);
    const data = await health.json();
    console.log('   Server is running');
    console.log(`   Status: ${data.status}\n`);
  } catch (error) {
    console.log('   Server is not responding!');
    console.log('   Make sure to run: npm run dev\n');
    return;
  }

  // 2. Register a test user
  console.log('2. Registering test user...');
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      businessName: 'Test Business',
    }),
  });
  const registerData = await registerRes.json();
  
  if (!registerData.success) {
    console.log('   Registration failed');
    return;
  }
  
  const token = registerData.token;
  console.log('   User registered\n');

  // 3. Create a form
  console.log('3. Creating form...');
  const formRes = await fetch(`${API_URL}/forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Test Form',
      fields: [
        { label: 'Name', fieldType: 'text', required: true, order: 1, classificationWeight: 'low' },
        { label: 'Email', fieldType: 'email', required: true, order: 2, classificationWeight: 'low' },
        { label: 'Budget', fieldType: 'text', required: true, order: 3, classificationWeight: 'high' },
      ],
    }),
  });
  const formData = await formRes.json();
  
  if (!formData.success) {
    console.log('   Form creation failed');
    return;
  }
  
  const formId = formData.form._id;
  console.log('   Form created\n');

  // 4. Submit a HOT lead
  console.log('4. Submitting HOT lead...');
  const submitRes = await fetch(`${API_URL}/customers/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formId,
      responses: {
        'Name': 'Hot Lead Test',
        'Email': 'hot@test.com',
        'Budget': 'Over $50k - need this urgently ASAP!',
      },
    }),
  });
  const submitData = await submitRes.json();
  
  if (!submitData.success) {
    console.log('   Submission failed');
    return;
  }
  
  console.log('   Form submitted');
  console.log('   AI is processing in background...\n');

  // 5. Wait for AI processing
  console.log('5. Waiting 10 seconds for AI to classify...');
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`   ${i} seconds remaining...\r`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('   Wait complete\n');

  // 6. Check if lead was created
  console.log('6. Checking for classified lead...');
  const leadsRes = await fetch(`${API_URL}/leads`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const leadsData = await leadsRes.json();
  
  if (!leadsData.success || leadsData.count === 0) {
    console.log('   No leads found');
    console.log('   Check server logs for processing errors\n');
    return;
  }
  
  const lead = leadsData.leads[0];
  console.log('   Lead found!\n');

  // 7. Display AI classification results
  console.log('AI CLASSIFICATION RESULTS:');
  console.log('=================================');
  console.log(`   Classification: ${lead.classification.toUpperCase()}`);
  console.log(`   Confidence: ${(lead.confidenceScore * 100).toFixed(1)}%`);
  console.log(`   Reasoning: ${lead.reasoning}`);
  console.log('\n   Insights:');
  console.log(`   - Budget: ${lead.insights.budget}`);
  console.log(`   - Timeline: ${lead.insights.timeline}`);
  console.log(`   - Urgency: ${lead.insights.urgency}`);
  console.log(`   - Decision Maker: ${lead.insights.decisionMaker ? 'Yes' : 'No'}`);
  console.log('=================================\n');

  // 8. Check stats
  console.log('7. Getting statistics...');
  const statsRes = await fetch(`${API_URL}/leads/stats`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const statsData = await statsRes.json();
  
  console.log('   Stats retrieved\n');
  console.log('STATISTICS:');
  console.log('=================================');
  console.log(`   Total Leads: ${statsData.stats.total}`);
  console.log(`   Converted: ${statsData.stats.converted}`);
  console.log(`   Pending: ${statsData.stats.pending}`);
  console.log('=================================\n');

  // Final verdict
  console.log('VERIFICATION COMPLETE!\n');
  console.log('All core features are working:');
  console.log('   - Server running');
  console.log('   - User authentication');
  console.log('   - Form creation');
  console.log('   - Form submission');
  console.log('   - AI classification (Mock)');
  console.log('   - Lead management');
  console.log('   - Statistics\n');
  
  console.log('Your backend is ready for the frontend!\n');
}

verify().catch(error => {
  console.error('\nVerification failed:', error.message);
  console.log('\nTroubleshooting:');
  console.log('   1. Make sure server is running: npm run dev');
  console.log('   2. Check MongoDB is connected');
  console.log('   3. Look at server logs for errors\n');
});