import React, { useRef, useEffect } from "react";
import "ol/ol.css";
import { Map as OLMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import "./map.css";

// const Map = (props) => {
//   return (
//     <div className={`map ${props.className}`} style={props.style}>
//       <iframe
//         title="map"
//         width="100%"
//         height="100%"
//         frameBorder="0"
//         scrolling="no"
//         marginHeight="0"
//         marginWidth="0"
//         src={
//           "https://maps.google.com/maps?q=" +
//           props.coordinates.lat.toString() +
//           "," +
//           props.coordinates.long.toString() +
//           "&t=&z=15&ie=UTF8&iwloc=&output=embed"
//         }
//       ></iframe>
//       <script
//         type="text/javascript"
//         src="https://embedmaps.com/google-maps-authorization/script.js?id=5a33be79e53caf0a07dfec499abf84b7b481f165"
//       ></script>
//     </div>
//   );
// };

const Map = (props) => {
  const mapRef = useRef();

  useEffect(() => {
    const map = new OLMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([props.center.long, props.center.lat]),
        zoom: props.zoom,
      }),
    });

    return () => map.setTarget(null); // Cleanup on unmount
  }, [props.center, props.zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={{
        width: "100%",
        height: "350px",
        position: "relative",
      }}
    ></div>
  );
};

export default Map;
