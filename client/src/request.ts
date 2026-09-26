import { API_BASE_URL,DEFAULT_TIMEOUT_MS } from "./config";
import { ApiError } from "./errors";
import type { RequestConfig } from "./types";


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

        return response as unknown as T;
    }
    catch(err:any)
    {
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