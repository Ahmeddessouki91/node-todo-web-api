const port = process.env.PORT || 3000;

var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');
var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then((result) => {
        res.send(result);
    }).catch((e) => {
        res.status(400).send();
    })
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id))
        return res.status(404).send('Invaild id');
    Todo.findById(id).then((result) => {
        if (!result)
            return res.status(404).send('Not found');
        res.send(result);
    }).catch((e) => {
        return res.status(400).send('Not found');
    })
});

app.listen(port, () => console.log(`Started on port ${port}`));

