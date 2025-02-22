export function extractTime(dataString) {
    const date = new Date(dataString);
    const hours = padZero(date.getHours());
    const minute = padZero(date.getMinutes());

    return `${hours}:${minute}`;
}

//helper function to pad single- digit numbers with a leading zero
function padZero(number){
    return number.toString().padStart(2,'0');
}