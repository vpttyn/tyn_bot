const randomInt = (string) => {
    const input = string.split(',');
    const start = parseInt(input[0]);
    const end = parseInt(input[1]);
    return Math.floor(Math.random() * (end - start)) + start;
}

module.exports = {
    randomInt
}