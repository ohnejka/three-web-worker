export const isNotDefined = (someObject: any): boolean => {
  return someObject === undefined || someObject === null;
};

export const stringIsEmptyOrUndefined = (someString: string): boolean => {
  return isNotDefined(someString) || someString.trim().length === 0;
};

export const isUndefined = (someObject: any): boolean => {
  return typeof someObject === 'undefined';
}

export const isDefined = (someValue: any): boolean => {
  return typeof someValue !== 'undefined' && someValue !== null;
}
