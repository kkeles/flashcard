const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

const questionsFilePath = './data/questions.json';

app.use(cors({
  origin: 'http://localhost'
}));

app.use(bodyParser.json());

app.route('/questions')
  .get((req, res) => {
    fs.readFile(questionsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return res.status(500).send('An error occurred');
      }
      res.json(JSON.parse(data));
    });
  })
  .post((req, res) => {
    fs.readFile(questionsFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return res.status(500).send('An error occurred');
      }

      const questions = JSON.parse(data);
      const newQuestion = req.body;

      questions.push(newQuestion);

      fs.writeFile(questionsFilePath, JSON.stringify(questions, null, 2), (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return res.status(500).send('An error occurred');
        }
        res.status(201).send('New question added');
      });
    });
  });

app.delete('/questions/:index', (req, res) => {
  fs.readFile(questionsFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading file:', err);
          return res.status(500).send('An error occurred');
      }

      let questions = JSON.parse(data);
      const index = parseInt(req.params.index);

      if (index < 0 || index >= questions.length) {
          return res.status(404).send('Question not found');
      }

      // Remove the question at the given index
      questions.splice(index, 1);

      // Write the updated questions back to the file
      fs.writeFile(questionsFilePath, JSON.stringify(questions, null, 2), (err) => {
          if (err) {
              console.error('Error writing file:', err);
              return res.status(500).send('An error occurred');
          }
          res.send('Question deleted');
      });
  });
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
