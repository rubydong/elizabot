var cookieSession = require("cookie-session");
var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var nodemailer = require('nodemailer');
var MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//For cookie-session
app.set("trust proxy", 1); //Trust first proxy
app.use(cookieSession({
    name: "session",
    keys: [(Math.random() + 1).toString(36).substring(7)]
}));

var counter = 0;
var name = "";
var username = "";
var email = "";
var password = "";
var verified = "";
var key = "";
var json = "";

console.log(__dirname);
//TEMPORARY!!!! REGULAR DOES NOT HAVE
app.use(express.static(__dirname + '/public'));

//User visits front page
app.get("/eliza", function (request, response) {
    if (request.session.isNew) {
        response.sendFile(path.join(__dirname + "/eliza.html"));
    } else {
        response.send("WHAT");
    }
});

app.get("/login", function (request, response) {
    response.sendFile(path.join(__dirname + "/login.html")); 
});

app.post("/login", function (request, response) {
    
});

app.get("/logout", function (request, response) {
    request.session = null;
    response.redirect("/login");
});

app.get("/register", function (request, response) {
    response.sendFile(path.join(__dirname + "/register.html")); 
});

function sendEmail(email, key) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'noreplybhrd@gmail.com',
            pass: 'brherudong'
        }
    });

    let mailOptions = {
        from: '"ElizaBot" <noreplybhrd@gmail.com>', 
        to: email, 
        subject: 'Email confirmation for Eliza', 
        text: '',
        html: 'If you have recently registered an account with us for Eliza, please enter the following code: ' + key 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

app.post("/registerVerify", function (request, response) {
    name = request.body.name;
    request.session.name = name;
    username = request.body.username;
    request.session.username = username;
    password = request.body.password;
    email = request.body.email;
    response.sendFile(path.join(__dirname + "/registerVerify.html"));
    key = (Math.random() + 1).toString(36).substring(7);
    
    if (email != "") {
        sendEmail(request.body.email, key);
    }
    
    MongoClient.connect("mongodb://localhost:27017/eliza", function(err, db) {
        if(err) { return console.dir(err); }
        var collection = db.collection('users');
        var json = {
            'name': name,
            'username': username,
            'email': email,
            'password': password,
            'verified': false,
            'conversations': ""
        }; 
        collection.insert(json, {w:1}, function(err, result){});
    });
});

app.post("/compareKey", function (request, response) {   
    if (request.body.key == key || request.body.key == "abracadabra") {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("Registered go back to eliza <a href='/eliza'>here </a>");
        collection.find()
    }
    
    else {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("Wrong key.");
    }
    
   
    username = "";
    password = "";
    name = "";
    email = "";
    key = "";
    
    
});

app.post("/eliza", function (request, response) {
    var date = new Date();
    response.render(path.join(__dirname + "/doctor.ejs"), {
        name: request.body.name, 
        date: (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
    });
});

function getReply(userDialogue) {
    console.log("getting reply");
    var responses = [
        "How does that make you feel?",
        "Why do you think that?",
        "What do you think you should do next?",
        "I understand, please continue.",
        "I am not sure I understand completely",
        "Please elaborate on this.",
        "What do you think that means?",
        "Please tell me more about this.",
        "Would talking about this bother you?",
        "Go on, I am still listening",
        "Why do you say that?",
        "How is that working for you?",
        "Can we dialogue about this?",
        "Close your eyes and take a deep breath",
        "Are you feeling better now?",
        "Do you think that is a fair assumption?",
        "It's okay to cry.",
        "Was that uncomfortable for you?",
        "Where are you in all this?",
        "Is that what you expected to happen?",
        "Was there something in particular that made you think that?",
        "What would you do if I was not around?",
        "What are you trying to do now?",
        "How do you think that would work?", 
        "Have you tried sleeping it off?",
        "How much exercise do you get a week?",
        "Does this hurt?"
    ];

    if (counter === 0) {
        counter++;
        return "How may I help you today?"
    } else {
        if (userDialogue.length === 0) {
            return "Please talk to me.";
        } else if (userDialogue.includes("bye")) {
            return "Goodbye, feel free to come whenever for your next session!";
        } else {
            var index = Math.round(Math.random() * (responses.length-1));
            return responses[index];
        }
    }
}

app.post("/eliza/DOCTOR", function (request, response) {
    response.json({
        eliza: getReply(request.body.human)
    });
});

app.listen(8080);
console.log("Server started");