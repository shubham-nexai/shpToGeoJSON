const {convert} = require('geojson2shp')

const options = {
  layer: 'my-layer',
  targetCrs: 2154
}

// Paths
async function fun(){
  await convert('chunk_sri_ganganagar_1.geojson', 'dest-shp.zip', options)
}

fun()