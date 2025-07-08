import {
  CheckPicker,
  Container,
  Content,
  DateRangePicker,
  FlexboxGrid,
  Footer,
  Header,
  Nav,
  Navbar,
  Pagination,
  Table,
} from "rsuite";
import { FaCog } from "react-icons/fa";
import Column from "rsuite/esm/Table/TableColumn";
import { Cell, HeaderCell } from "rsuite-table";
import { useQuery } from "@tanstack/react-query";
import { axiosClient } from "../config/axios";
import { useState } from "react";
import {
  addDays,
  addMonths,
  format,
  isBefore,
  startOfMonth,
  startOfYear,
} from "date-fns";
import type { DateRange } from "rsuite/esm/DateRangePicker";
import FlexboxGridItem from "rsuite/esm/FlexboxGrid/FlexboxGridItem";
import DateRangeComponent from "../components/DateRangeComponent";

type groupReturnType = {
  profesi: string;
}[];

export const ListTenagaKesehatan = () => {
  const [range, setRange] = useState<DateRange>([
    startOfMonth(new Date()),
    new Date(),
  ]);

  const [total, settotal] = useState(0);
  const [activePage, setActivePage] = useState(1);
  const [limit, setlimit] = useState(10);

  const [profesi, setprofesi] = useState<string[]>([]);

  const { data: rangeProfesi = [] } = useQuery<groupReturnType>({
    queryKey: ["list-nakes", range],
    queryFn: async () => {
      try {
        let result = await axiosClient.get<[]>(
          `group-nakes?startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}`
        );

        setprofesi([]);

        return result.data;
      } catch (error) {
        return [];
      }
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["list-nakes", activePage, limit, range, profesi],
    queryFn: async () => {
      try {
        let prof = profesi
          .map((e) => {
            return `profesi[]=${e}`;
          })
          .join("&");

        let result = await axiosClient.get(
          `list-nakes?${prof}&page=${activePage}&limit=${limit}&startDate=${format(
            range[0],
            "y-MM-dd"
          )}&endDate=${format(range[1], "y-MM-dd")}`
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
      <FlexboxGrid>
        <FlexboxGridItem colspan={4}>
          <DateRangeComponent onChange={setRange} range={range} />
        </FlexboxGridItem>

        <FlexboxGridItem colspan={4}>
          {rangeProfesi.length > 0 && (
            <CheckPicker
              style={{ width: "100%" }}
              value={profesi}
              data={rangeProfesi.map((e) => ({
                label: e.profesi,
                value: e.profesi,
              }))}
              appearance="default"
              placeholder="Default"
              onSelect={(e) => {
                if (e) {
                  setprofesi(e);
                }
              }}
            />
          )}
        </FlexboxGridItem>
      </FlexboxGrid>

      <Table height={400} data={data} bordered>
        <Column flexGrow={1} align="center" fixed>
          <HeaderCell>Id</HeaderCell>

          <Cell>
            {(rowData, index) => (activePage - 1) * limit + (index ?? 0) + 1}
          </Cell>
        </Column>

        <Column flexGrow={2}>
          <HeaderCell>First Name</HeaderCell>
          <Cell dataKey="nik" />
        </Column>

        <Column flexGrow={2}>
          <HeaderCell>Last Name</HeaderCell>
          <Cell dataKey="nama" />
        </Column>

        <Column flexGrow={2}>
          <HeaderCell>Profesi</HeaderCell>
          <Cell dataKey="profesi" />
        </Column>
        <Column flexGrow={2}>
          <HeaderCell>Gender</HeaderCell>
          <Cell dataKey="email" />
        </Column>
      </Table>

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
