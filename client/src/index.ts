import { request } from "./request.js";
import { setAccessToken } from "./tokenStore.js";

//TIMEOUT : KIND - timeout
///slow?delay=5000 tells the server to wait 5 seconds before answering. 
// timeoutMs: 1000 tells your client to give up after 1 second.
//------------------------------------------------------------------
// async function testNetworkError() {
//   try {
//     await request("/slow?delay=1000", { timeoutMs: 5000 });
//   } catch (err) {
//     console.log(err);
//   }
// }
// testNetworkError();


//CANCEL VIA EXTERNAL SIGNAL : KIND - cancelled
//Here the client's own timeout is set very high (10s), so it would never fire on its own. 
// The only thing that could cancel this request is the external controller.abort() at 500ms.
//--------------------------------------------------------------------------------------------
async function testCancel() {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), 500); // cancel before the 5s delay finishes

  try {
    await request("/slow?delay=5000", { timeoutMs: 10000, signal: controller.signal });
  } catch (err) {
    console.log(err);
  }
}
//testCancel();

//NETWORK FAILURE : KIND - network
//Test proposed: stop the server (Ctrl+C in its terminal), then run:
//With no server listening at all, fetch fails immediately with a connection error, 
// a different kind of failure than an abort.
//------------------------------------------------------------------------------------
// async function test() {
//   try {
//     const res = await request("/slow?delay=5000", { timeoutMs: 1000 });
//     console.log("unexpected success", res);
//   } catch (err) {
//     console.log(err);
//   }
// }

// test();


//HTTP errors normalized correctly (404, 422)
//These hit your server's /api/fail (returns whatever status you ask for) and 
// /api/fail/validate (always returns a fixed 422 with field errors).
//-----------------------------------------------------------------------------
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

//Success responses parsed correctly

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

//testAuthHeader();
// setAccessToken("fake-token-123") stored the token
// request("/protected") read it back via getAccessToken()
// It built headers.Authorization = "Bearer fake-token-123"
// That header actually went out over the network
// The server's requireAuth saw the header, passed the "does it exist and start with Bearer" check, then failed at jwt.verify because the token isn't a real signed JWT
// The server replied 401 with INVALID_TOKEN
// Your client parsed that into a proper ApiError with status: 401, code: "INVALID_TOKEN"




async function testRealRefresh()
{
  const loginData = await request<{ accessToken: string; expiresIn: number }>('/login',{
    method:"POST",
    skipAuth:true,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({username:"demo",password:"demo@123"}),
  });



  console.log("Logged in, token expires in", loginData.expiresIn, "seconds");

  const {setAccessToken} = await import("./tokenStore.js");
  setAccessToken(loginData.accessToken);

  console.log("Waiting for the token to expire...");
  await new Promise((resolve) => setTimeout(resolve, 16000));

  console.log("Calling /protected with an expired token...");
  const result = await request("/protected");
  console.log("SUCCESS, refresh must have kicked in:", result);


}

testRealRefresh();
