import { useState } from "react";
import {request} from "../../client/src/request.js";
import { setAccessToken } from "../../client/src/tokenStore.js";

function App()
{
  const [log,setLog] = useState('');

  async function handleReferesh()
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
 



  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <h1>Break My API</h1>
        <button onClick={handleReferesh} >Run Refresh Test</button>
        <pre>{log}</pre>
    </div>
  )
}

export default App;