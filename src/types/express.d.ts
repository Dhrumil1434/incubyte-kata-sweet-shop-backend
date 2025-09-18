import { Request } from 'express';

export interface UserContext {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user: UserContext; // not optional here
}
