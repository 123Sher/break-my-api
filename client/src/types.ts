//the keys method, header, body are standard keys for browsers native fetch
//but the keys skipAuth, timeoutMs are customised for application.

//this  interface extends the capabilities of the browser's native fetch API. 
// It cleanly separates standard network options from your 
// application-specific configurations like timeoutMs and skipAuth.


export interface RequestConfig {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?:Record<string,string>; // Record<string, string> is a utility type used to 
    // define a dictionary object where both the keys and the values are strings.
    body?:BodyInit | null;//BodyInit is a built-in TypeScript utility type that defines 
    //the valid data types you can pass as the body of an HTTP request or response.
    timeoutMs?:number;
    signal?:AbortSignal;//An AbortSignal is a built-in browser object 
    //that allows you to cancel an HTTP request after it has already started.
    skipAuth?:boolean; // Because skipAuth is optional (skipAuth?: boolean), 
    // it defaults to undefined if you do not explicitly pass it.
    _retried?: boolean; // internal: marks a request as already retried once after a refresh
    credentials?:string;

}