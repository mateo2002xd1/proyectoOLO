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
import { validarEmail } from '@olo/email-policy';
import { getProfileData, updateProfileInfo, changePassword } from '../profile.actions';
import { PasswordRequisitos } from '../../auth/components/auth-ui';
import { MensajeEstado } from '@/shared/ui/molecules/mensaje-estado';
import { ErrorDeCampo } from '@/shared/ui/molecules/alert';

type CampoPerfil = 'nombre' | 'apellidos' | 'correo' | 'password_actual' | 'password_nueva' | 'password_confirmacion';
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
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showActual, setShowActual] = useState(false);
    const [showNueva, setShowNueva] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [passwordNueva, setPasswordNueva] = useState('');
    // Lo que falta o está mal, campo por campo: borde rojo y aviso debajo al pulsar
    // «Guardar Cambios»; el de un campo se borra en cuanto se escribe en él.
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
        quitarError(e.target.name as CampoPerfil);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);

        const form = new FormData(e.currentTarget);
        const data = Object.fromEntries(form.entries());

        // Todo se revisa de una vez y cada falta se marca en su campo, en vez del globo del
        // navegador —que solo enseña el primero— o de un mensaje arriba que no dice dónde
        // está el problema. El servidor lo exige igualmente; esto evita el viaje de ida y
        // vuelta para decir lo que ya se ve en el formulario.
        const texto = (clave: CampoPerfil) => String(data[clave] ?? '');
        const nuevos: ErroresPerfil = {};
        if (isChangingPassword) {
            if (!texto('password_actual')) nuevos.password_actual = 'Falta la contraseña actual.';
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
        } else {
            if (!texto('nombre').trim()) nuevos.nombre = 'Falta el nombre.';
            if (!texto('apellidos').trim()) nuevos.apellidos = 'Faltan los apellidos.';
            if (!texto('correo').trim()) {
                nuevos.correo = 'Falta el correo electrónico.';
            } else {
                const falloCorreo = validarEmail(texto('correo'));
                if (falloCorreo) nuevos.correo = falloCorreo;
            }
        }
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        startTransition(async () => {
            if (isChangingPassword) {
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

            {/* `noValidate`: las faltas las marca `handleSubmit` en cada campo, no el globo del navegador. */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
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
                            {...propsDeCampo('nombre')}
                            placeholder="Tu nombre"
                        />
                        {errores.nombre && <ErrorDeCampo id="nombre-error">{errores.nombre}</ErrorDeCampo>}
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
                            {...propsDeCampo('apellidos')}
                            placeholder="Tus apellidos"
                        />
                        {errores.apellidos && <ErrorDeCampo id="apellidos-error">{errores.apellidos}</ErrorDeCampo>}
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
                            {...propsDeCampo('correo')}
                            placeholder="tu@correo.com"
                        />
                        {errores.correo && <ErrorDeCampo id="correo-error">{errores.correo}</ErrorDeCampo>}
                    </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* Password Section */}
                <div>
                    <button
                        type="button"
                        onClick={() => {
                            setIsChangingPassword(!isChangingPassword);
                            setErrores({});
                        }}
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
                                            type={showConfirm ? "text" : "password"}
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
