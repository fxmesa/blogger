var express = require('express');

var bodyParser = require('body-parser');

// MONGODB
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = 'mongodb://localhost/blogger';
mongoose.connect(mongoDB, {
    useMongoClient: true
});

// Schema class from mongoose
var Schema = mongoose.Schema;

// Define the schema for a Blog object
var BlogSchema = new Schema({
    author: String,
    title: String,
    url: String,
})

// Define the Blog Model with the defined schema
mongoose.model('Blog', BlogSchema);

// Get the defined model
var Blog = mongoose.model('Blog');



// Server
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes

app.get('/api/blogs', function(req, res) {
    Blog.find(function(err, docs) {
        docs.forEach(function(item) {
            console.log("Received a GET request for _id: " + item._id);
        })
        res.send(docs);
    });
});

app.post('/api/blogs', function(req, res) {
    console.log('Received a POST request:')
    for (var key in req.body) {
        console.log(key + ': ' + req.body[key]);
    }
    var blog = new Blog(req.body);
    blog.save(function(err, doc) {
        res.send(doc);
    });
});


// In both delete and put methods, the "id" parameter of the path is the id of the object
// Backbone Models prototype has been changed so that by "id" the "_id" attribute is going to be looked for instead
app.delete('/api/blogs/:id', function(req, res) {
    console.log('Received a DELETE request for _id: ' + req.params.id);
    Blog.remove({_id: req.params.id}, function(err, doc) {
        res.send({_id: req.params.id});
    });
});

app.put('/api/blogs/:id', function(req, res) {
    console.log('Received an UPDATE request for _id: ' + req.params.id);
    Blog.update({_id: req.params.id}, req.body, function(err) {
        res.send({_id: req.params.id});
    });
});

var port = 3000;

app.listen(port);
console.log('Server listening on port ' + port);
