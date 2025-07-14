import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { GeoJSON } from "react-leaflet";

import { semarangData } from "../assets/semarang";
import { useRef, useState } from "react";
import type {
  LeafletMouseEvent,
  GeoJSON as LeafletGeoJSON,
  Layer,
  PathOptions,
} from "leaflet";
import type { Feature, Geometry } from "geojson";
import { Button, ButtonGroup } from "rsuite";

type datasType = {
  sk_terbit: number;
  ditolak: number;
  kecamatan: string;
}[];

type GeoComponentType = {
  data: datasType;
  resumeTotal: [number, number];
};

const GeoComponent = ({ data, resumeTotal }: GeoComponentType) => {
  const geoRef = useRef<LeafletGeoJSON<any, Geometry>>(null);
  const [kecamatan, setkecamatan] = useState("");
  const [total, setTotal] = useState([0, 0]);
  const [status, setStatus] = useState<"ditolak" | "terbit">("terbit");

  const getColor = (
    datas: datasType,
    layer: Feature<Geometry, any>
  ): PathOptions => {
    let min = Math.min(
      ...datas.map((o) => (status == "ditolak" ? o.ditolak : o.sk_terbit))
    );
    let max = Math.max(
      ...datas.map((o) => (status == "ditolak" ? o.ditolak : o.sk_terbit))
    );
    let rangeMinMax = max - min;
    let range1 = min + (rangeMinMax * 1) / 6;
    let range2 = min + (rangeMinMax * 2) / 6;
    let range3 = min + (rangeMinMax * 3) / 6;
    let range4 = min + (rangeMinMax * 4) / 6;
    let range5 = min + (rangeMinMax * 5) / 6;

    let districtName = layer.properties.name;

    let findtotalByDistrict = data.find(
      (ev) =>
        ev.kecamatan.toLocaleLowerCase() == districtName.toLocaleLowerCase()
    );

    if (!findtotalByDistrict) return {};

    let districtValue =
      findtotalByDistrict[status == "ditolak" ? "ditolak" : "sk_terbit"];

    let color = "";
    if (districtValue > range5) {
      color = status == "ditolak" ? "#c10007" : "#008236";
    } else if (districtValue > range4) {
      color = status == "ditolak" ? "#e7000b" : "#00a63e";
    } else if (districtValue > range3) {
      color = status == "ditolak" ? "#fb2c36" : "#00c950";
    } else if (districtValue > range2) {
      color = status == "ditolak" ? "#ff6467" : "#05df72";
    } else if (districtValue > range1) {
      color = status == "ditolak" ? "#ffa2a2" : "#7bf1a8";
    } else {
      color = status == "ditolak" ? "#ffc9c9" : "#b9f8cf";
    }

    return {
      weight: 2,
      fillOpacity: 0.7,
      fillColor: color,
      dashArray: "3",
    };
  };

  return (
    <>
      <div className="bg-red-200 "></div>
      <div className="bg-green-200 "></div>

      <div style={{ position: "relative", width: "100%", height: "630px" }}>
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
            key={JSON.stringify([...data, status])}
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
                  layer.closePopup();
                  setkecamatan("");
                  setTotal([0, 0]);
                },
              });
            }}
            style={(e) => {
              if (e == undefined) {
                return {};
              }

              return getColor(data, e);
            }}
          ></GeoJSON>
        </MapContainer>

        <div className="absolute min-w-40 bg-white top-5 right-5 z-9999 px-4">
          <div>
            <p className="font-semibold text-xl">Total</p>
            <div className="flex  space-x-2 h-12">
              <div className="w-2 h-10 bg-red-700 "></div>

              <div className="flex flex-col-reverse pb-1">
                <p className="text-base  ">{resumeTotal[0]}</p>

                <p className="text-xs ">Ditolak</p>
              </div>
            </div>

            <div className="flex  space-x-2 h-12 pb-1">
              <div className="w-2 h-10 bg-green-600 "></div>

              <div className="flex flex-col-reverse">
                <p className="text-base  ">{resumeTotal[1]}</p>

                <p className="text-xs ">Sk Terbit</p>
              </div>
            </div>
          </div>

          {kecamatan != "" && (
            <div className="mt-5">
              <p className="font-semibold text-xl">
                {kecamatan == "" ? "Kota Semarang" : kecamatan}
              </p>
              <div className="flex  space-x-2 h-12">
                <div className="w-2 h-10 bg-red-700 "></div>

                <div className="flex flex-col-reverse pb-1">
                  <p className="text-base  ">{total[0]}</p>

                  <p className="text-xs ">Ditolak</p>
                </div>
              </div>

              <div className="flex  space-x-2 h-12 pb-1">
                <div className="w-2 h-10 bg-green-600 "></div>

                <div className="flex flex-col-reverse">
                  <p className="text-base  ">{total[1]}</p>

                  <p className="text-xs ">Sk Terbit</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <ButtonGroup className="absolute bottom-8  left-1 bg-white">
          <Button
            appearance={status == "ditolak" ? "primary" : "ghost"}
            color={status == "ditolak" ? "red" : undefined}
            onClick={() => {
              setStatus("ditolak");
            }}
          >
            Ditolak
          </Button>
          <Button
            appearance={status == "terbit" ? "primary" : "ghost"}
            color={status == "terbit" ? "green" : undefined}
            onClick={() => {
              setStatus("terbit");
            }}
          >
            SK Terbit
          </Button>
        </ButtonGroup>
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
