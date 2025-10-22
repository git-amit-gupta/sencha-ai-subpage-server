/**
 * Express Backend Server for Ext JS Frontend
 * ------------------------------------------
 * Sets up a basic Node.js/Express server used as a backend for an Ext JS frontend application.
 * 
 * Key Features:
 * - CORS is enabled allowing requests from the Ext JS app.
 * - JSON request bodies are parsed using `body-parser`.
 * - A modular route handler is mounted at `/api/parse-query` to handle GPT-based query parsing.
 * - The server listens on port 3000.
 * 
 * This file acts as the entry point for the backend API and is designed to facilitate communication between
 * the Ext JS frontend and an OpenAI-based query parser route.
 * 
 * Request Structure
 *  Endpoint: http://localhost:3000/api/interpret-prompt
 *  Method: POST
 *  Headers:
 *    Content-Type: application/json
 *  Body: 
 *    {
 *      "query": "Show me all users from Mexico who signed up in the last 30 days"
 *    }
 * 
 */

// Replace by your frontend domain
const myFrontEndUrl = 'https://sencha-ai-subpage-test.vercel.app';
// Replace by your backend domain
const myServerUrl = 'https://sencha-ai-subpage-server.onrender.com';

// Import the Express framework to build the web server
  const express = require('express');
  const cors = require('cors');
  const bodyParser = require('body-parser');
// These are your endpoints
  const parseQuery = [
    { query: require('./endpoints/simplegrid-prompt'), api: '/api/simplegrid-prompt' },
    { query: require('./endpoints/banking-prompt'), api: '/api/banking-prompt' },
    { query: require('./endpoints/healthcare-prompt'), api: '/api/healthcare-prompt' },
    { query: require('./endpoints/school-prompt'), api: '/api/school-prompt' },
  ]; 
  const app = express();

// Enable CORS to allow requests from the Ext JS app hosted at this specific origin
  app.use(cors({
    origin: myFrontEndUrl 
  }));


  app.use(bodyParser.json());
  parseQuery.forEach(element => {
    app.use(element.api, element.query);
  });
  app.listen(3000, () => console.log('Server running on ' + myServerUrl));

