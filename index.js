var express = require('express')
var multer = require('multer')
const cors = require('cors');
var path = require('path');
var port = 80; //server
// var port = 3001; //localhost

var app = express();
app.use(cors());
app.options('*', cors());
app.use(express.static(path.join(__dirname, 'uploads')));
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null,Date.now()+file.originalname)
    }
})
var upload = multer({ storage: storage })

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    password: "password",
    database: "nft"

});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

/*
app.use('/a',express.static('/b'));
Above line would serve all files/folders inside of the 'b' directory
And make them accessible through http://localhost:3000/a.
*/
app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.post('/upload-single', upload.single('image-file'), function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    try {
        var sql = `INSERT INTO images (img) VALUES ("${req.file.filename}")`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
        res.status(200).json({ path: req.file.path });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }

})

app.get('/load-images', function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    try {
        var sql = "SELECT * from images";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
            res.status(200).json(result);
        });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }

})



app.post('/profile-upload-multiple', upload.array('profile-files', 12), function (req, res, next) {
    // req.files is array of `profile-files` files
    // req.body will contain the text fields, if there were any
    var response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    for (var i = 0; i < req.files.length; i++) {
        response += `<img src="${req.files[i].path}" /><br>`
    }

    return res.send(response)
})


app.listen(port, () => console.log(`Server running on port ${port}!`))