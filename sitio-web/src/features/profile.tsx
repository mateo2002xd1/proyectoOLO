'use client';

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export function ProfileForm() {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showActual, setShowActual] = useState(false);
    const [showNueva, setShowNueva] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        console.log('Formulario guardado:', data);
        alert('Cambios guardados exitosamente (ver consola).');
    };

    return (
        <div >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors"
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700">
                            Apellidos
                        </label>
                        <input
                            type="text"
                            id="apellidos"
                            name="apellidos"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors"
                            placeholder="Tus apellidos"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label htmlFor="correo" className="block text-sm font-medium text-gray-700">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="correo"
                            name="correo"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors"
                            placeholder="tu@correo.com"
                        />
                    </div>
                </div>

                <hr className="border-gray-200" />

                {/* Password Section */}
                <div>
                    <button
                        type="button"
                        onClick={() => setIsChangingPassword(!isChangingPassword)}
                        className="text-[#7DB728] font-medium hover:text-[#7DB728] transition-colors text-sm flex items-center gap-2"
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
                        <div className="mt-6 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="space-y-2">
                                <label htmlFor="password_actual" className="block text-sm font-medium text-gray-700">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <input
                                        type={showActual ? "text" : "password"}
                                        id="password_actual"
                                        name="password_actual"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white pr-10"
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
                                    <label htmlFor="password_nueva" className="block text-sm font-medium text-gray-700">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNueva ? "text" : "password"}
                                            id="password_nueva"
                                            name="password_nueva"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white pr-10"
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
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="password_confirmacion" className="block text-sm font-medium text-gray-700">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            id="password_confirmacion"
                                            name="password_confirmacion"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FACE3] focus:border-[#1FACE3] transition-colors bg-white pr-10"
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
                        className="px-6 py-2 bg-[#7DB728] text-white font-medium rounded-lg hover:bg-[#7DB728] focus:outline-none focus:ring-2 focus:ring-[#1FACE3] focus:ring-offset-2 transition-colors shadow-sm"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
