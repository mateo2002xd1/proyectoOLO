export declare const getAllSitioUsers: () => Promise<import("../../infrastructure/db/models").SitioUser[]>;
export declare const getSitioUserById: (id: string) => Promise<import("../../infrastructure/db/models").SitioUser>;
export declare const createSitioUser: (data: any, createdBy?: string) => Promise<any>;
export declare const updateSitioUser: (id: string, data: any) => Promise<import("../../infrastructure/db/models").SitioUser | null>;
export declare const deleteSitioUser: (id: string) => Promise<{
    message: string;
}>;
export declare const loginSitioUser: (email: string, password: string) => Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        type: string;
    };
}>;
//# sourceMappingURL=sitio-users.usecase.d.ts.map