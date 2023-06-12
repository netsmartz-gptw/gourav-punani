export interface SerializedError {
  name?: string;
  message?: string;
  code?: string;
  stack?: string;
}

export interface PendingAction<ThunkArg> {
  type: string;
  payload: undefined;
  meta: {
    requestId: string;
    arg: ThunkArg;
  };
}

export interface FulfilledAction<ThunkArg, PromiseResult> {
  type: string;
  payload: PromiseResult;
  meta: {
    requestId: string;
    arg: ThunkArg;
  };
}

export interface RejectedAction {
  type: string;
  payload: undefined;
  error: SerializedError;
}

export interface RejectedWithValueAction<ThunkArg, RejectedValue> {
  type: string;
  payload: RejectedValue;
  error: { message: "Rejected" };
  meta: {
    requestId: string;
    arg: ThunkArg;
    aborted: boolean;
  };
}

export type Pending = <ThunkArg>(
  requestId: string,
  arg: ThunkArg
) => PendingAction<ThunkArg>;

export type Fulfilled = <ThunkArg, PromiseResult>(
  payload: PromiseResult,
  requestId: string,
  arg: ThunkArg
) => FulfilledAction<ThunkArg, PromiseResult>;

export type Rejected = <ThunkArg>(
  requestId: string,
  arg: ThunkArg
) => RejectedAction<ThunkArg>;

export type RejectedWithValue = <ThunkArg, RejectedValue>(
  requestId: string,
  arg: ThunkArg
) => RejectedWithValueAction<ThunkArg, RejectedValue>;

// userProfile Type
export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  dob: string;
  gender: string;
  profileImageUrl: string;
  phone: string;
  children: any[];
  isPinSet: boolean;
}
