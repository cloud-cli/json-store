import { readFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import apiRoutes from "./routes.js";
import { LOG } from "./common.js";

const readme = readFileSync(join(process.cwd(), "README.md")).toString("utf8");

const esModule = {
  headers: {
    "Cache-Control": "max-age=604800",
  },
  content: readFileSync(join(process.cwd(), "store-esm.mjs"), "utf8"),
};

const index = readFileSync(join(process.cwd(), "index.html"))
  .toString("utf8")
  .replace("%content%", readme);

const port = process.env.PORT;
const app = express();

app.use(bodyParser.json({ strict: false }));
app.use(cors());
app.get(/^\/store\.m?js/, (req, res) =>
  res
    .set(esModule.headers)
    .send(esModule.content.replace("__API_URL__", req.get("x-forwarded-for")))
);
app.get("/", (_, res) => res.send(index));
app.get("/favicon.ico", (_, res) => res.status(404).send(null));
app.use(apiRoutes);
app.use((_, res) => res.status(404).send("Not found"));

app.listen(port);
LOG(`Started at port ${port}`);
