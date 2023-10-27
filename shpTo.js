const shapefile = require('shapefile');
const fs = require('fs');
const proj4 = require('proj4');

// Replace with your shapefile path
const shapefilePath = 'my-layer.shp';

// Initialize a GeoJSON feature collection
const featureCollection = {
  type: 'FeatureCollection',
  features: []
};

// Define the projection from your shapefile's coordinate system to WGS 84 (EPSG:4326)
const fromProjection = '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs'; // Replace with your actual projection

// Example: UTM Zone 10N
// const fromProjection = '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs';

const toProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

// Create a projection function
proj4.defs(fromProjection, toProjection);
const transform = proj4(fromProjection, toProjection);

// Read the shapefile
shapefile.open(shapefilePath)
  .then(source => source.read()
    .then(function log(result) {
      if (result.done) return;
      const feature = result.value;

      // Transform the shapefile feature's geometry to WGS 84
      const wgs84Geometry = proj4(transform, feature.geometry.coordinates);

      // Create a GeoJSON feature with the transformed coordinates
      const geojsonFeature = {
        type: 'Feature',
        properties: feature.properties,
        geometry: {
          type: feature.geometry.type,
          coordinates: wgs84Geometry
        }
      };

      // Append the GeoJSON feature to the feature collection
      featureCollection.features.push(geojsonFeature);

      return source.read().then(log);
    }))
    .then(() => {
      // Write the GeoJSON feature collection to a file
      const geojson = JSON.stringify(featureCollection, null, 2);
      fs.writeFileSync('output.geojson', geojson, 'utf-8');
      console.log('GeoJSON file created: output.geojson');
    })
    .catch(error => {
      console.error(error);
    });
