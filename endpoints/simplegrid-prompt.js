/**
 * Node JS Endpoint
 * 
 * To make this file work, you will need a running extjs server * 
 */
// Import required modules
    const express = require('express');
    const OpenAI = require('openai'); 
    const router = express.Router(); 

// You should have a dotenv file with your AI API Key
    require('dotenv').config(); 

    const debug = true; // Enable/disable debug logging


// Initialize OpenAI client with API key from environment variable
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

//     async function listModels() {
//   try {
//     const response = await openai.models.list();
//     console.log("Models available for this API key:");
//     response.data.forEach(model => {
//       console.log(model.id);
//     });
//   } catch (err) {
//     console.error(err);
//   }
// }

// listModels();

// The PROMPT
    function createShortPrompt(userQuery) {
        return `
            Convert natural language to Ext JS 7+ filter JSON.

            Fields: name (str), age (num), email (str), status (list: active/inactive/pending), created_at (date), country (str), last_month_sales (num)

            Operators: eq, lt, gt, like, in  
            Types: string, number, date, boolean, list  
            Coutries: Must start with capital letter, united states must be USA, united kingdom must be UK

            Rules:  
            - Strings: use "like"  
            - Lists: use "in"  
            - Numbers/dates: use lt, gt, eq with object values
            - Numbers: filter must follow the format: { "property": "<field>", "value": { "<operator>": <number> } }
            - Date: filter must follow the format: { "property": "<field>", "value": { "<operator>": <date> } }
            - No wildcards or % 
            - Use double quotes in JSON
            - Compatible with Ext JS filters
            - filters must come inside "filters" parameter
            - each filter must have a property, type, operator, and value

            Examples:
                prompt: show users with last month sales between 1000 and 1500
                output: { "property": "last_month_sales", "value": { "gt": 1000, "lt": 1500 }, "type": "number" }
                prompt: show users with name keith
                output: { "property": "name", "value": "keith", "operator": "like", "type": "string" }
                prompt: show users created on march 2021
                output: { "property": "created_at", "value": { "gt": "2021-03-01", "lt": "2021-03-31" }, "type": "date" }
                prompt: show users created on march 21st, 2021
                output: { "property": "created_at", "value": { "eq": "2021-03-21" }, "type": "date" }
                prompt: show users created on 2021
                output: { "property": "created_at", "value": { "gt": "2021-01-01", "lt": "2021-12-31" }, "type": "date" }

            Sort: add "sorters" with property + direction (ASC/DESC)

            Rules for sorters:
            - must be compatible with ExtJS sorters
            - use property and direction (ASC/DESC)
            - sorters must come inside "sorters" parameter

            Input: "${userQuery}" 
            Output: (JSON only)             

        `;
    }

// Check the prompt
    router.post('/', async (req, res) => {
        const userQuery = req.body.query; // Extract query from frontend POST body
        const prompt = createShortPrompt(userQuery); // Format the prompt for GPT

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'You convert queries to Ext JS filters.' }, // Define assistant behavior
                    { role: 'user', content: prompt } // Provide user's formatted query
                ]
            });

            // Validate that a usable response exists
                if (!completion || !completion.choices || !completion.choices[0]) {
                    throw new Error('Invalid GPT response structure');
                }

            // Extract the assistant's text reply from the response
                const gptText = completion.choices[0].message.content;
                if (debug) console.log('GPT raw response:', gptText); 

            // Attempt to extract a JSON block from the GPT reply
                const match = gptText.match(/\{[\s\S]*\}/); // Match content enclosed in braces
                if (!match) throw new Error('Could not extract JSON from GPT output');

            // Parse the JSON content and send it as the API response
                const json = JSON.parse(match[0]);
                res.json(json);

        } catch (err) {
            // Handle and log error
            if (debug) console.error('OpenAI error:', err);
            res.status(500).json({ error: 'Failed to generate filters' });
        }
    });

// Export this router to be used in the main Express app
module.exports = router;