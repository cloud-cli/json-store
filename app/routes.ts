import express from "express";
import { randomBytes, createHash } from "crypto";
import { LOG } from "./common.js";
import { Adapter } from "./adapter.js";
import { InMemoryAdapter } from "./in-memory-adapter.js";
import { FileAdapter } from "./file-adapter.js";
import { FirebaseAdapter } from "./firebase-adapter.js";

const storageAdapter = process.env.STORAGE || "memory";
let adapter: Adapter;

LOG("Using adapter:", storageAdapter);

switch (storageAdapter) {
  case "memory":
    adapter = new InMemoryAdapter();
    break;

  case "file":
    adapter = new FileAdapter(process.env.DATA_DIR);
    break;

  case "firebase":
    adapter = new FirebaseAdapter(JSON.parse(process.env.FIREBASE_CONFIG));
    break;
}

function checkContentType(req, res, next) {
  if (!req.is("application/json")) {
    return res.status(400).send("Invalid content type");
  }

  next();
}

const router = express.Router();
const routeMatcher = /^\/[0-9a-f]{64}/;

router.get("/new", (_, res) => {
  const seed = randomBytes(64);
  const hash = createHash("sha256").update(seed).digest("hex");
  return res.send({ id: hash });
});

router.get(routeMatcher, async (req, res) => {
  LOG("GET", req.path);
  try {
    const result = await adapter.get(req.path);
    res.status(200).send(result);
  } catch (error) {
    LOG(error);
    res.status(error.message === "NOT_FOUND" ? 404 : 400).send("");
  }
});

router.post(routeMatcher, checkContentType, async (req, res) => {
  LOG("POST", req.path, req.body);
  try {
    await adapter.post(req.path, req.body);
    res.status(201).send("");
  } catch (error) {
    LOG(error);
    res.status(500).send("");
  }
});

router.put(routeMatcher, checkContentType, async (req, res) => {
  LOG("PUT", req.path, req.body);
  try {
    await adapter.put(req.path, req.body);
    res.status(202).send("");
  } catch (error) {
    LOG(error);
    res.status(error.message === "BAD_REQUEST" ? 400 : 500).send("");
  }
});

router.patch(routeMatcher, checkContentType, async (req, res) => {
  LOG("PATCH", req.path, req.body);
  try {
    await adapter.patch(req.path, req.body);
    res.status(202).send("");
  } catch (error) {
    LOG(error);
    res.status(500).send("");
  }
});

router.delete(routeMatcher, async (req, res) => {
  LOG("DELETE", req.path);
  try {
    await adapter.delete(req.path);
    res.status(204).send("");
  } catch (error) {
    LOG(error);
    res.status(500).send("");
  }
});

export default router;
