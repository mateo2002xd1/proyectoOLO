export declare const getAllSections: () => Promise<import("../../infrastructure/db/models").Section[]>;
export declare const getSectionById: (id: string) => Promise<import("../../infrastructure/db/models").Section>;
export declare const createSection: (data: any) => Promise<import("../../infrastructure/db/models").Section>;
export declare const updateSection: (id: string, data: any) => Promise<import("../../infrastructure/db/models").Section>;
export declare const deleteSection: (id: string) => Promise<{
    message: string;
}>;
//# sourceMappingURL=secciones.usecase.d.ts.map