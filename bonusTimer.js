const bonusTime = document.getElementById('touchscreenleft_menu').childNodes[9].innerText;
if (bonusTime.includes("Получить Бонус")) {
    document.getElementById('touchscreenleft_menu').childNodes[9].click();
} else {
    let pureTimeToLeft = bonusTime.substring(bonusTime.indexOf(':')+1);
    function timeToMilliseconds(timeString) {
        const regex = /(\d+)ч (\d+)м (\d+)с/;
        const parts = timeString.match(regex);

        if (!parts) {
            throw new Error('Invalid time format');
        }

        const hours = parseInt(parts[1], 10);
        const minutes = parseInt(parts[2], 10);
        const seconds = parseInt(parts[3], 10);

        return (hours * 3600000) + (minutes * 60000) + (seconds * 1000);
    }

    const milliseconds = timeToMilliseconds(pureTimeToLeft);
    console.log('Ms left: ', milliseconds);

    setTimeout(() => {
        window.location.reload();
    }, milliseconds);
}
