const superagent = require("superagent");
const { YANDEX_PUBLIC_FOLDER, FROM_FOLDER, TARGET_FOLDER, YANDEX_OAUTH_TOKEN } = require("./config");
const { get_random } = require("./utils");

let used_id = [];

// const FILE_SIZE_LIMIT = 8388608; // 8 MB
const FILE_SIZE_LIMIT = 15728640; // 15 MB

const getYandexGif = async () => {
  const folder = await superagent
    .get(
      `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURI(
        YANDEX_PUBLIC_FOLDER
      )}`
    )
    .then((res) => res.body);

  if (folder?._embedded) {
    const items = folder?._embedded?.items || [];
    let itemsFiltered = items.filter(
      (i) => !used_id.includes(i.resource_id) && i.size < FILE_SIZE_LIMIT
    );

    // Если после фильтрации не осталось ни одной картинки, сбрасываем used_id и фильтруем заново
    if (itemsFiltered.length === 0 && items.length > 0) {
      used_id = [];
      itemsFiltered = items.filter((i) => i.size < FILE_SIZE_LIMIT);
    }

    const randomItem = get_random(itemsFiltered);

    if (randomItem) {
      if (YANDEX_OAUTH_TOKEN) {
        try {
          await superagent
            .post(
              `https://cloud-api.yandex.net/v1/disk/resources/move?from=${encodeURIComponent(
                `disk:/${FROM_FOLDER}/${randomItem.name}`
              )}&path=${encodeURIComponent(
                `disk:/${TARGET_FOLDER}/${randomItem.name}`
              )}`
            )
            .set("Authorization", `OAuth ${YANDEX_OAUTH_TOKEN}`)
            .catch((error) => console.error("Move error:", error));

          used_id.push(randomItem.resource_id);
        } catch (error) {
            used_id.push(randomItem.resource_id);
            console.error("Move error:", error)
        }
        // await superagent
        //     .delete(encodeURI(`https://cloud-api.yandex.net/v1/disk/resources?path=/${folder.name}${randomItem.path}`))
        //     .set('Authorization', `OAuth ${YANDEX_OAUTH_TOKEN}`)
        //     .then(res => res.body)
        //     .catch(error => console.error(error))
        
      } else {
        used_id.push(randomItem.resource_id);
      }
      return {
        total: itemsFiltered.length - 1,
        url: randomItem.file,
        ...randomItem,
      };
    } else {
      used_id = [];
      return null;
    }
  } else {
    used_id = [];
    return null;
  }
};




module.exports = getYandexGif;
