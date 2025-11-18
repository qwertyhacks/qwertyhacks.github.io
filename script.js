document.getElementById("submitBtn").addEventListener("click", () => {
    const text = document.getElementById("captchaInput").value.trim().toLowerCase();

    if (text === "er7c2") { // your secret word
        const audio = new Audio("trollaudio.mp3");
        audio.play();

        document.getElementById("result").innerHTML =
            '<img src="troll.png">';
    } else {
        document.getElementById("result").innerHTML = "<p>Incorrect, try again.</p>";
    }
});
