const express = require('express');
const router = express.Router();

// Correctly import the database connection by navigating up one directory ('../')
// from the 'backend' folder to the project root where 'database.js' is located.
const db = require('../database.js');

/**
 * Authentication Middleware
 * This function runs before any route that uses it.
 * It checks if a user ID is stored in the session, which proves the user is logged in.
 * If not, it blocks the request with a 401 Unauthorized error.
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    // If a userId exists in the session, proceed to the route handler (the next function)
    return next();
  } else {
    // If not, send an error response and stop the request.
    res.status(401).json({ error: "Unauthorized. You must be logged in to access this resource." });
  }
};

/**
 * --- API ROUTES ---
 */

/**
 * @route   GET /api/profile
 * @desc    Get the profile information for the currently logged-in user.
 * @access  Private (requires login)
 */
router.get('/', isAuthenticated, (req, res) => {
  // Get the user ID from the session that was set during login
  const userId = req.session.userId;

  // SQL query to select the user's data, excluding sensitive info like password hashes
  const sql = "SELECT id, first_name, last_name, email FROM users WHERE id = ?";
  
  // Execute the query on the database
  db.get(sql, [userId], (err, row) => {
    if (err) {
      // If a database error occurs, log it on the server and send a generic error
      console.error("Database error on GET /api/profile:", err.message);
      return res.status(500).json({ error: "A database error occurred while fetching the profile." });
    }
    
    if (!row) {
      // If no user is found with that ID, send a 404 Not Found error
      return res.status(404).json({ error: "User profile not found." });
    }
    
    // If successful, send the user's data back to the frontend as JSON
    res.json(row);
  });
});

/**
 * @route   PUT /api/profile
 * @desc    Update the profile information for the currently logged-in user.
 * @access  Private (requires login)
 */
router.put('/', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  // Get the updated first name and last name from the request body sent by the frontend form
  const { firstName, lastName } = req.body;

  // Basic validation to ensure the required data was sent
  if (!firstName || !lastName) {
    return res.status(400).json({ error: "First name and last name are required fields." });
  }

  // SQL query to update the user's details in the database
  const sql = `UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`;
  
  // Execute the update query
  db.run(sql, [firstName, lastName, userId], function(err) {
    if (err) {
      console.error("Database error on PUT /api/profile:", err.message);
      return res.status(500).json({ error: "A database error occurred while updating the profile." });
    }
    
    // Send a success message back to the frontend
    res.json({ message: "Profile updated successfully!" });
  });
});

// Export the router so it can be imported and used by app.js
module.exports = router;