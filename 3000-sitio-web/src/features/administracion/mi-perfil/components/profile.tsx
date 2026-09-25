'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { cumplePolitica, primerFallo } from '@olo/password-policy';
import { getProfileData, updateProfileInfo, changePassword } from '../profile.actions';
import { PasswordRequisitos } from '../../auth/components/auth-ui';

export function ProfileForm() {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showActual, setShowActual] = useState(false);
    const [showNueva, setShowNueva] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [passwordNueva, setPasswordNueva] = useState('');

    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
    });

    useEffect(() => {
        getProfileData().then((res) => {
            if (res.success && res.data) {
                setUserId(res.data.id);

                setFormData({
                    nombre: res.data.name || '',
                    apellidos: res.data.apellidos || '',
                    correo: res.data.email || '',
                });
            }
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        if (e.target.name === 'nombre' || e.target.name === 'apellidos') {
            value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        }
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form.entries());

        startTransition(async () => {
            if (isChangingPassword) {
                if (data.password_nueva !== data.password_confirmacion) {
                    setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
                    return;
                }
                // El servidor la exige igualmente; esto solo evita el viaje de ida y
                // vuelta para decir lo que ya se ve en la lista de requisitos.
                if (!cumplePolitica(data.password_nueva as string)) {
                    setMessage({ type: 'error', text: primerFallo(data.password_nueva as string) ?? '' });
                    return;
                }
                const res = await changePassword(data);
                if (!res.success) {
                    setMessage({ type: 'error', text: res.error || 'Error al cambiar contraseña' });
                    return;
                }
                setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
                setIsChangingPassword(false);
            } else {
                if (!userId) {
                    setMessage({ type: 'error', text: 'No se pudo identificar el usuario' });
                    return;
                }
                const res = await updateProfileInfo(userId, {
                    nombre: data.nombre as string,
                    apellidos: data.apellidos as string,
                    correo: data.correo as string,
                });
                if (!res.success) {
                    setMessage({ type: 'error', text: res.error || 'Error al actualizar perfil' });
                    return;
                }

                // Save the exact split to localStorage so it survives reloads (just in case they don't have the backend migration yet)
                localStorage.setItem('user_profile_nombre', data.nombre as string);
                localStorage.setItem('user_profile_apellidos', data.apellidos as string);

                setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
            }
        });
    };

    return (
        <div className="dark:bg-transparent">
            <h2 className="admin-header text-gray-800 dark:text-gray-100 mb-6">Mi Perfil</h2>

            {message && (
                <div className={`p-4 mb-6 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800' : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white dark:bg-gray-800 dark:text-gray-100"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            id="apellidos"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            required
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white dark:bg-gray-800 dark:text-gray-100"
                            placeholder="Tus apellidos"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                            maxLength={100}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white dark:bg-gray-800 dark:text-gray-100"
                            placeholder="tu@correo.com"
                        />
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Password Section */}
                <div>
                    <button
                        type="button"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="text-[#4C7A1C] font-medium hover:text-brand transition-colors text-sm flex items-center gap-2"
                    >
                        <span>{isChangingPassword ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}</span>
                        <svg
                            className={`w-4 h-4 transform transition-transform ${isChangingPassword ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isChangingPassword && (
                        <div className="mt-6 space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="space-y-2">
                                <label htmlFor="password_actual" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <input
                                        type={showActual ? "text" : "password"}
                                        id="password_actual"
                                        name="password_actual"
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="password_nueva" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNueva ? "text" : "password"}
                                            id="password_nueva"
                                            name="password_nueva"
                                            // Controlado solo para poder pintar los requisitos mientras se
                                            // escribe; `name` se conserva porque el envío sigue leyéndose
                                            // con FormData, como el resto del formulario.
                                            value={passwordNueva}
                                            onChange={(e) => setPasswordNueva(e.target.value)}
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
                                            type={showConfirm ? "text" : "password"}
                                            id="password_confirmacion"
                                            name="password_confirmacion"
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
                    )}
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isPending}
                        className={`px-6 py-2 bg-brand-interactive text-white font-medium rounded-lg hover:bg-brand-interactive-hover focus:outline-none focus:ring-2 focus:ring-brand-focus focus:ring-offset-2 transition-colors shadow-sm ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
