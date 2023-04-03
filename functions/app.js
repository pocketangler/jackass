import createApp, { Router } from "express";
import { InfluxDB } from "@influxdata/influxdb-client";

export default function buildApp({ secrets: { INFLUXDB_URL, INFLUXDB_TOKEN }, auth }) {

    console.log(auth.verifyIdToken);
    const app = createApp();

    app.use(async (req, res, next) => {

        let idToken;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            console.log('Found "Authorization" header');
            // Read the ID Token from the Authorization header.
            idToken = req.headers.authorization.split('Bearer ')[1];
        } else if (req.cookies) {
            console.log('Found "__session" cookie');
            // Read the ID Token from cookie.
            idToken = req.cookies.__session;
        } else {
            // No cookie
            res.status(403).send({ type: "error", description: "Unauthorized" });
            return;
        }
        if (idToken) {
            try {
                const decodedIdToken = await auth.verifyIdToken(idToken);
                req.user = decodedIdToken;
                next();
            } catch (error) {
                console.error("Error while verifying Firebase ID token:", error);
                res.status(403).send({ type: "error", description: "Unauthorized" });
            }
        }

    });

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
