//@ts-nocheck
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from "chart.js";
import {
  ChoroplethController,
  BubbleMapController,
  ProjectionScale,
  ColorScale,
  SizeScale,
  topojson,
  GeoFeature,
} from "chartjs-chart-geo";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  ChoroplethController, // or BubbleMapController
  ProjectionScale,
  ColorScale, // for choropleth charts
  SizeScale // for bubble maps
);

import jatengJson from "../assets/jateng.json";
import us from "../assets/us.json";
import { useEffect, useState } from "react";

const GeoComponent = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const nation = topojson.feature(us, us.objects.nation).features;
    const district = topojson.feature(us, us.objects.states).features;
    console.log(nation);
    console.log(district);

    const jateng = topojson.feature(
      jatengJson,
      jatengJson.objects["jawa-tengah"]
    ).features;
    console.log(jateng);

    // const kota = topojson.feature(jatengJson, jatengJson.objects["jawa-tengah"]).features[0]
    // const jateng = topojson.feature(
    //   jatengJson,
    //   jatengJson.objects["jawa-tengah"]
    // ).features[0];

    const config = {
      labels: "JAWA Tengah",
      datasets: [
        {
          label: "States",
          outline: jateng[0],
          data: [
            {
              feature: "dsadna",
              value: 1,
            },
          ],
        },
      ],
    };

    setChartData({
      data: config,
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }, []);
  if (!chartData) return <div>Loading chart...</div>;

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <Chart
        type="choropleth"
        data={chartData.data}
        options={chartData.options}
      />
    </div>
  );
};

export default GeoComponent;
