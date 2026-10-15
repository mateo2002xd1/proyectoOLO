'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { getProfileData, changePassword } from '../profile.actions';
import { PasswordRequisitos } from '../../auth/components/auth-ui';

export function ProfileForm() {
    const [showActual, setShowActual] = useState(false);
    const [showNueva, setShowNueva] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passwordNueva, setPasswordNueva] = useState('');

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

        const passwordActual = String(data.password_actual ?? '');
        const passwordNuevaVal = String(data.password_nueva ?? '');
        const passwordConfirmacion = String(data.password_confirmacion ?? '');

        if (!passwordActual) {
            setMessage({ type: 'error', text: 'Ingresa tu contraseña actual' });
            return;
        }

        if (passwordNuevaVal !== passwordConfirmacion) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
            return;
        }

        if (!cumplePolitica(passwordNuevaVal)) {
            setMessage({
                type: 'error',
                text: primerFallo(passwordNuevaVal) ?? 'La contraseña no cumple con los requisitos de seguridad',
            });
            return;
        }

        const formElement = e.currentTarget;

        startTransition(async () => {
            const res = await changePassword(data);
            if (!res.success) {
                setMessage({ type: 'error', text: res.error || 'Error al cambiar contraseña' });
                return;
            }
            setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
            setPasswordNueva('');
            setShowActual(false);
            setShowNueva(false);
            setShowConfirm(false);
            formElement.reset();
        });
    };

    return (
        <div className="dark:bg-transparent max-w-4xl">
            <h2 className="admin-header text-gray-800 dark:text-gray-100 mb-6">Mi Perfil</h2>

            {message && (
                <div
                    className={`p-4 mb-6 rounded-xl text-sm ${
                        message.type === 'success'
                            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                    }`}
                >
                    {message.text}
                </div>
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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white dark:bg-gray-800 dark:text-gray-100 pr-10"
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
                                        onChange={(e) => setPasswordNueva(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white dark:bg-gray-800 dark:text-gray-100 pr-10"
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
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white dark:bg-gray-800 dark:text-gray-100 pr-10"
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
