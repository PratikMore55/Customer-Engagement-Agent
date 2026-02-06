// Debug script to check customer and lead processing
const API_URL = 'http://localhost:5000/api';

async function debug() {
  console.log('Debug Check\n');

  // Register
  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Debug User',
      email: `debug${Date.now()}@example.com`,
      password: 'password123',
      businessName: 'Debug Business',
    }),
  });
  const registerData = await registerRes.json();
  const token = registerData.token;
  console.log('1. User registered\n');

  // Create form
  const formRes = await fetch(`${API_URL}/forms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Debug Form',
      fields: [
        { label: 'Name', fieldType: 'text', required: true, order: 1, classificationWeight: 'low' },
        { label: 'Email', fieldType: 'email', required: true, order: 2, classificationWeight: 'low' },
        { label: 'Budget', fieldType: 'text', required: true, order: 3, classificationWeight: 'high' },
      ],
    }),
  });
  const formData = await formRes.json();
  const formId = formData.form._id;
  console.log('2. Form created\n');

  // Submit form
  const submitRes = await fetch(`${API_URL}/customers/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      formId,
      responses: {
        'Name': 'Test Lead',
        'Email': 'test@example.com',
        'Budget': 'urgent high budget ASAP',
      },
    }),
  });
  const submitData = await submitRes.json();
  console.log('3. Form submitted\n');
  console.log('   Customer ID:', submitData.customerId);

  // Check customers immediately
  console.log('4. Checking customers (immediately)...');
  const customersRes1 = await fetch(`${API_URL}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const customersData1 = await customersRes1.json();
  console.log(`   Found ${customersData1.count} customer(s)`);
  if (customersData1.count > 0) {
    console.log('   Processed:', customersData1.customers[0].processed);
    console.log('   Error:', customersData1.customers[0].processingError || 'None');
  }
  console.log('');

  // Wait and check again
  console.log('5. Waiting 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('6. Checking customers (after wait)...');
  const customersRes2 = await fetch(`${API_URL}/customers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const customersData2 = await customersRes2.json();
  if (customersData2.count > 0) {
    console.log('   Processed:', customersData2.customers[0].processed);
    console.log('   Error:', customersData2.customers[0].processingError || 'None');
  }
  console.log('');

  // Check leads
  console.log('7. Checking leads...');
  const leadsRes = await fetch(`${API_URL}/leads`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const leadsData = await leadsRes.json();
  console.log(`   Found ${leadsData.count} lead(s)\n`);

  if (leadsData.count > 0) {
    console.log('SUCCESS! Lead was created:');
    console.log('   Classification:', leadsData.leads[0].classification);
    console.log('   Confidence:', leadsData.leads[0].confidenceScore);
  } else {
    console.log('ISSUE: No lead was created');
    console.log('\nCheck your server console for error messages like:');
    console.log('   - "Processing customer..."');
    console.log('   - "Classifying lead..."');
    console.log('   - Any error messages');
  }
}

debug().catch(console.error);
