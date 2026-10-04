import { useState } from "react";
import {request} from "../../client/src/request.js";
import { setAccessToken } from "../../client/src/tokenStore.js";
import {buildFormData} from "../../client/src/multipart.js";

function App()
{
  const [log,setLog] = useState('');

  async function handleReset()
  {
    const res = await request<{refreshCalls:number,rejestRefresh:boolean}>('/admin/reset',{method:"POST",skipAuth:true});
    setLog(`Server state reset,${res.refreshCalls}`);
  }

  //why skipAuth for login and referesh?
  //Login proves identity via password; 
  // refresh proves it via the cookie. 
  // Neither needs an Authorization header. 
  // skipAuth also appears in the shouldRefresh check (!config.skipAuth) 
  // specifically so a 401 from these two routes themselves can never 
  // accidentally trigger another refresh attempt, 
  // which could otherwise create strange recursive behavior.
  async function handleStampedeTest()
  {
    setLog("Loggin in");
    const loginData = await request<{accessToken:string}>("/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username:"demo",password:"demo@123"}),
      skipAuth:true,
    });

    setAccessToken(loginData.accessToken);
    setLog("Logged in. Waiting 16s for token to expire...");
    await new Promise((r) =>setTimeout(r,16000));

    setLog("firing 5 /protected calls with expired token");
    const results = await Promise.allSettled([
      request("/protected"),
      request("/protected"),
      request("/protected"),
      request("/protected"),
      request("/protected"),
    ]);


    //So the very first request to discover the expired token is the one 
    // that kicks off the refresh. It doesn't wait for the other four to
    //  also fail first, it reacts immediately, the instant its own 401 
    // comes back. The only reason this works safely is that your 5 requests 
    // are happening fast enough, within milliseconds of each other, 
    // that request #1's refresh is still in-flight when #2 through 
    // #5 check refreshPromise.

    const state = await request<{refreshCalls:number,rejestRefresh:boolean}>('/admin/state',{
      skipAuth:true,
    });

    setLog(`Done.Server refreshCalls: ${state.refreshCalls}.\n` + `results:` + results.map(r => r.status).join(" "));
  }

    

  async function handleRefresh()
  {
    setLog("Logging in...");
    const loginData = await request<{accessToken:string}>('/login',{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({username:"demo",password:"demo@123"}),
      skipAuth:true,
    });

    setAccessToken(loginData.accessToken);
    setLog("Logged in. Waiting 16s for token to expire...");

    await new Promise((r) => setTimeout(r,16000));

    setLog("Calling /protected with an expired token...");

    try{
      const result = await request("/protected");
      setLog("SUCCESS (refresh worked): " + JSON.stringify(result));
    }
    catch(err)
    {
      setLog("FAILED :"+err);
    }
  }
 
  async function handleUploadTest()
  {
    const file = new File(['hello world'],'test.txt',{type:"text/plain"});
    const formData = buildFormData({
      file,
      description:"a test upload",
      tags:["demo","test"],
      uploadedAt: new Date(),
    });

    const result = await request("/upload",{
      method:"POST",
      skipAuth:true,
      body:formData,
    });

    setLog("Upload result:" +JSON.stringify(result));
  }


  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <h1>Break My API</h1>
        <button onClick={handleRefresh} >Run Refresh Test</button>
        <button onClick={handleReset}>Reset server state</button>
        <button onClick={handleStampedeTest}>Run stampede test</button>
        <button onClick={handleUploadTest}>Upload test</button>
        <pre>{log}</pre>
    </div>
  )
}

export default App;


// What this confirms

// Login set the cookie, and the browser kept it
// The token expired after 15 seconds, as designed
// /protected correctly returned 401 TOKEN_EXPIRED
// Your request() function caught that specific condition and called refreshAccessToken()
// /refresh correctly read the cookie (sent automatically by the browser this time) and returned a new token
// The retry used the new token and succeeded
// All of this was invisible to the calling code, which only ever awaited one request("/protected") call