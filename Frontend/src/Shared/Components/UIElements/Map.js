// const Map = (props) => {
//   const mapRef = useRef();

//   const lng = props.center.lng;
//   const lat = props.center.lat;

//   useEffect(() => {
//     if (lng === undefined || lat === undefined) return;
//     const map = new OLMap({
//       target: mapRef.current,
//       layers: [
//         new TileLayer({
//           source: new OSM(),
//         }),
//       ],
//       view: new View({
//         center: fromLonLat([lng, lat]),
//         zoom: props.zoom,
//       }),
//     });

//     return () => map.setTarget(null);
//   }, [props.zoom, lat, lng]);

//   return (
//     <div
//       ref={mapRef}
//       className={`map ${props.className}`}
//       style={{
//         width: "100%",
//         height: "350px",
//         position: "relative",
//       }}
//     ></div>
//   );
// };

import React, { useRef, useEffect } from "react";
import "ol/ol.css";
import { Map as OLMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Feature } from "ol";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Icon } from "ol/style";
import locationMarker from "../../../assets/gps.png";

const Map = (props) => {
  const mapRef = useRef();
  const mapInstance = useRef(null);

  const lng = props.center?.lng;
  const lat = props.center?.lat;
  const zoom = props.zoom || 16;

  useEffect(() => {
    if (!lng || !lat) return;

    const locationFeature = new Feature({
      geometry: new Point(fromLonLat([lng, lat])),
    });

    locationFeature.setStyle(
      new Style({
        image: new Icon({
          src: locationMarker,
          scale: 0.1,
          anchor: [0.5, 1],
        }),
      })
    );

    const vectorSource = new VectorSource({
      features: [locationFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    if (!mapInstance.current) {
      mapInstance.current = new OLMap({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          vectorLayer,
        ],
        view: new View({
          center: fromLonLat([lng, lat]),
          zoom,
        }),
      });
    } else {
      const map = mapInstance.current;
      map.getLayers().setAt(1, vectorLayer);
      const view = map.getView();
      view.setCenter(fromLonLat([lng, lat]));
      view.setZoom(zoom);
    }
  }, [lng, lat, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className || ""}`}
      style={{ width: "100%", height: "340px", position: "relative" }}
    />
  );
};

export default Map;
