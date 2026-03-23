export const logRequest = (method: string, path: string) => {
  console.log([IntelCoordinator]   );
};

export const logError = (message: string, error: Error) => {
  console.error([IntelCoordinator][ERROR] , error);
};
