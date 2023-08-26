export const AccessLevel = {
    USER: 1,
    ADMIN: 2,
};

export type AccessLevelType = (typeof AccessLevel)[keyof typeof AccessLevel];

export type UserType = {
    userUuid: string;

    userName: string;

    userEmailId: string;

    userPassword: string;

    userPhoneNumber: string;

    studentId: string;

    accessLevel: AccessLevelType;
};
