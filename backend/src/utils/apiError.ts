class ApiError extends Error {
    statusCode: number;
    data: any;
    message: string;
    success: boolean;
    errors: any[];

    constructor(
        statusCode: number,
        message = "Something went wrong",
        errors: any[] = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // You mentioned reading the documentation here, so you might want to assign a value based on documentation
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
