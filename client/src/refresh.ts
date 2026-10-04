import { request } from "./request";
import { setAccessToken } from "./tokenStore";


//It acts as a cache for the ongoing network request.
let refreshPromise :Promise<string> | null = null;


// executes an asynchronous HTTP POST request to a /refresh endpoint 
// to obtain a new access token, 
// specifically bypassing the application's normal authentication checks 
// so the request doesn't get stuck in a loop.

//async function doRefresh(): Promise<string> 
// explicitly states that this function returns a Promise object. 
// When that promise successfully finishes (resolves), 
// it will yield a value that is a string (the new token).
async function doRefresh():Promise<string>
{
    //<{ accessToken: string }> =>It tells TypeScript exactly what shape of data to expect back from the server.
    const data = await request<{accessToken:string}>("/refresh",
        {
            method:"POST",
            skipAuth:true,
            credentials:"include",
        }
    )
    setAccessToken(data.accessToken);
    return data.accessToken;
}




//This code implements a highly effective pattern in frontend development called Promise Memoization (or Request Collapsing).
//Its core purpose is to prevent duplicate network requests. 
// If five API calls fail at the exact same time because the token expired, 
// this function ensures the application only calls the /refresh endpoint once,
//  while making all five requests share the exact same new token.
export function refreshAccessToken():Promise<string>
{
    if(!refreshPromise)
    {
        //(No refresh is happening right now)
        //doRefresh() kicks off the actual network call to fetch the new token.
        //.finally() is attached to that call. As we discussed, finally always runs, 
        // meaning the exact millisecond the network request finishes (whether it succeeds or crashes), 
        // refreshPromise is reset back to null.

        refreshPromise = doRefresh().finally(() => {
            //This ensures that future token expirations down the line can trigger
            //  a brand new refresh cycle.
            refreshPromise = null;

        })
    }
    // If it is already holding a Promise (A refresh is already in progress):
    //  The code inside the if block is skipped completely.



    //The function returns the active Promise. 
    // Because multiple concurrent calls will skip the if block, 
    // they all receive the exact same Promise instance. 
    // When that single network request resolves, 
    // every single pending function waiting on it will wake up at the same time
    //  with the new token.
    return refreshPromise;
}