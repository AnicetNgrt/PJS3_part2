const express = require('express');
const app = express();
const port = process.env.PORT || 8081;

// initializing view engine
app.set('view engine', 'ejs');

// configuring access to public directory
app.use(express.static('public'));

// "GET /": dynamic index page 
app.get('/', function(req, res) {
    data = [1, 2, 3, 10, 25, 23];
    res.render('index', {
        serverData: data
    });
});

// "GET /about": static about page 
app.get('/about', function(req, res) {
    res.sendFile(__dirname + "/../public/html/about.html");
});

app.listen(port, '0.0.0.0');
console.log(`Listening to port ${port}`);