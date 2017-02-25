$(document).ready(function () {
    $("#userForm").submit(function (event) {
        event.preventDefault(); //so HTML form does not POST to action
        var userDialogue = $("#userDialogue").val();
        $("#userDialogue").val(""); //clear text input
        $.ajax({
            data: {human: userDialogue},
            dataType: "json",
            type: "POST",
            url: "/eliza/DOCTOR"
        }).done(function (data) {
            $("#convo").append("<div class='user'>You: " + userDialogue + "</div>");
            $("#convo").append("<div class='eliza'>Eliza: " + data.eliza + "</div>");
            var convoElement = document.getElementById("convo");
            convoElement.scrollTop = convoElement.scrollHeight;
        });
    });
});