export type Document<ObjectId = string> = {
  _id: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export enum TokenPurpose {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
}
