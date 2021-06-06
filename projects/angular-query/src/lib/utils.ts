export const prepareParams = (params: Record<string, any> | undefined): Record<string, any> => {
    const response: Record<string, any> = {};
    if (params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          response[key] = params[key];
        }
      });
    }
    return response;
}