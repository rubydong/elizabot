$(document).ready(function () {
    $("#registrationForm").submit(function (event) {
        event.preventDefault(); //so HTML form does not POST to action
        $.ajax({
            "data": {
                "name": $("#name").val(),
                "username": $("#username").val(),
                "password": $("#password").val(),
                "email": $("#email").val()
            },
            "dataType": "json",
            "type": "POST",
            "url": "/adduser"
        });
    });
    
    $("#verificationForm").submit(function (event) {
        event.preventDefault(); //so HTML form does not POST to action
        $.ajax({
            "data": {
                "email": $("#email").val(),
                "key": $("#key").val()
            },
            "dataType": "json",
            "type": "POST",
            "url": "/verify"
        });
    });
    
    $("#loginForm").submit(function (event) {
        event.preventDefault(); //so HTML form does not POST to action
        $.ajax({
            "data": {
                "username": $("#username").val(),
                "password": $("#password").val()
            },
            "dataType": "json",
            "type": "POST",
            "url": "/login"
        });
    });
});