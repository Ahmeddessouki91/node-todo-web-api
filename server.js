require('./config/config.js');
const port = process.env.PORT || 3000;
const _ = require('lodash');

var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');
var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });
});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({ _creator: req.user._id }).then((result) => {
        res.send(result);
    }).catch((e) => {
        res.status(400).send();
    })
});

app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id))
        return res.status(404).send('Invaild id');
    Todo.findOne({ id, _creator: req.user._id }).then((result) => {
        if (!result)
            return res.status(404).send('Not found');
        res.send(result);
    }).catch((e) => {
        return res.status(400).send('Not found');
    })
});

app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid id');
    }
    Todo.findOneAndRemove({ id, _creator: req.user._id }).then((result) => {
        if (!result)
            return res.status(404).send("Not found");
        res.send(result);
    }).catch((e) => {
        res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id))
        return res.status(404).send();

    body.complatedAt = new Date().getTime();

    Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((result) => {
        if (!result)
            return res.status(404).send();
        res.send(result);
    }).catch((e) => {
        res.status(404).send();
    })
});

//------------------Users-----------------
app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((e) => {
        res.status(400).send(e);
    });
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user.email);
        });
    }).catch((e) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});






app.listen(port, () => console.log(`Started on port ${port}`));
