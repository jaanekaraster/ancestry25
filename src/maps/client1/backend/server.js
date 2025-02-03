import express from 'express';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path'; // Import `path` module

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 5000;

// Set up the S3 client
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

// Enable CORS for all routes or specify allowed origins
// const corsOptions = {
//   origin: 'http://localhost', // Allow frontend from localhost:3000
//   methods: ['GET', 'POST'], // Allow GET and POST methods (adjust if necessary)
//   allowedHeaders: ['Content-Type', 'Authorization'], // Optional, if you are using Authorization headers
// };
// app.use(cors(corsOptions)); // Apply CORS middleware
app.use(cors());


// Serve React static files
app.use(express.static(resolve(__dirname, 'frontend', 'build')));

// API endpoint for downloading CSV
app.get('/download-csv', async (req, res) => {
  try {
    const bucketName = 'jlp-ancestry';
    const key = 'group1/sheet25.csv';

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const data = await s3.send(new GetObjectCommand(params));
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      });

    const csvContent = await streamToString(data.Body);
    res.header('Content-Type', 'text/csv');
    res.send(csvContent); // Send CSV as text/csv
  } catch (err) {
    console.error('Error downloading CSV from S3:', err);
    res.status(500).send('Error downloading CSV');
  }
});


// Serve the React app for any other route
app.get('*', (req, res) => {
  res.sendFile(resolve(__dirname, 'frontend', 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
