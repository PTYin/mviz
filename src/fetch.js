import axios from 'axios'
axios.defaults.baseURL = 'https://ws.audioscrobbler.com/2.0'
axios.defaults.params = {
  api_key: process.env.REACT_APP_API_KEY,
  format: 'json'
}

async function get (params) {
  let res
  try {
    res = await axios.get('/', {params})
  } catch (e) {
    console.error(e)
  }
  return res.data
}

export default async function fetchInfo(json, onProgress) {
  const infoList = []
  const trackMap = new Map(), artistMap = new Map(), albumMap = new Map()
  let step = 0
  try {
    for (let {track, artistName, trackName, endTime, msPlayed} of json) {
      const info = {endTime: endTime || 0, msPlayed: msPlayed || 0,}
      infoList.push(info)
      // const trackInfo = (({name, duration, listeners, playcount, toptags, artist, album}) =>
      //   ({name, duration, listeners, playcount, toptags, artist, album}))
      // (track)
      const trackStr = `${artistName}\t${trackName}`
      const trackInfo = trackMap.get(trackStr) ||
        (({name, duration, listeners, playcount, toptags, artist, album}) =>
          ({name, duration, listeners, playcount, toptags, artist, album}))
        ((await get({
          method: 'track.getInfo',
          track: trackName,
          artist: artistName,
        })).track)
      trackMap.set(trackStr, trackInfo)
      info.track = trackInfo
      if (trackInfo.artist) {
        const artistInfo = artistMap.get(trackInfo.artist.name) ||
          ((({name, image, stats: {listeners, playcount}}) =>
            ({name, image: image && image[0], listeners, playcount})))
          ((await get({
            method: 'artist.getInfo',
            artist: trackInfo.artist.name,
          })).artist)
        artistMap.set(trackInfo.artist.name, artistInfo)
        trackInfo.artist = artistInfo
      }

      if (trackInfo.album && trackInfo.album.title !== undefined) {
        const albumStr = `${trackInfo.album.artist}\t${trackInfo.album.title}`
        const albumInfo = albumMap.get(albumStr) ||
          ((({name, image, listeners, playcount}) =>
            ({name, image: image && image[0], listeners, playcount})))((await get({
            method: 'album.getInfo',
            artist: trackInfo.album.artist,
            album: trackInfo.album.title,
          })).album)
        albumMap.set(albumStr, albumInfo)
        trackInfo.album = albumInfo
      }
      onProgress && onProgress(++step, json.length)
    }
  } catch (e) {
    throw new Error(`Error occurred in step ${step}.`)
  }
  return infoList
}

