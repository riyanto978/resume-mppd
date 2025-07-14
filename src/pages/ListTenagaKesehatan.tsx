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
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import DateRangeComponent from "../components/DateRangeComponent";

type groupReturnType = {
  profesi: string;
}[];

type KeteranganType = ("Ditolak" | "Dibatalkan" | "SK Diterbitkan")[];

export const ListTenagaKesehatan = () => {
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

  const [keterangan, setKeterangan] = useState<KeteranganType>([]);

  const { data: rangeProfesi = [] } = useQuery<groupReturnType>({
    queryKey: ["list-nakes", range, tipe, sort, sortType],
    queryFn: async () => {
      try {
        let result = await axiosClient.get<[]>(
          `group-nakes?startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(
            range[1],
            "y-MM-dd"
          )}&tipe=${tipe}&sort=${sort}&sort_type=${sortType}`
        );

        setprofesi([]);

        return result.data;
      } catch (error) {
        return [];
      }
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "list-nakes",
      activePage,
      limit,
      range,
      profesi,
      tipe,
      sort,
      sortType,
      keterangan,
    ],
    queryFn: async () => {
      try {
        let prof = profesi
          .map((e) => {
            return `profesi[]=${e}`;
          })
          .join("&");

        let keter = keterangan.map((e) => `keterangan[]=${e}`).join("&");

        let result = await axiosClient.get(
          `list-nakes?${prof}&page=${activePage}&limit=${limit}&startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(
            range[1],
            "y-MM-dd"
          )}&tipe=${tipe}&sort=${sort}&sort_type=${sortType}&${keter}`
        );

        settotal(result.data.total);
        return result.data.data;
      } catch (error) {
        return [];
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
        {rangeProfesi.length > 0 && (
          <CheckPicker
            value={profesi}
            data={rangeProfesi.map((e) => ({
              label: e.profesi,
              value: e.profesi,
            }))}
            appearance="default"
            placeholder="Semua profesi"
            onSelect={(e) => {
              if (e) {
                setprofesi(e);
              }
            }}
          />
        )}

        <CheckPicker
          label="keterangan"
          value={keterangan}
          data={[
            {
              label: "Ditolak",
              value: "Ditolak",
            },
            {
              label: "Dibatalkan",
              value: "Dibatalkan",
            },
            {
              label: "SK Diterbitkan",
              value: "SK Diterbitkan",
            },
          ]}
          appearance="default"
          placeholder="Semua"
          onClean={(e) => {
            setKeterangan([]);
          }}
          onSelect={(e) => {
            if (e) {
              setKeterangan(e);
            }
          }}
        />
      </FlexboxGrid>

      <Table
        loading={isLoading}
        height={400}
        data={data}
        bordered
        sortColumn={sort}
        sortType={sortType}
        onSortColumn={(a, b) => {
          setSort(a);
          setSortType(b ?? "asc");
        }}
      >
        <Column flexGrow={1} align="center" fixed>
          <HeaderCell>No</HeaderCell>
          <Cell>
            {(rowData, index) => (activePage - 1) * limit + (index ?? 0) + 1}
          </Cell>
        </Column>

        <Column flexGrow={2} sortable>
          <HeaderCell>Nomor Register</HeaderCell>
          <Cell dataKey="nomor_register" />
        </Column>

        <Column flexGrow={2}>
          <HeaderCell>Nik</HeaderCell>
          <Cell dataKey="nik" />
        </Column>

        <Column flexGrow={2} sortable>
          <HeaderCell>Nama</HeaderCell>
          <Cell dataKey="nama" />
        </Column>

        <Column flexGrow={2} sortable>
          <HeaderCell>Profesi</HeaderCell>
          <Cell dataKey="profesi" />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>Tempat Praktik</HeaderCell>
          <Cell dataKey="tempat_praktik" />
        </Column>

        <Column flexGrow={2} sortable>
          <HeaderCell>Keterangan</HeaderCell>
          <Cell dataKey="keterangan" />
        </Column>
      </Table>

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
