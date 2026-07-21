import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  AUTH_ROLE_COOKIE_NAME,
  AUTH_USER_NAME_COOKIE_NAME,
  AUTH_MUST_CHANGE_PW_COOKIE_NAME,
  AUTH_MUST_SETUP_SQ_COOKIE_NAME,
} from '@/shared/lib/auth-cookies';

export async function POST() {
  const response = NextResponse.json({ message: 'Sesión cerrada' });

  for (const name of [
    AUTH_COOKIE_NAME,
    AUTH_ROLE_COOKIE_NAME,
    AUTH_USER_NAME_COOKIE_NAME,
    AUTH_MUST_CHANGE_PW_COOKIE_NAME,
    AUTH_MUST_SETUP_SQ_COOKIE_NAME,
  ]) {
    response.cookies.set(name, '', { maxAge: 0, path: '/' });
  }

  return response;
}
