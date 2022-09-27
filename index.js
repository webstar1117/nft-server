const express = require('express')
const multer = require('multer')
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

var port = 80; //server
// var port = 3001; //localhost

var app = express();
app.use('/images', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.options('*', cors());

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})
var upload = multer({ storage: storage })

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",//server
    // password: "",//local
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

app.post('/upload-single', upload.single('image-file'), function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    try {
        var sql = `INSERT INTO images (name, description, image, owner, status, price) VALUES ("${req.body.name}","${req.body.description}","${req.file.filename}","${req.body.owner}","0","${req.body.price}");`;
        con.query(sql, function (err, result) {
            if (err) throw err;

            let sql2 = `SELECT * FROM images WHERE id= LAST_INSERT_ID()`;

            con.query(sql2, function (err1, result) {
                if (err1) throw err1;
                res.status(200).json(result);
            });
        });
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
            res.status(200).json(result);
        });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }

})

app.get('/load-metadata', function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    try {
        var sql = `SELECT * from images WHERE id="${req.query.id}"`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            res.status(200).json(result);
        });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }
})

app.get('/load-new-metadata', function (req, res, next) {
    // req.file is the `profile-file` file
    // req.body will hold the text fields, if there were any
    try {
        var sql = `SELECT * from images WHERE status="0"`;
        con.query(sql, function (err, result) {
            if (err) throw err;
            res.status(200).json(result);
        });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }

})

app.post('/update-price', function (req, res, next) {
    try {
        var sql = `UPDATE images SET price = '${req.body.value}' WHERE id = ${req.body.id}`;
        con.query(sql, function (err, result) {
            if (err) throw err;

            var sql2 = `SELECT * FROM images WHERE id = ${req.body.id}`;
            con.query(sql2, function (err1, result) {
                if (err1) throw err1;
                res.status(200).json(result);
            });
        });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }

})

app.post('/update-status', function (req, res, next) {
    try {
        var sql = `UPDATE images SET status = '${req.body.status}' WHERE id = ${req.body.id}`;
        con.query(sql, function (err, result) {
            if (err) throw err;

            var sql2 = `SELECT * FROM images WHERE id = ${req.body.id}`;
            con.query(sql2, function (err1, result) {
                if (err1) throw err1;
                res.status(200).json(result);
            });
        });
    } catch (e) {
        return res.status(401).send({
            message: e.message
        });
    }

})

app.get('/load-totalSupply', function (req, res, next) {
    try {
        var sql = `SELECT COUNT(*) FROM images`;
        con.query(sql, function (err, result) {
            if (err) throw err;
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