import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth } from "date-fns";
import { useState } from "react";
import { CheckPicker, FlexboxGrid, SelectPicker } from "rsuite";
import type { DateRange } from "rsuite/esm/DateRangePicker";
import { axiosClient } from "../config/axios";
import "./table.css";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import DateRangeComponent from "../components/DateRangeComponent";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import GeoComponent from "../components/GeoComponent";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

type ResumeType = {
  dibatalkan: number;
  ditolak: number;
  sk_terbit: number;
  kecamatan: string;
  children: {
    dibatalkan: number;
    ditolak: number;
    sk_terbit: number;
    tipe_fasyankes: string;
  }[];
}[];

const ResumeByDistrict = () => {
  const [range, setRange] = useState<DateRange>([
    startOfMonth(new Date()),
    new Date(),
  ]);

  const [tipe, settipe] = useState<string>("");

  const [kecamatan, setKecamatan] = useState<string[]>([]);

  const { data: listKecamatan = [] } = useQuery<{ kecamatan: string }[]>({
    queryKey: ["resume-district-list-kecamatan", range],
    queryFn: async () => {
      try {
        let result = await axiosClient.get<{ kecamatan: string }[]>(
          `kecamatan/list?startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}`
        );

        return result.data;
      } catch (error) {
        return [];
      }
    },
  });

  const { data = [] } = useQuery<ResumeType>({
    queryKey: ["resume-district", range, tipe, kecamatan],
    queryFn: async () => {
      let kec = kecamatan.map((e) => `kecamatan[]=${e}`).join("&");

      try {
        let result = await axiosClient.get<[]>(
          `resume/district?startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}&tipe=${tipe}&${kec}`
        );

        return result.data;
      } catch (error) {
        return [];
      }
    },
  });

  const { data: resumeTotal = [0, 0] } = useQuery<[number, number]>({
    queryKey: ["resume-total", range, tipe],
    queryFn: async () => {
      try {
        let result = await axiosClient.get<[number, number]>(
          `resume/total?startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}&tipe=${tipe}`
        );

        return result.data;
      } catch (error) {
        return [0, 0];
      }
    },
  });

  return (
    <>
      <FlexboxGrid
        style={{
          marginBottom: "16px",
        }}
        className="space-x-2"
      >
        <DateRangeComponent onChange={setRange} range={range} />

        <SelectPicker
          label="Tipe"
          value={tipe}
          onChange={(e) => {
            if (e != null) {
              settipe(e);
            }
          }}
          placeholder="Pilih Tipe"
          data={[
            {
              label: "Semua",
              value: "",
            },
            {
              label: "Nakes",
              value: "nakes",
            },
            {
              label: "Named",
              value: "named",
            },
          ]}
        />

        <CheckPicker
          label="Kecamatan"
          value={kecamatan}
          data={listKecamatan.map((e) => ({
            label: e.kecamatan,
            value: e.kecamatan,
          }))}
          appearance="default"
          placeholder="Semua"
          onClean={() => {
            setKecamatan([]);
          }}
          onSelect={(e) => {
            if (e) {
              setKecamatan(e);
            }
          }}
        />
      </FlexboxGrid>
      <FlexboxGrid>
        <FlexboxGridItem colspan={12}>
          <table width={"100%"}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Ditolak</th>
                <th>SK Terbit</th>
              </tr>
            </thead>

            <tbody>
              {data.map((e) => (
                <>
                  <tr className="main-row" key={e.kecamatan}>
                    <td>{e.kecamatan == "" ? "-" : e.kecamatan}</td>

                    <td>{e.ditolak}</td>

                    <td>{e.sk_terbit}</td>
                  </tr>

                  {e.children.map((tip) => {
                    return (
                      <tr className="child-row" key={tip.tipe_fasyankes}>
                        <td>{tip.tipe_fasyankes}</td>

                        <td>{tip.ditolak}</td>

                        <td>{tip.sk_terbit}</td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </FlexboxGridItem>

        <FlexboxGridItem colspan={12}>
          <GeoComponent data={data} resumeTotal={resumeTotal} />
        </FlexboxGridItem>
      </FlexboxGrid>
    </>
  );
};

export default ResumeByDistrict;
