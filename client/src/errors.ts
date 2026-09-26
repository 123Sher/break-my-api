// The single shape every failure in the app takes, whether it's
// a timeout, a cancelled request, a network drop, or an HTTP error status.
export type ApiErrorKind = "timeout" | "cancelled" | "network" | "http";




//Your ApiError class is not starting from scratch; 
// it inherits (extends) the built-in JavaScript Error class.

//Error => parent class
//ApiError => child class

//. In JavaScript, a child class is not allowed to create its own internal workspace
//  (its this context) until it first calls its parent's constructor.

// why message passed to super?
//The parent JavaScript Error class already has a built-in, 
// highly optimized way of handling the main text description of an error. 
// It expects that description to be passed in as the very first argument.


//Inside the class, the constructor is a special function that runs
//  the exact moment you create a new error. 
// It accepts the details as arguments and assigns them to the slots (kind, status, etc.).
export class ApiError extends Error {
  kind: ApiErrorKind;       // broad category: where did this fail?
  status?: number;          // HTTP status code, only set when kind === "http"
  code?: string;            // machine-readable code from the server body, e.g. "TOKEN_EXPIRED"
  errors?: Record<string, string>; // field-level validation errors, e.g. { email: "..." }

  constructor(
    message: string,
    options: { kind: ApiErrorKind; status?: number; code?: string; errors?: Record<string, string> }
  ) {
      super(message); //1. Passes the main text message to the parent Error class
      this.name = "ApiError";
      this.kind = options.kind;
      this.status = options.status;
      this.code = options.code;
      this.errors = options.errors;
  }
}