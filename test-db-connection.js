 /**
 * Database Connection Test Script
 * 
 * This script tests the MongoDB connection using your existing mongoose setup.
 * Run with: node test-db-connection.js
 */

const mongoose = require('mongoose');
try {
    require('dotenv').config();
} catch (e) {
    console.warn('⚠️ dotenv not found; attempting to load .env manually...');
    try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const contents = fs.readFileSync(envPath, 'utf8');
            contents.split(/\r?\n/).forEach((line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith('#')) return;
                const eqIndex = trimmed.indexOf('=');
                if (eqIndex === -1) return;
                const key = trimmed.slice(0, eqIndex).trim();
                let value = trimmed.slice(eqIndex + 1).trim();
                if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.slice(1, -1);
                }
                if (!(key in process.env)) {
                    process.env[key] = value;
                }
            });
            console.log('✅ Loaded environment variables from .env');
        } else {
            console.warn('⚠️ .env file not found; proceeding with existing environment variables');
        }
    } catch (err) {
        console.warn('⚠️ Failed to load .env manually; proceeding with existing environment variables');
    }
}

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function testDatabaseConnection() {
    console.log('🔍 Starting database connection test...\n');
    
    // Test 1: Check if MONGODB_URI is set
    console.log('1. Checking environment variables...');
    if (!MONGODB_URI) {
        console.error('❌ MONGODB_URI is not set in environment variables');
        console.log('💡 Make sure you have a .env file with MONGODB_URI=your_connection_string');
        return false;
    }
    console.log('✅ MONGODB_URI is set');
    console.log(`   URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);
    
    // Test 2: Attempt to connect
    console.log('2. Attempting to connect to database...');
    try {
        await mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000, // 10 second timeout
        });
        console.log('✅ Successfully connected to MongoDB');
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB');
        console.error(`   Error: ${error.message}`);
        return false;
    }
    
    // Test 3: Check connection state
    console.log('3. Checking connection state...');
    const connectionState = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    console.log(`✅ Connection state: ${states[connectionState]} (${connectionState})\n`);
    
    // Test 4: Test basic database operation
    console.log('4. Testing basic database operations...');
    try {
        // Create a simple test collection
        const TestModel = mongoose.model('ConnectionTest', new mongoose.Schema({
            testField: String,
            timestamp: { type: Date, default: Date.now }
        }));
        
        // Insert a test document
        const testDoc = new TestModel({ testField: 'connection-test' });
        await testDoc.save();
        console.log('✅ Successfully inserted test document');
        
        // Find the test document
        const foundDoc = await TestModel.findOne({ testField: 'connection-test' });
        if (foundDoc) {
            console.log('✅ Successfully retrieved test document');
        }
        
        // Clean up test document
        await TestModel.deleteOne({ testField: 'connection-test' });
        console.log('✅ Successfully cleaned up test document');
        
    } catch (error) {
        console.error('❌ Database operation failed');
        console.error(`   Error: ${error.message}`);
        return false;
    }
    
    // Test 5: Connection info
    console.log('5. Connection information:');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ All tests passed! Database connection is working properly.');
    console.log('🔌 Connection closed successfully.');
    
    return true;
}

// Run the test
testDatabaseConnection()
    .then((success) => {
        if (success) {
            console.log('\n🎉 Database connection test completed successfully!');
            process.exit(0);
        } else {
            console.log('\n💥 Database connection test failed!');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('\n💥 Unexpected error during database test:');
        console.error(error);
        process.exit(1);
    });