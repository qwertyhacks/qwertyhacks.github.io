document.getElementById("submitBtn").addEventListener("click", () => {
    const text = document.getElementById("captchaInput").value.trim().toLowerCase();

    if (text === "banana") { // your secret word
        const audio = new Audio("trollaudio.mp3");
        audio.play();

        document.getElementById("result").innerHTML =
            '<img src="troll.png">';
    } else {
        document.getElementById("result").innerHTML = "<p>Incorrect, try again.</p>";
    }
});
