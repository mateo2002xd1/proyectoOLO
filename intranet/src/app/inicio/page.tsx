'use client';

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/features/auth";

const menuItems = [
	{ href: "/inicio", label: "Inicio" },
	{ href: "/tasa", label: "Tasa de Vinculación y Empleabilidad" },
	{ href: "/matriz", label: "Matriz de Pertinencia" },
	{ href: "#", label: "Encuestas" },
	{ href: "#", label: "Preguntas Frecuentes" },
];

export default function IntranetHomePage() {
  const { logout, isLoading } = useAuth();

	return (
		<main className="intranet-home">
			<header className="intranet-topbar" aria-label="Navegacion principal">
				<div className="intranet-topbar-inner">
					<div className="intranet-brand">
						<Image
							src="/assets/svg/olo-logo-blanco.svg"
							alt="Logo OLO"
							width={22}
							height={22}
						/>
						<span className="intranet-brand-text">Intranet</span>
					</div>

					<nav className="intranet-nav">
						{menuItems.map((item) => (
							<Link key={item.label} href={item.href} className="intranet-nav-link">
								{item.label}
							</Link>
						))}
					</nav>

					<div className="intranet-topbar-actions" aria-label="Acciones">
						<button type="button" className="intranet-icon-btn" aria-label="Buscar">
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M15.5 15.5L21 21M18 10.5A7.5 7.5 0 1 1 3 10.5a7.5 7.5 0 0 1 15 0Z"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>

						<button 
              type="button" 
              className="intranet-login-btn" 
              aria-label="Cerrar sesion"
              title="Cerrar sesión"
              onClick={logout}
              disabled={isLoading}
            >
							<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
								<path
									d="M15 8l4 4m0 0-4 4m4-4H9m4-9H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
				</div>
			</header>

			<section className="intranet-hero" aria-label="Banner de la intranet">
				<Image
					src="/assets/img/banner1.png"
					alt="Banner principal de la intranet"
					width={1240}
					height={400}
					priority
					className="intranet-hero-banner"
				/>
			</section>

			<section className="intranet-construction" aria-label="Contenido principal">
				<h1 className="intranet-construction-title">
					<span>Inicio</span> en construccion
				</h1>
			</section>

			<footer className="intranet-footer" aria-label="Pie de pagina">
				<div className="intranet-footer-inner">
					<div className="intranet-footer-col intranet-footer-brand-col">
						<div className="intranet-footer-brand">
							<span className="intranet-footer-sena">SENA</span>
							<Image
								src="/assets/svg/olo-logo-blanco.svg"
								alt="Logo Observatorio"
								width={56}
								height={56}
							/>
						</div>
					</div>

					<div className="intranet-footer-col">
						<h2>Observatorio Laboral y Ocupacional SENA</h2>
						<p>Direccion: Calle 57 No. 8 - 69 Bogota D.C. (Cundinamarca), Colombia.</p>
						<p>Horario de atencion: Lunes a viernes de 8:00 am a 5:30 pm</p>
						<p className="intranet-footer-social">@SENACOMUNICA  @SENATV</p>
					</div>

					<div className="intranet-footer-col">
						<h2>Contacto:</h2>
						<p>PBX (+57) 1 5461500 IP: 13037</p>
						<p>olaboryocupacional@sena.edu.co</p>
						<a href="#">Politica de seguridad y privacidad de la informacion</a>
						<a href="#">Politica de Tratamiento para Proteccion de Datos Personales</a>
						<a href="#">Mapa del sitio</a>
					</div>
				</div>
			</footer>
		</main>
	);
}
