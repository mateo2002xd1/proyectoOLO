'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import {
  cumplePolitica,
  esPasswordRepetida,
  MENSAJE_PASSWORD_REPETIDA,
  primerFallo,
  repiteLaPassword,
} from '@olo/password-policy';
import { getProfileData, changePassword } from '../profile.actions';
import { PasswordRequisitos } from '../../auth/components/auth-ui';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import { ErrorDeCampo } from '@/shared/ui/molecules/alert';

type CampoPerfil = 'password_actual' | 'password_nueva' | 'password_confirmacion';
type ErroresPerfil = Partial<Record<CampoPerfil, string>>;

/*
 * El campo de este formulario, normal y con error. Dos clases enteras y no un borde rojo
 * añadido detrás: con dos colores de borde en la misma lista gana el que Tailwind escriba
 * después en su hoja, no el último de la lista. El rojo es el de los mensajes de error.
 */
const campoComun =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 transition-colors bg-white dark:bg-gray-800 dark:text-gray-100';
const campoNormal = `${campoComun} border-gray-300 dark:border-gray-700 focus:ring-[#1FACE3] focus:border-[#1FACE3]`;
const campoConError = `${campoComun} border-[#d90000] dark:border-[#ff6b6b] focus:ring-[#d90000] focus:border-[#d90000]`;

export function ProfileForm() {
    const [showActual, setShowActual] = useState(false);
    const [showNueva, setShowNueva] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passwordNueva, setPasswordNueva] = useState('');
    // Lo que falta o está mal, campo por campo: borde rojo y aviso debajo al pulsar
    // «Cambiar Contraseña»; el de un campo se borra en cuanto se escribe en él.
    const [errores, setErrores] = useState<ErroresPerfil>({});

    const quitarError = (campo: CampoPerfil) =>
        setErrores((previos) => {
            if (!previos[campo]) return previos;
            const siguientes = { ...previos };
            delete siguientes[campo];
            return siguientes;
        });

    /** Atributos de un campo según tenga error o no: clase, `aria-invalid` y a qué aviso apunta. */
    const propsDeCampo = (campo: CampoPerfil, extra = '') => ({
        className: `${errores[campo] ? campoConError : campoNormal} ${extra}`.trim(),
        'aria-invalid': Boolean(errores[campo]) || undefined,
        'aria-describedby': errores[campo] ? `${campo}-error` : undefined,
    });

    const [userData, setUserData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
    });

    useEffect(() => {
        getProfileData().then((res) => {
            if (res.success && res.data) {
                setUserData({
                    nombre: res.data.name || '',
                    apellidos: res.data.apellidos || '',
                    correo: res.data.email || '',
                });
            }
        });
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form.entries());

        // Todo se revisa de una vez y cada falta se marca en su campo, en vez del globo del
        // navegador —que solo enseña el primero— o de un mensaje arriba que no dice dónde
        // está el problema.
        const texto = (clave: CampoPerfil) => String(data[clave] ?? '');
        const nuevos: ErroresPerfil = {};

        if (!texto('password_actual')) {
            nuevos.password_actual = 'Ingresa tu contraseña actual.';
        }

        if (!texto('password_nueva')) {
            nuevos.password_nueva = 'Falta la nueva contraseña.';
        } else if (!cumplePolitica(texto('password_nueva'))) {
            nuevos.password_nueva = primerFallo(texto('password_nueva')) ?? 'La contraseña no cumple los requisitos.';
        } else if (repiteLaPassword(texto('password_nueva'), texto('password_actual'))) {
            // Igual a la actual que acaba de escribir: no hace falta preguntar al servidor.
            nuevos.password_nueva = MENSAJE_PASSWORD_REPETIDA;
        }

        if (!texto('password_confirmacion')) {
            nuevos.password_confirmacion = 'Falta confirmar la contraseña.';
        } else if (texto('password_nueva') !== texto('password_confirmacion')) {
            nuevos.password_confirmacion = 'Las contraseñas nuevas no coinciden.';
        }

        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        const formElement = e.currentTarget;

        startTransition(async () => {
            const res = await changePassword(data);
            // Repite la actual o la anterior: el aviso va en el campo de la nueva, con
            // su borde rojo, y no arriba (pedido del usuario, 2026-10-15).
            if (!res.success && esPasswordRepetida(res)) {
                setErrores({ password_nueva: res.error });
                return;
            }
            if (!res.success) {
                setMessage({ type: 'error', text: res.error || 'Error al cambiar contraseña' });
                return;
            }

            setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
            setPasswordNueva('');
            setShowActual(false);
            setShowNueva(false);
            setShowConfirm(false);
            setErrores({});
            formElement.reset();
        });
    };

    return (
        <div className="dark:bg-transparent max-w-4xl">
            <h2 className="admin-header text-[#001631] dark:text-gray-100 mb-6">Mi Perfil</h2>

            {message?.type === 'success' && (
                <MensajeEstado tipo="exito" className="mb-6">
                    {message.text}
                </MensajeEstado>
            )}
            {message && message.type !== 'success' && (
                <MensajeEstado tipo="error" rol="alert" className="mb-6">
                    {message.text}
                </MensajeEstado>
            )}

            {/* Datos del Usuario (Solo lectura) */}
            <div className="space-y-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            value={userData.nombre}
                            readOnly
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                            placeholder="Cargando..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            id="apellidos"
                            value={userData.apellidos}
                            readOnly
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                            placeholder="Cargando..."
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="correo"
                            value={userData.correo}
                            readOnly
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                            placeholder="Cargando..."
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Para modificar el nombre o correo, realiza la edición desde el módulo de{' '}
                            <a href="/admin/users" className="text-brand-interactive hover:underline font-medium">
                                Accesos &gt; Usuarios
                            </a>.
                        </p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700 my-8" />

            {/* Formulario de Cambio de Contraseña */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Cambiar Contraseña
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Ingresa tu contraseña actual y define una nueva clave que cumpla con los requisitos de seguridad.
                    </p>

                    <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200/80 dark:border-gray-700">
                        <div className="space-y-2 max-w-md">
                            <label htmlFor="password_actual" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Contraseña Actual
                            </label>
                            <div className="relative">
                                <input
                                    type={showActual ? 'text' : 'password'}
                                    id="password_actual"
                                    name="password_actual"
                                    onChange={() => quitarError('password_actual')}
                                    {...propsDeCampo('password_actual', 'pr-10')}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowActual(!showActual)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showActual ? (
                                        <EyeSlashIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errores.password_actual && (
                                <ErrorDeCampo id="password_actual-error">{errores.password_actual}</ErrorDeCampo>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <label htmlFor="password_nueva" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNueva ? 'text' : 'password'}
                                        id="password_nueva"
                                        name="password_nueva"
                                        value={passwordNueva}
                                        onChange={(e) => {
                                            setPasswordNueva(e.target.value);
                                            quitarError('password_nueva');
                                        }}
                                        {...propsDeCampo('password_nueva', 'pr-10')}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNueva(!showNueva)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showNueva ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errores.password_nueva && (
                                    <ErrorDeCampo id="password_nueva-error">{errores.password_nueva}</ErrorDeCampo>
                                )}
                                <PasswordRequisitos password={passwordNueva} className="" />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="password_confirmacion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        id="password_confirmacion"
                                        name="password_confirmacion"
                                        onChange={() => quitarError('password_confirmacion')}
                                        {...propsDeCampo('password_confirmacion', 'pr-10')}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        {showConfirm ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {errores.password_confirmacion && (
                                    <ErrorDeCampo id="password_confirmacion-error">{errores.password_confirmacion}</ErrorDeCampo>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className={`px-6 py-2.5 bg-brand-interactive text-white font-medium rounded-lg hover:bg-brand-interactive-hover focus:outline-none focus:ring-2 focus:ring-brand-focus focus:ring-offset-2 transition-colors shadow-sm ${
                            isPending ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isPending ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                </div>
            </form>
        </div>
    );
}
