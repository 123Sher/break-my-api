import { request } from "./request.js";

async function testNetworkError() {
  try {
    await request("/slow?delay=1000", { timeoutMs: 5000 });
  } catch (err) {
    console.log(err);
  }
}
testNetworkError();