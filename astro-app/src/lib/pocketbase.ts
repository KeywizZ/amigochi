import PocketBase from "pocketbase";

const POCKETBASE_URL =
  process.env.POCKETBASE_URL ||
  import.meta.env.POCKETBASE_URL ||
  "http://127.0.0.1:8090";

export function createClient() {
  return new PocketBase(POCKETBASE_URL);
}
