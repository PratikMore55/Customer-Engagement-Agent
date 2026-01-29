// API Testing Script
// Run this with: node test-api.js

const API_URL = 'http://localhost:5000/api';

// Store token and IDs for subsequent requests
let authToken = '';
let userId = '';
let formId = '';
let customerId = '';
let leadId = '';

// Helper function to make requests
async function apiCall(method, endpoint, data = null, useAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (useAuth && authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data: result,
    };
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message,
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  const result = await apiCall('GET', '/health');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testRegister() {
  console.log('\n👤 Testing User Registration...');
  const userData = {
    name: 'Test Business Owner',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    businessName: 'Test AI Business',
    businessDescription: 'We help businesses with AI solutions',
    industry: 'Technology',
  };

  const result = await apiCall('POST', '/auth/register', userData);
  console.log('Status:', result.status);
  console.log('Response:', result.data);

  if (result.success) {
    authToken = result.data.token;
    userId = result.data.user.id;
    console.log('✅ Token saved for future requests');
  }

  return result.success;
}

async function testLogin() {
  console.log('\n🔐 Testing Login...');
  const loginData = {
    email: 'test@example.com',
    password: 'password123',
  };

  const result = await apiCall('POST', '/auth/login', loginData);
  console.log('Status:', result.status);
  console.log('Response:', result.data);

  if (result.success) {
    authToken = result.data.token;
    console.log('✅ Login successful, token updated');
  }

  return result.success;
}

async function testGetMe() {
  console.log('\n👨‍💼 Testing Get Current User...');
  const result = await apiCall('GET', '/auth/me', null, true);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testCreateForm() {
  console.log('\n📝 Testing Create Form...');
  const formData = {
    title: 'Lead Qualification Form',
    description: 'Help us understand your needs',
    fields: [
      {
        label: 'Full Name',
        fieldType: 'text',
        placeholder: 'Enter your full name',
        required: true,
        order: 1,
        classificationWeight: 'low',
      },
      {
        label: 'Email',
        fieldType: 'email',
        placeholder: 'your@email.com',
        required: true,
        order: 2,
        classificationWeight: 'low',
      },
      {
        label: 'Budget',
        fieldType: 'select',
        options: ['Under $5k', '$5k-$20k', '$20k-$50k', 'Over $50k'],
        required: true,
        order: 3,
        classificationWeight: 'high',
      },
      {
        label: 'Timeline',
        fieldType: 'select',
        options: ['Immediate (1-2 weeks)', 'Short-term (1-3 months)', 'Long-term (3+ months)', 'Just researching'],
        required: true,
        order: 4,
        classificationWeight: 'high',
      },
      {
        label: 'Tell us about your needs',
        fieldType: 'textarea',
        placeholder: 'Describe your project or requirements...',
        required: true,
        order: 5,
        classificationWeight: 'medium',
      },
    ],
    classificationCriteria: {
      hotLeadIndicators: [
        'High budget',
        'Immediate timeline',
        'Clear requirements',
      ],
      normalLeadIndicators: [
        'Medium budget',
        'Short-term timeline',
        'Some requirements defined',
      ],
      coldLeadIndicators: [
        'Low or no budget mentioned',
        'Long timeline',
        'Just researching',
      ],
    },
    emailSettings: {
      sendAutoResponse: true,
    },
  };

  const result = await apiCall('POST', '/forms', formData, true);
  console.log('Status:', result.status);
  console.log('Response:', result.data);

  if (result.success) {
    formId = result.data.form._id;
    console.log('✅ Form created with ID:', formId);
  }

  return result.success;
}

async function testGetForms() {
  console.log('\n📋 Testing Get All Forms...');
  const result = await apiCall('GET', '/forms', null, true);
  console.log('Status:', result.status);
  console.log('Forms count:', result.data.count);
  console.log('Response:', result.data);
  return result.success;
}

async function testGetPublicForm() {
  console.log('\n🌐 Testing Get Public Form (no auth)...');
  const result = await apiCall('GET', `/forms/public/${formId}`);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testSubmitForm() {
  console.log('\n📨 Testing Customer Form Submission (HOT LEAD)...');
  const submissionData = {
    formId: formId,
    responses: {
      'Full Name': 'John Doe',
      'Email': 'john.doe@example.com',
      'Budget': 'Over $50k',
      'Timeline': 'Immediate (1-2 weeks)',
      'Tell us about your needs': 'We need an urgent AI solution to automate our customer service. We have a large budget and need to start immediately.',
    },
  };

  const result = await apiCall('POST', '/customers/submit', submissionData);
  console.log('Status:', result.status);
  console.log('Response:', result.data);

  if (result.success) {
    customerId = result.data.customerId;
    console.log('✅ Customer submitted with ID:', customerId);
    console.log('⏳ AI is processing in background...');
    console.log('💡 Wait 3-5 seconds for AI classification to complete');
  }

  return result.success;
}

async function testSubmitColdLead() {
  console.log('\n📨 Testing Customer Form Submission (COLD LEAD)...');
  const submissionData = {
    formId: formId,
    responses: {
      'Full Name': 'Jane Smith',
      'Email': 'jane.smith@example.com',
      'Budget': 'Under $5k',
      'Timeline': 'Just researching',
      'Tell us about your needs': 'Just looking at options for the future. No immediate plans.',
    },
  };

  const result = await apiCall('POST', '/customers/submit', submissionData);
  console.log('Status:', result.status);
  console.log('Response:', result.data);

  if (result.success) {
    console.log('✅ Cold lead submitted');
    console.log('⏳ AI is processing in background...');
  }

  return result.success;
}

async function testGetCustomers() {
  console.log('\n👥 Testing Get All Customers...');
  const result = await apiCall('GET', '/customers', null, true);
  console.log('Status:', result.status);
  console.log('Customers count:', result.data.count);
  console.log('Response:', result.data);
  return result.success;
}

async function testGetLeads() {
  console.log('\n🎯 Testing Get All Leads...');
  const result = await apiCall('GET', '/leads', null, true);
  console.log('Status:', result.status);
  console.log('Leads count:', result.data.count);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  
  if (result.success && result.data.leads.length > 0) {
    leadId = result.data.leads[0]._id;
    console.log('✅ First lead ID:', leadId);
  }

  return result.success;
}

async function testGetLeadStats() {
  console.log('\n📊 Testing Get Lead Statistics...');
  const result = await apiCall('GET', '/leads/stats', null, true);
  console.log('Status:', result.status);
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result.success;
}

async function testUpdateLeadClassification() {
  if (!leadId) {
    console.log('\n⚠️  Skipping Update Lead Classification - no lead ID');
    return false;
  }

  console.log('\n✏️  Testing Update Lead Classification...');
  const updateData = {
    classification: 'hot',
    reason: 'Manual review - customer called and confirmed budget',
  };

  const result = await apiCall('PATCH', `/leads/${leadId}/classification`, updateData, true);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testAddLeadNote() {
  if (!leadId) {
    console.log('\n⚠️  Skipping Add Lead Note - no lead ID');
    return false;
  }

  console.log('\n📝 Testing Add Lead Note...');
  const noteData = {
    text: 'Had a great call with the customer. They are very interested and will make a decision by Friday.',
  };

  const result = await apiCall('POST', `/leads/${leadId}/notes`, noteData, true);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testUpdateFollowUp() {
  if (!leadId) {
    console.log('\n⚠️  Skipping Update Follow-up - no lead ID');
    return false;
  }

  console.log('\n📅 Testing Update Follow-up Status...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const followUpData = {
    status: 'contacted',
    nextFollowUpDate: tomorrow.toISOString(),
  };

  const result = await apiCall('PATCH', `/leads/${leadId}/follow-up`, followUpData, true);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('=================================');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Register User', fn: testRegister },
    { name: 'Get Current User', fn: testGetMe },
    { name: 'Create Form', fn: testCreateForm },
    { name: 'Get All Forms', fn: testGetForms },
    { name: 'Get Public Form', fn: testGetPublicForm },
    { name: 'Submit Form (Hot Lead)', fn: testSubmitForm },
    { name: 'Submit Form (Cold Lead)', fn: testSubmitColdLead },
  ];

  // Wait for AI processing
  console.log('\n⏳ Waiting 5 seconds for AI to process submissions...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  const additionalTests = [
    { name: 'Get Customers', fn: testGetCustomers },
    { name: 'Get Leads', fn: testGetLeads },
    { name: 'Get Lead Stats', fn: testGetLeadStats },
    { name: 'Update Lead Classification', fn: testUpdateLeadClassification },
    { name: 'Add Lead Note', fn: testAddLeadNote },
    { name: 'Update Follow-up', fn: testUpdateFollowUp },
  ];

  const allTests = [...tests, ...additionalTests];
  const results = [];

  for (const test of allTests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    } catch (error) {
      console.error(`\n❌ ${test.name} failed:`, error.message);
      results.push({ name: test.name, success: false });
    }
  }

  // Summary
  console.log('\n\n📊 TEST SUMMARY');
  console.log('=================================');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\nTotal: ${passed}/${total} tests passed`);
  console.log('=================================\n');
}

// Run tests
runAllTests().catch(console.error);
