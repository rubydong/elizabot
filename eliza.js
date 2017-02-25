var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
const nodemailer = require('nodemailer');


var counter = 0;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

console.log(__dirname);

app.set("view engine", "ejs");

//TEMPORARY!!!! REGULAR DOES NOT HAVE
app.use(express.static(__dirname + '/public'));


//User visits front page
app.get("/eliza", function (request, response) {
    response.sendFile(path.join(__dirname + "/eliza.html"));
});

app.get("/login", function (request, response) {
   response.sendFile(path.join(__dirname + "/login.html")); 
});


app.get("/register", function (request, response) {
   response.sendFile(path.join(__dirname + "/register.html")); 
});


app.post("/register", function (request, response) {
    
    //console.log(request.body.username + " " + request.body.password + " " + request.body.email + " " + request.body.name);
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("Thanks for registering, an email will be sent shortly");
});


//User submits name
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