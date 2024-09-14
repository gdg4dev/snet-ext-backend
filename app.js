require('dotenv').config()
const express = require('express');
const { BloomFilter } = require('bloom-filters');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

const errorRate = 0.01;
const capacity = 400000;
const bloomFilter = BloomFilter.create(capacity, errorRate);

function normalizeURL(inputURL) {
  try {
    const parsedURL = new URL(inputURL);
    let hostname = parsedURL.hostname.replace(/^www\./, '');
    return (hostname + parsedURL.pathname).replace(/\/$/, '').toLowerCase();
  } catch (error) {
    return inputURL.toLowerCase();
  }
}

const urls = JSON.parse(fs.readFileSync('urls.json', 'utf-8'));
urls.forEach(inputURL => {
  const normalizedURL = normalizeURL(inputURL);
  bloomFilter.add(normalizedURL);
});

app.post('/check-url', (req, res) => {
  const { url: inputURL } = req.body;
  const normalizedURL = normalizeURL(inputURL);
  const isPossiblySpam = bloomFilter.has(normalizedURL);
  res.json({ isPossiblySpam, normalizedURL });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});