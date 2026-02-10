const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testLogin(email, password, description) {
    try {
        console.log(`\nTesting: ${description}`);
        const response = await axios.post(`${BASE_URL}/login`, {
            email,
            password
        });
        console.log('✅ Success:', response.status, response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ Expected Error:', error.response.status, error.response.data);
        } else {
            console.error('❌ Unexpected Error:', error.message);
        }
    }
}

async function runTests() {
    // Test 1: Correct Credentials
    await testLogin('admin@digitalhack.us', 'Qwerty@12345', 'Correct Credentials');

    // Test 2: Incorrect Email
    await testLogin('wrong@email.com', 'Qwerty@12345', 'Incorrect Email');

    // Test 3: Incorrect Password
    await testLogin('admin@digitalhack.us', 'wrongpassword', 'Incorrect Password');
}

runTests();
