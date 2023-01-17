function get_random(list) {
    return list[Math.floor((Math.random() * list.length))];
}

// /**
//  * Склонение числительных
//  * @param {Number} number число которое склоняем
//  * @param {Array} titles массив с вариантами склонения слова,
//  * в сторону увеличения
//  * declOfNum(1, ['день', 'дня', 'дней'])
//  */
function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2]
    return titles[
        number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]
    ]
}

module.exports = { get_random, declOfNum }