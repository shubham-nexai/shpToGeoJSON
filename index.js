const fs = require("fs");
const shapefile = require("shapefile");
const shpWrite = require("shp-write");
const proj4 = require("proj4");

const fromProjection =
  "+proj=utm +zone=43 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const toProjection = "+proj=longlat +datum=WGS84 +no_defs";

const ans = proj4(
  fromProjection,
  toProjection,
  [750177.7778000003, 3150336.9010000005]
);
// console.log(ans)

// Load the Shapefile
const shpFilePath = "Point.shp";
const geojsonFilePath = "newsPoint.geojson";
// proj4.defs(fromProjection, proj4.defs('EPSG:32643'));
// proj4.defs(toProjection, proj4.defs('EPSG:4326'));

shapefile
  .read(shpFilePath)
  .then((source) => {
    // Convert coordinates for all features
    const convertedFeatures = source.features.map((feature) => {
      let temp = [];
      let arrr = feature.geometry.coordinates;
      if (feature.geometry.type == "Point") {
       
        const ans = proj4(fromProjection, toProjection, arrr);
        feature.geometry.coordinates = ans
      } else if (feature.geometry.type == "LineString") {
       for(let i=0; i<arrr.length;i++){
          const ans=proj4(fromProjection,toProjection,arrr[i]);
          temp.push(ans)
      }

      feature.geometry.coordinates=temp
      }else{
        const convertedCoordinates = feature.geometry.coordinates.map(coords => {
            return coords.map(coord => {
                const convertedCoord = proj4(fromProjection, toProjection, coord);
                return [convertedCoord[0], convertedCoord[1]];
            });
        });
        feature.geometry.coordinates = convertedCoordinates

      }

      return feature;
    });

    // Create GeoJSON object
    const geojson = {
      type: "FeatureCollection",
      features: convertedFeatures,
    };

    // Write the GeoJSON to a file
    fs.writeFileSync(geojsonFilePath, JSON.stringify(geojson, null, 2));

    console.log(
      "Conversion complete. Converted GeoJSON saved to",
      geojsonFilePath
    );
  })
  .catch((err) => console.error("Error reading Shapefile:", err));
