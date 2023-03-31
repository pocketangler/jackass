import createApp, { Router } from "express";
import { InfluxDB } from "@influxdata/influxdb-client";

export default function buildApp({ secrets: { INFLUXDB_URL, INFLUXDB_TOKEN} }) {

    const app = createApp();
    const riverLevels = new Router();
    app.use("/river-levels", riverLevels);

    riverLevels.get("/", async (req, res) => {

        const client = new InfluxDB({
             url: INFLUXDB_URL.value(),
             token: INFLUXDB_TOKEN.value()
        });
        const queryApi = client.getQueryApi("PocketAngler");
        const query = `

            option v = {timeRangeStart: -1d, timeRangeStop: now()}

            from(bucket: "riverlevels")
                |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
                |> filter(fn: (r) => r["riverName"] == "Deveron")
                |> filter(fn: (r) => r["_field"] == "latestUpdatedTime" or r["_field"] == "levelValue")
                |> filter(fn: (r) => r["_measurement"] == "waterlevel")

        `;
        const results = await queryApi.collectRows(query);
        res.send(results);

    });

    return app;

};
