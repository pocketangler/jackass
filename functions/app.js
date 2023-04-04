import createApp, { Router } from "express";
import { InfluxDB } from "@influxdata/influxdb-client";

const projectId = "pocketangler-v1-5";

function objectify(x) {
    if(x instanceof Error)
        return { message: x.stack };
    else
        return { message: x };
}

export default function buildApp({ secrets: { INFLUXDB_URL, INFLUXDB_TOKEN }, auth, logger }) {

    const app = createApp();

    app.use(async (req, res, next) => {

        req.logger = console;
        const traceHeader = req.header("X-Cloud-Trace-Context");
        if (traceHeader) {

            const globalLogFields = {
                "logging.googleapis.com/trace": `projects/${projectId}/traces/${traceHeader.split("/")[0]}`,
                component: "main function",
            };
            const log = (severity, x) => console.log(JSON.stringify({ ...globalLogFields, severity, ...objectify(x) }));
            req.logger = {
                info: log.bind(this, "NOTICE"),
                debug: log.bind(this, "DEBUG"),
                warn: log.bind(this, "WARNING"),
                error: log.bind(this, "ERROR")
            };

        }
        next();

    });

    app.use(async (req, res, next) => {

        req.logger.info("Some info");
        req.logger.warn("A warning");
        req.logger.debug("Debuggery");
        req.logger.error(new Error("Some error"));

        let idToken;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            await req.logger.info(`Found "Authorization" header`);
            // Read the ID Token from the Authorization header.
            idToken = req.headers.authorization.split("Bearer ")[1];
        } else if (req.cookies) {
            await req.logger.info(`Found "__session" cookie`);
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
                await req.logger.error("Error while verifying Firebase ID token:", error);
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
