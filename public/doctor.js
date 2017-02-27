function getUserDiv(timestamp, text) {
    return "<div class='user'>" + timestamp + " - You: " + text + "</div>"
}

function getElizaDiv(timestamp, text) {
    return "<div class='eliza'>" + timestamp + " - Eliza: " + text + "</div>"
}

$(document).ready(function () {
    $("#userTextForm").submit(function (event) {
        event.preventDefault(); //so HTML form does not POST to action
        var userText = $("#userText").val();
        $("#userText").val(""); //clear text input
        $.ajax({
            "data": { "human": userText },
            "dataType": "json",
            "type": "POST",
            "url": "/eliza/DOCTOR"
        }).done(function (data) {
            var timestamp = data.timestamp;
            $("#dialogue").append(getUserDiv(timestamp, userText));
            $("#dialogue").append(getElizaDiv(timestamp, data.eliza));
            var dialogueElement = document.getElementById("#dialogue");
            dialogueElement.scrollTop = dialogueElement.scrollHeight;
        });
    });

    $("#dropbtn").click(function () {
        if ($("#dropdown-content").is(":empty")) {
            $.getJSON("/listconv", function (data) {
                $.each(data.conversations, function () {
                    $("#dropdown-content").append("<button class='conversation' id='" + this.id + "'>ID: " + this.id + " DATE: " + this.start_date + "</button>");
                });
            });
        }
    });

    $("#dropdown-content").on("click", ".conversation", function (event) {
        $.ajax({
            "data": { "id": event.target.id },
            "dataType": "json",
            "type": "POST",
            "url": "/getconv"
        }).done(function (data) {
            $("#userTextForm").hide();
            $("#oldconvMessage").show();
            $("#dialogue").empty();
            $.each(data.dialogues, function () {
                if (this.name === "Eliza") {
                    $("#dialogue").append(getElizaDiv(this.timestamp, this.text));
                } else {
                    $("#dialogue").append(getUserDiv(this.timestamp, this.text));
                }
            });
        });
    });
});