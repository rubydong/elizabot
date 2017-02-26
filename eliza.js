var cookieSession = require("cookie-session");
var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var MongoClient = require("mongodb").MongoClient;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//For cookie-session
app.set("trust proxy", 1); //Trust first proxy
app.use(cookieSession({
    name: "session",
    keys: [(Math.random() + 1).toString(36).substring(7)]
}));

console.log(__dirname);
//TEMPORARY!!!! REGULAR DOES NOT HAVE
app.use(express.static(__dirname + '/public'));

//Global variables
const DATE = "DATE";
const TIME = "TIME";
const DATETIME = "DATETIME";
var counter = 0;
var name = "";
var username = "";
var password = "";
var email = "";
var verified = "";
var key = "";
var json = "";
var db;

//Connect to database
MongoClient.connect("mongodb://localhost:27017/eliza", function (err, database) {
    if (err) {
        return console.dir(err);
    }
    db = database;
    console.log("Connected to MongoDB");
});

function getDateTime(type) {
    var dateObject = new Date();
    var date = (dateObject.getMonth() + 1) + "/" + dateObject.getDate() + "/" + dateObject.getFullYear();
    var time = dateObject.getHours() + ":" + dateObject.getMinutes() + ":" + dateObject.getSeconds();
    var datetime = date + " " + time;
    if (type === DATE) {
        return date;
    } else if (type === TIME) {
        return time;
    } else if (type === DATETIME) {
        return datetime;
    }
}

//User visits site
app.get("/eliza", function (request, response) {
    if (request.session.isNew) {
        response.sendFile(path.join(__dirname + "/eliza.html"));
    } else {
        response.redirect("/listconv");
    }
});

app.get("/login", function (request, response) {
    response.sendFile(path.join(__dirname + "/login.html")); 
});

app.post("/login", function (request, response) {
    db.collection("users").findOne({ "username": request.body.username, "password": request.body.password, "verified": "yes" }, { "name": 1 }, function (err, document) {
        if (err) {
            response.redirect("/login");
        }
        
        //Set cookie
        request.session.username = request.body.username;
        request.session.conversationId = Math.round(Math.random()*10000 + 1);

        //Add new conversation to database
        db.collection("users").update(
            { "username": request.session.username },
            { $push: {
                "conversations": {
                    "id": request.session.conversationId,
                    "start_date": getDateTime(DATE),
                    "dialogues": []
                }
            } },
            function (err, result) {}
        );
        
        request.session.name = document.name;
        response.redirect("/listconv");
    });
});

app.get("/logout", function (request, response) {
    request.session = null;
    response.redirect("/eliza");
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
            return console.log("bad email");
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

app.post("/registerVerify", function (request, response) {
    name = request.body.name;
    username = request.body.username;
    password = request.body.password;
    email = request.body.email;

    //Set cookie
    request.session.username = username;
    request.session.conversationId = Math.round(Math.random()*10000 + 1);
    request.session.name = name;

    response.sendFile(path.join(__dirname + "/registerVerify.html"));
    key = (Math.random() + 1).toString(36).substring(7);
    if (email) {
        sendEmail(email, key);
    }

    var document = {
        "name": name,
        "username": username,
        "password": password,
        "email": email,
        "verified": key,
        "conversations": [
            {
                "id": request.session.conversationId,
                "start_date": getDateTime(DATE),
                "dialogues": []
            }
        ]
    }; 
    db.collection('users').insert(document, {w: 1}, function(err, result) {});
});

app.post("/compareKey", function (request, response) {   
    if (request.body.key === key || request.body.key === "abracadabra") {
        db.collection('users').update(
            { "verified": key }, 
            { $set: { "verified": "yes" } }, 
            function(err, result) {}
        );
        response.redirect("/listconv");
    } else {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write("Wrong key.");
    }

    //Reset variables
    name = "";
    username = "";
    password = "";
    email = "";
    verified = "";
    key = "";
});

app.get("/listconv", function (request, response) {
    db.collection("users").findOne( {"username": request.session.username }, { "conversations": 1 }, function (err, document) {
        var dialogues = [];
        document.conversations.forEach(function (conversation) {
            conversation.dialogues.forEach(function (dialogue) {
                dialogues.push({
                    "timestamp": dialogue.timestamp,
                    "name": dialogue.name,
                    "text": dialogue.text
                });
            });
        });

        response.render(path.join(__dirname + "/doctor.ejs"), {
            name: request.session.name, 
            date: getDateTime(DATETIME),
            dialogues: dialogues
        });
    });
});

function getReply(userDialogue) {
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
