

export function environmentGuard<T extends (...args: any[]) => void>(logFunction: T): T {
  const isProduction = import.meta.env.PROD;

  return function (...args: Parameters<T>) {
    if (isProduction) {
      return;
    }
    logFunction(...args);
  } as T;

}