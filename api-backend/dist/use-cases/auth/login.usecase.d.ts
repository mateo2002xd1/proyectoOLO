import jwt from 'jsonwebtoken';
export declare const loginUseCase: (email: string, password: string) => Promise<{
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        isLocal: boolean;
        must_setup_security_questions: boolean;
        must_change_password: boolean;
    };
} | {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: any;
        role_id: string;
        must_setup_security_questions: boolean;
        must_change_password: boolean;
    };
}>;
export declare const verifyTokenUseCase: (token: string) => string | jwt.JwtPayload;
//# sourceMappingURL=login.usecase.d.ts.map