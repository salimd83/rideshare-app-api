class ValidationError extends Error {
  constructor(errors = [], ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    this.message = params[0];
    this.name = 'ValidationError';
    this.errors = errors;
    this.date = new Date();
  }
}

module.exports =  ValidationError;
