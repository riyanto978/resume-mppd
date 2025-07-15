import {
  CheckPicker,
  FlexboxGrid,
  Pagination,
  SelectPicker,
  Table,
} from "rsuite";
import Column from "rsuite/esm/Table/TableColumn";
import { Cell, HeaderCell } from "rsuite-table";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../config/axios";
import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import type { DateRange } from "rsuite/esm/DateRangePicker";
import DateRangeComponent from "../components/DateRangeComponent";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type groupReturnType = {
  profesi: string;
}[];

type groupNakesType = {
  sk_terbit: number;
  ditolak: number;
  profesi: string;
}[];

export const ResumeByProfesi = () => {
  const [range, setRange] = useState<DateRange>([
    startOfMonth(new Date()),
    new Date(),
  ]);

  const [total, settotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setlimit] = useState(10);
  const [tipe, settipe] = useState<string>("");
  const [sort, setSort] = useState("nama");
  const [sortType, setSortType] = useState<"asc" | "desc">("asc");

  const [profesi, setprofesi] = useState<string[]>([]);

  const { data: rangeProfesi = [] } = useQuery<groupReturnType>({
    queryKey: ["range-nakes", range, tipe],
    queryFn: async () => {
      try {
        let result = await axiosClient.get<[]>(
          `range-nakes?startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}&tipe=${tipe}`
        );

        setprofesi([]);

        return result.data;
      } catch (error) {
        return [];
      }
    },
  });

  const { data, isLoading } = useQuery<groupNakesType>({
    queryKey: [
      "group-nakes",
      range,
      profesi,
      tipe,
      limit,
      activePage,
      sort,
      sortType,
    ],
    queryFn: async () => {
      try {
        let prof = profesi
          .map((e) => {
            return `profesi[]=${e}`;
          })
          .join("&");

        let result = await axiosClient.get(
          `group-nakes?${prof}&page=${activePage}&limit=${limit}&startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(
            range[1],
            "y-MM-dd"
          )}&tipe=${tipe}&sort=${sort}&sort_type=${sortType}`
        );

        settotal(result.data.total);
        return result.data.data;
      } catch (error) {
        return [];
      }
    },
  });
  const { data: dataTotal } = useQuery<[number, number]>({
    queryKey: ["group-nakes-total", range, profesi, tipe],
    queryFn: async () => {
      try {
        let prof = profesi
          .map((e) => {
            return `profesi[]=${e}`;
          })
          .join("&");

        let result = await axiosClient.get(
          `group-nakes/total?${prof}&startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}&tipe=${tipe}`
        );

        return [result.data.ditolak, result.data.terbit];
      } catch (error) {
        return [0, 0];
      }
    },
  });

  return (
    <>
      <FlexboxGrid className="space-x-1 mb-4">
        <DateRangeComponent onChange={setRange} range={range} />

        <SelectPicker
          label="Tipe"
          value={tipe}
          onClean={() => {
            setActivePage(1);
            settipe("");
          }}
          onChange={(e) => {
            if (e != null) {
              settipe(e);
              setActivePage(1);
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
        {rangeProfesi.length > 0 && (
          <CheckPicker
            value={profesi}
            data={rangeProfesi.map((e) => ({
              label: e.profesi,
              value: e.profesi,
            }))}
            appearance="default"
            label="Profesi"
            placeholder="Semua"
            onClean={() => {
              setActivePage(1);
              setprofesi([]);
            }}
            onSelect={(e) => {
              if (e) {
                setActivePage(1);
                setprofesi(e);
              }
            }}
          />
        )}
      </FlexboxGrid>

      <div className="flex">
        <div className="w-2/3">
          <Table
            loading={isLoading}
            autoHeight
            data={data}
            bordered
            sortColumn={sort}
            sortType={sortType}
            onSortColumn={(a, b) => {
              setSort(a);
              setSortType(b ?? "asc");
            }}
          >
            <Column flexGrow={2} sortable>
              <HeaderCell>Profesi</HeaderCell>
              <Cell dataKey="profesi" />
            </Column>
            <Column flexGrow={2}>
              <HeaderCell>Ditolak</HeaderCell>
              <Cell dataKey="ditolak" />
            </Column>
            <Column flexGrow={2}>
              <HeaderCell>Sk Diterbitkan</HeaderCell>
              <Cell dataKey="sk_terbit" />
            </Column>
          </Table>
        </div>

        <div className="w-1/3">
          <Pie
            options={{
              plugins: {
                datalabels: {
                  color: "#FFF",
                },
              },
            }}
            data={{
              labels: ["Ditolak", "Sk Terbit"],
              datasets: [
                {
                  label: "My First Dataset",
                  data: dataTotal,
                  hoverOffset: 4,
                  backgroundColor: ["rgb(255, 99, 132)", "rgb(255, 205, 86)"],
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="h-8"></div>
      <Pagination
        layout={["total", "-", "limit", "|", "pager", "skip"]}
        total={total}
        limit={limit}
        first
        last
        prev
        next
        maxButtons={6}
        activePage={activePage}
        onChangePage={(e) => setActivePage(e)}
        limitOptions={[10, 30, 50, 100]}
        onChangeLimit={(e) => {
          setActivePage(1);
          setlimit(e);
        }}
      />
    </>
  );
};
