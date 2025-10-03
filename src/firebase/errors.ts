export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  constructor(context: SecurityRuleContext) {
    const deniedMessage = `Firestore Security Rules denied the following request:\n${JSON.stringify(
      {
        operation: context.operation,
        path: context.path,
        requestData: context.requestResourceData,
      },
      null,
      2
    )}`;

    super(`FirestoreError: Missing or insufficient permissions: ${deniedMessage}`);
    this.name = 'FirestorePermissionError';

    // This is to make the error object serializable for the Next.js error overlay
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
