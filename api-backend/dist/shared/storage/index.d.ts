export declare const storage: {
    upload: (file: Buffer, path: string) => Promise<{
        url: string;
    }>;
    download: (path: string) => Promise<Buffer<ArrayBuffer>>;
    delete: (path: string) => Promise<void>;
};
//# sourceMappingURL=index.d.ts.map