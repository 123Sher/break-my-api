import { request } from "./request.js";

async function testHttpError() {
  try {
    await request("/fail?status=404");
  } catch (err) {
    console.log(err);
  }
}

async function testValidation() {
  try {
    await request("/fail/validate", { method: "POST" });
  } catch (err) {
    console.log(err);
  }
}

async function testSuccess() {
  const data = await request("/health");
  console.log("success:", data);
}

testHttpError();
testValidation();
testSuccess();