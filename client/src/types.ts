//the keys method, header, body are standard keys for browsers native fetch
//but the keys skipAuth, timeoutMs are customised for application.


export interface RequestConfig {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?:Record<string,string>; // Record<string, string> is a utility type used to 
    // define a dictionary object where both the keys and the values are strings.
    body?:BodyInit | null;//BodyInit is a built-in TypeScript utility type that defines 
    //the valid data types you can pass as the body of an HTTP request or response.
    timeoutMs?:number;
    signal?:AbortSignal;//An AbortSignal is a built-in browser object 
    //that allows you to cancel an HTTP request after it has already started.
    skipAuth?:boolean;

}