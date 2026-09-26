import { API_BASE_URL,DEFAULT_TIMEOUT_MS } from "./config";
import { ApiError } from "./errors";
import type { RequestConfig } from "./types";


async function safeParseJson(response:Response): Promise<any>
{
    const text = await response.text(); //By using response.text() first, 
    //we safely capture whatever the server sent as a string,
    // even success JSON response turns to '{"id": 101, "name": "Alice"}' string.
    if(!text) return null;
    try{
        return JSON.parse(text);
    }
    catch{
        return null;
    }
}

//By using <T> and Promise<T>, you are telling TypeScript: 
// "When this function finishes, it will return a Promise containing data that
//  matches whatever type the caller specifies."
export async function request<T>(path:string,config:RequestConfig={}): Promise<T>{
    const controller = new AbortController();
    const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;


    //A setTimeout is scheduled for the duration specified in timeoutMs 
    // (e.g., 5000 for 5 seconds). If that duration passes before the server responds, 
    // the callback fires, marks timedOut as true, and calls controller.abort(). 
    // This instantly cancels the native HTTP fetch request
    //  and forces it to throw an error you can catch.
    let timedOut = false;
    let timer = setTimeout(() =>{
        timedOut=true;
        controller.abort();
    },timeoutMs);


    //forwarding caller's abort signal :  Because your request function uses its own 
    // internal controller to manage the request (needed for the timeout feature above), 
    // it needs to listen to external cancel events.
    if(config.signal)
    {
        config.signal.addEventListener("abort",() => controller.abort());
    }

    try {
        const response = await fetch(`${API_BASE_URL}${path}`,{
            method: config.method ?? "GET",
            headers: config.headers,
            body: config.body ?? null,
            signal: controller.signal, //tells the browser's native network engine to link 
            //this specific HTTP request to your controller.
            credentials: 'include' // sends the refresh cookie automatically
        });

        if(!response.ok)
        {
            const body = await safeParseJson(response);
            throw new ApiError(body?.message ?? `Request failed with status ${response.status}`,{
                kind:"http",
                status:response.status,
                code: body?.code,
                errors:body?.errors,
            })
        }

        const data = await safeParseJson(response);
        return data as T;
    }
    catch(err:any)
    {
        //this err comes from try block when API call fails
        if (err instanceof ApiError) {
            throw err; // already normalized above, don't re-wrap it
        }
        //When a browser network request is interrupted by an AbortController, 
        // the browser throws a generic native error with the name 'AbortError'

        //Abort can happen for 2 different reasons:
        //1 either the timer ran out (a timeout), or 
        // 2.the user clicked cancel (a user cancellation).
         if((err as Error).name === 'AbortError')
         {
            if(timedOut)
            {
                throw new ApiError("Request Timed out", {kind:"timeout"});
            }
            throw new ApiError("Request was cancelled", { kind: "cancelled" });
         }
         throw new ApiError("Network error", { kind: "network" });
    }
    finally{
         clearTimeout(timer); //clear the timer if request succeeds
    }
    //If controller.abort() is called: The controller sends a "cancel" pulse down the wire. 
    // Because fetch has a direct line via the signal, it instantly stops downloading data
    //  from the server and immediately triggers a network cancellation.


}