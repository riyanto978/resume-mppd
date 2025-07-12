import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { GeoJSON } from "react-leaflet";

import { semarangData } from "../assets/semarang";
import { useRef, useState } from "react";
import type {
  LeafletMouseEvent,
  GeoJSON as LeafletGeoJSON,
  Layer,
} from "leaflet";
import type { Feature, Geometry } from "geojson";

type GeoComponentType = {
  data: {
    sk_terbit: number;
    ditolak: number;
    kecamatan: string;
  }[];
  resumeTotal: [number, number];
};

const GeoComponent = ({ data, resumeTotal }: GeoComponentType) => {
  const geoRef = useRef<LeafletGeoJSON<any, Geometry>>(null);
  const [kecamatan, setkecamatan] = useState("");
  const [total, setTotal] = useState([0, 0]);

  return (
    <>
      <div style={{ position: "relative", width: "100%", height: "600px" }}>
        <MapContainer
          style={{ height: "100%", minHeight: "100%" }}
          center={[-7.015, 110.42]}
          zoom={12.45}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          {/* <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          /> */}

          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
            attribution="©OpenStreetMap, ©CartoDB"
          />
          {/* <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
            attribution="©OpenStreetMap, ©CartoDB"
          /> */}

          <GeoJSON
            ref={geoRef}
            key={JSON.stringify(data)}
            data={semarangData}
            filter={(e) => {
              let districtName = e.properties.name;

              let findtotalByDistrict = data.find(
                (e) =>
                  e.kecamatan.toLocaleLowerCase() ==
                  districtName.toLocaleLowerCase()
              );

              if (findtotalByDistrict) {
                return true;
              }

              return false;
            }}
            onEachFeature={(feature: Feature<Geometry, any>, layer: Layer) => {
              layer.on({
                mouseover: (e: LeafletMouseEvent) => {
                  let districtName = e.target.feature.properties.name;
                  layer.bindPopup(districtName).openPopup();

                  e.target.setStyle({
                    weight: 20,
                    color: "#666",
                    dashArray: "",
                    fillOpacity: 0.7,
                  });

                  e.target.bringToFront();

                  let findtotalByDistrict = data.find(
                    (e) =>
                      e.kecamatan.toLocaleLowerCase() ==
                      districtName.toLocaleLowerCase()
                  );

                  let totalByDistrict: [number, number] =
                    findtotalByDistrict == undefined
                      ? [0, 0]
                      : [
                          findtotalByDistrict.ditolak,
                          findtotalByDistrict.sk_terbit,
                        ];

                  setkecamatan(districtName);
                  setTotal(totalByDistrict);
                },
                mouseout: (e) => {
                  geoRef.current?.resetStyle(e.target);
                  layer.unbindPopup();
                  setkecamatan("");
                  setTotal([0, 0]);
                },
              });
            }}
            style={(e) => {
              return {
                weight: 2,
                fillOpacity: 0.7,
                fillColor: "#FED976",
                dashArray: "3",
              };
            }}
          ></GeoJSON>
        </MapContainer>

        <div
          style={{
            position: "absolute",
            width: 150,
            height: 100,
            background: "#FFF",
            top: 20,
            right: 20,
            zIndex: 9999,
          }}
        >
          {kecamatan == "" ? (
            <div>
              Kota Semarang
              <br />- ditolak - {resumeTotal[0]}
              <br />- Sk Terbit - {resumeTotal[1]}
            </div>
          ) : (
            <div>
              kec {kecamatan}
              <br />- ditolak - {total[0]}
              <br />- Sk Terbit - {total[1]}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GeoComponent;

// layer.setPopupContent(PopUpGeo)
// layer.on("mouseover", function (e) {
//   // console.log(e.target.bringToFront());
//   e.target.setStyle({
//     weight: 5,
//     color: "#666",
//     dashArray: "",
//     fillOpacity: 1,
//   });
//   layer.bindPopup(contryName).openPopup(); // here add openPopup()
// });
// layer.on("mouseout", function (e) {
//   console.log(e.target);
//   e.target.setStyle({
//     weight: 2,
//     fillOpacity: 1,
//     fillColor: "#FED976",
//     dashArray: "3",
//   });
//   // layer.unbindPopup();
//   // layer.bindPopup(contryName).openPopup(); // here add openPopup()
// });
