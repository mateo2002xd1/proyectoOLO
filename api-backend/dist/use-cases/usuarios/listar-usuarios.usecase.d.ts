export declare const getAllUsers: () => Promise<import("../../infrastructure/db/models").User[]>;
export declare const getUserById: (id: string) => Promise<import("../../infrastructure/db/models").User>;
export declare const createUser: (data: any) => Promise<any>;
export declare const updateUser: (id: string, data: any) => Promise<any>;
export declare const deleteUser: (id: string) => Promise<{
    message: string;
}>;
export declare const deactivateExpiredUsers: () => Promise<{
    deactivated: number;
}>;
export declare const getExpirationAlerts: (windowDays?: number) => Promise<{
    alerts: {
        userId: any;
        name: any;
        email: any;
        expiration: string;
        daysLeft: number;
    }[];
    count: number;
}>;
//# sourceMappingURL=listar-usuarios.usecase.d.ts.map