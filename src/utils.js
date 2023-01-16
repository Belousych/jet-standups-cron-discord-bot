function get_random(list) {
    return list[Math.floor((Math.random() * list.length))];
}

module.exports = { get_random }