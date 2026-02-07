import express from 'express';
const app = express();

app.get('/', (req, res) => {
  const name = process.env.NAME || 'Gemdi';
  res.send(`Hello ${name}!`);
});

const port = parseInt(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Gemdi: listening on port ${port}`);
});