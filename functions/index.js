import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";


const auth = getAuth(initializeApp());

import buildApp from "./app.js";

const INFLUXDB_URL = defineSecret("INFLUXDB_URL");
const INFLUXDB_TOKEN = defineSecret("INFLUXDB_TOKEN");

const app = buildApp({
    secrets: {
        INFLUXDB_URL,
        INFLUXDB_TOKEN
    },
    auth
});

export const main = onRequest(
    {
        secrets: [
            "INFLUXDB_URL",
            "INFLUXDB_TOKEN"
        ],
        maxInstances: 10,
        region: "europe-west1"
    },
    app
);
