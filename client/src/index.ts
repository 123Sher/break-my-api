import { request } from "./request.js";
import { setAccessToken } from "./tokenStore.js";

// async function testNetworkError() {
//   try {
//     await request("/slow?delay=1000", { timeoutMs: 5000 });
//   } catch (err) {
//     console.log(err);
//   }
// }
// testNetworkError();

// async function testCancel() {
//   const controller = new AbortController();
//   setTimeout(() => controller.abort(), 500); // cancel before the 5s delay finishes

//   try {
//     await request("/slow?delay=5000", { timeoutMs: 10000, signal: controller.signal });
//   } catch (err) {
//     console.log(err);
//   }
// }
// testCancel();


// async function test() {
//   try {
//     const res = await request("/slow?delay=5000", { timeoutMs: 1000 });
//     console.log("unexpected success", res);
//   } catch (err) {
//     console.log(err);
//   }
// }

// test();

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

// testHttpError();
// testValidation();
// testSuccess();

async function testAuthHeader()
{
    setAccessToken("fake-token-123");

    try{
        await request("/protected");
    }
    catch(err)
    {
        console.log(err);
    }
}

testAuthHeader();