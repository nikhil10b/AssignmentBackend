// controllers/uploadController.js
const xlsx = require('xlsx');
const Candidate = require('../models/Candidate');
const async = require('async');

// Function to check if the email ID already exists in the database
async function isDuplicateEmail(email) {
  return Candidate.exists({ email });
}

// Function to add candidates to the database
async function addCandidatesFromExcel(filePath, callback) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    async.eachSeries(sheetData, async (row, next) => {
      const emailExists = await isDuplicateEmail(row.Email);

      if (!emailExists) {
        const candidate = new Candidate({
          name: row.Name,
          age: row.Age,
          email: row.Email,
          experience: row.Experience,
        });
        await candidate.save();
        console.log('Candidate added successfully:', candidate);
      } else {
        console.log('Skipping row - Duplicate email exists:', row);
      }
      next(); // Move to the next candidate
    });
  } catch (error) {
    console.error('Error processing candidates:', error);
    callback({ success: false, message: 'Error adding candidates. Please check the file format and try again.' });
  } finally {
    // Remove the uploaded file from the server
    fs.unlinkSync(filePath);
  }

  callback({ success: true, message: 'Candidates added successfully!' });
}

module.exports = { addCandidatesFromExcel };
