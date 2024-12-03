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

async function getRandomGif(query) {
    try {
        const response = await superagent
            .get('https://api.giphy.com/v1/gifs/search')
            .query({
                api_key: process.env.API_KEY_GIPHY,
                q: query,
                limit: 50
            });

        // Маппим результаты на массив ссылок
        const gifs = response.body.data.map(gif => gif.images.original.url);
        const item = get_random(gifs)
        return item;
    } catch (error) {
        console.error('Error fetching GIFs:', error);
        return false;
    }
}


module.exports = {
    findRandomGifs,
    getRandomGif
}