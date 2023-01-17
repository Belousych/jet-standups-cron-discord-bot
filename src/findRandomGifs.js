const superagent = require('superagent');
const { gifQ, GIF_URL } = require('./config')
const { get_random } = require("./utils");

const findRandomGifs = async () => {
    let delay = 0; const delayIncrement = 250;
    let mergedArray = []



    const promises = gifQ.map((q) => {
        delay += delayIncrement;
        return new Promise(resolve => setTimeout(resolve, delay)).then(() => {
            return superagent.get(`${GIF_URL}?q=${encodeURIComponent(q)}&media_format=mp4&provider=tenor&locale=ru`).retry(5).then(res => {
                // console.log({ q })
                mergedArray = [...mergedArray, ...res.body]
            }).catch((error) => {
                console.log('ERORR', {
                    q,
                    error: error.text
                })
                return []
            })
        })

    })

    return await Promise.all(promises).then(() => {
        const mergedArrayWithoutRepeat = [...new Set([...mergedArray])]
        const item = get_random(mergedArrayWithoutRepeat)
        return item.url
    }).catch(error => {
        console.error(error)

        return null
    })

}

module.exports = findRandomGifs