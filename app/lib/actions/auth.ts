'use server'

import { cookies } from "next/headers";
import { RedirectType, redirect } from "next/navigation";
import { getFullName } from "../utils";

type AuthState = {
  data: string | object;
}

export const login = async (_currentState: AuthState, formData: FormData) => {
  try {
    const user = {
      usuario: formData.get('user'),
      password: formData.get('password'),
    };
    const res = await fetch('https://login-service-production.up.railway.app/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (res.status === 200) {
      const data = await res.json();
      cookies().set('currentUser', JSON.stringify(data), {
        httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // One day
        path: '/',
      });
      return data;
    }
    return 'Usuario y/o contraseña incorrecto';
  } catch (error) {
    console.log(error);
    return 'Algo salió mal, por favor inténtelo más tarde';
  }
}

export const register = async (_currentState: String, formData: FormData) => {
  try {
    if (formData.get('password') === formData.get('confirmPassword')) {
      const newUser = {
        nombre: getFullName(formData.get('firstName')?.toString() || '', formData.get('lastName')?.toString() || ''),
        usuario: formData.get('user'),
        password: formData.get('password'),
        avatar: formData.get('avatar'),
        type: formData.get('type'),
      };
      const res = await fetch('https://login-service-production.up.railway.app/auth/registrar', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (res.status === 200) {
        return 'Se registro correctamente';
      } else if (res.status === 400) {
        const data = await res.json();
        if (data?.respuesta === 'Usuario ya Existe') {
          return 'Este usuario ya esta registrado';
        } else {
          return 'Error en el registro, revisa que los campos sean validos'
        }
      }
      return 'Error al intentar registrar usuario';
    } else {
      return 'Las contraseñas no son iguales';
    }
  } catch (error) {
    console.log(error);
    if (error) {
      return 'Algo salió mal, por favor inténtelo más tarde';
    }
    throw error;
  }
}

export const logout = () => {
  cookies().delete('currentUser');
  redirect('/login', RedirectType.replace);
}