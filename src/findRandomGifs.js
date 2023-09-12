const superagent = require('superagent');
const { gifQ, GIF_URL } = require('./config')
const { get_random, shuffle } = require("./utils");

const findRandomGifs = async (gifs = []) => {
    shuffle(gifs)
    let delay = 0; const delayIncrement = 500;
    let mergedArray = []

    const promises = gifs.map((q) => {
        
        delay += delayIncrement;
        return new Promise(resolve => setTimeout(resolve, delay)).then(() => {
            return superagent.get(`${GIF_URL}?q=${encodeURIComponent(q)}&media_format=mp4&provider=tenor&locale=ru`).retry(5).then(res => {
                // console.log({ q })
                mergedArray = [...mergedArray, ...res.body]
            }).catch((error) => {
                console.log('ERORR', {
                    q,
                    error: error
                })
                // return []
            })
        })

    })

    return await Promise.all(promises).then(() => {
        const mergedArrayWithoutRepeat = [...new Set([...mergedArray])]
        
        const item = get_random(mergedArrayWithoutRepeat)
        return item.url || item.src || item.gif_src || ''
    }).catch(error => {
        console.error(error)

        return null
    })

}

module.exports = findRandomGifs