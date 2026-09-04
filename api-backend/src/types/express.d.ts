// Augmentación global de Express — sin imports para que sea un ambient script
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      name: string;
      apellidos?: string;
      role?: string;
      role_id?: string;
      isLocal?: boolean;
      must_setup_security_questions?: boolean;
      must_change_password?: boolean;
    };
  }
}
