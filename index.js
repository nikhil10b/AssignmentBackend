// index.js
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const async = require('async');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const mongoURI = 'mongodb://localhost:27017/candidateDB';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const candidateSchema = new mongoose.Schema({
  name: String,
  age: String,
  email: { type: String, unique: true },
  experience: String,
});

const Candidate = mongoose.model('Candidate', candidateSchema);

async function isDuplicateEmail(email) {
  return Candidate.exists({ email });
}

app.use(express.static('public'));

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    await async.eachSeries(sheetData, async (row) => {
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
    });
  } catch (error) {
    console.error('Error processing candidates:', error);
    return res.status(500).json({ message: 'Error adding candidates. Please check the file format and try again.' });
  } finally {
    // Remove the uploaded file from the server
    fs.unlinkSync(filePath);
  }

  return res.status(200).json({ message: 'Candidates added successfully!' });
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
