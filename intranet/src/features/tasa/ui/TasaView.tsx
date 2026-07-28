import Image from "next/image";
import { IntranetTopbar } from "@/shared/lib/blocks/IntranetTopbar";
import { IntranetFooter } from "@/shared/lib/blocks/IntranetFooter";
import { PptxViewer } from "./PptxViewer";

export function TasaView() {
    return (
        <div className="w-full bg-white flex flex-col items-center min-h-screen">
            <IntranetTopbar />

            <main className="w-full flex flex-col items-center flex-1 pb-0">
                {/* Banner */}
                <section className="tasa-banner-wrapper">
                    <div className="tasa-banner-content">
                        <h1 className="tasa-banner-title">
                            Tasa de<br /> <strong>Vinculación y Empleabilidad</strong>
                        </h1>
                        <img
                            src="/assets/img/BannerTasa.png"
                            alt="Matriz de Pertinencia Banner"
                            className="tasa-banner-image"
                        />
                    </div>
                </section>

                <section className="tasa-concepts-wrapper">
                    {/* Concept 1: Vinculación */}
                    <div className="tasa-concept-row">
                        <div className="tasa-concept-text">
                            <h2 className="tasa-concept-title">
                                ¿Qué es la Tasa de Vinculación?
                            </h2>
                            <p className="tasa-concept-desc">
                                La Tasa de Vinculación consiste en medir cuál es el porcentaje de
                                egresados certificados de formación titulada del SENA de un semestre
                                (cohorte semestral) que logran vincularse a un empleo formal (que
                                presentan aportes a seguridad social en PILA) en el siguiente
                                semestre.
                            </p>
                        </div>
                        <div className="tasa-concept-visual">
                            <Image
                                src="/assets/img/vinculacion.png"
                                alt="Estadísticas de Tasa de Vinculación"
                                width={1000}
                                height={300}
                                className="tasa-concept-image"
                            />
                        </div>
                    </div>

                    {/* Concept 2: Empleabilidad (Reverse for Zig-Zag) */}
                    <div className="tasa-concept-row reverse">
                        <div className="tasa-concept-text">
                            <h2 className="tasa-concept-title">
                                ¿Qué es la Tasa de Empleabilidad?
                            </h2>
                            <p className="tasa-concept-desc">
                                La Tasa de Empleabilidad consiste en medir cuál es el porcentaje de
                                egresados certificados de formación complementaria del SENA y de
                                certificados por competencias laborales de un año (cohorte anual)
                                que se encuentran en un trabajo formal (que presentan aportes a
                                seguridad social en PILA) durante algún momento del siguiente año.
                            </p>
                        </div>
                        <div className="tasa-concept-visual">
                            <Image
                                src="/assets/img/sabiasque.png"
                                alt="Estadísticas de Tasa de Empleabilidad"
                                width={1000}
                                height={350}
                                className="tasa-concept-image"
                            />
                        </div>
                    </div>
                </section>

                {/* Video Section */}
                <section className="tasa-video-wrapper">
                    <div className="tasa-video-header">
                        <h2 className="tasa-video-title">
                            Aquí te contamos todo sobre la estrategia de Tasa de <br className="hidden md:block" />
                            <span>Vinculación y Empleabilidad</span>
                        </h2>
                       
                    </div>
                    <div className="tasa-video-container">
                        <iframe
                            className="tasa-video-iframe"
                            src="https://www.youtube.com/embed/4E7Sci4DAVQ"
                            title="Tasa de Vinculación y Empleabilidad"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </section>

                {/* Dashboards */}
                <section className="tasa-dashboards-section">
                    <div className="tasa-dashboards-grid">
                        <div className="tasa-dashboard-card">
                            <div className="tasa-dashboard-header">
                                <h2 className="tasa-dashboard-title">
                                    Dashboard OLO - Vinculación
                                </h2>
                                <p className="tasa-dashboard-desc">
                                    Resultados de vinculación laboral formal (titulada), con una periodicidad semestral.
                                    Genera un indicador de vinculación donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.
                                </p>
                            </div>
                            <div className="tasa-dashboard-iframe-wrapper">
                                <iframe
                                    title="Dashboard OLO - Vinculación"
                                    src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection"
                                    allowFullScreen={true}
                                    className="tasa-dashboard-iframe"
                                ></iframe>
                            </div>
                        </div>

                        <div className="tasa-dashboard-card">
                            <div className="tasa-dashboard-header">
                                <h2 className="tasa-dashboard-title">
                                    Dashboard OLO - Empleabilidad
                                </h2>
                                <p className="tasa-dashboard-desc">
                                    Resultados de empleabilidad formal (complementaria), con una periodicidad anual.
                                    Genera un indicador de empleabilidad donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.
                                </p>
                            </div>
                            <div className="tasa-dashboard-iframe-wrapper">
                                <iframe
                                    title="Dashboard OLO - Empleabilidad"
                                    src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=cfd70c690d894046a8d8"
                                    allowFullScreen={true}
                                    className="tasa-dashboard-iframe"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PPT Section */}
                <section className="tasa-ppt-section">
                    <div className="tasa-ppt-container">
                        <div className="tasa-ppt-text">
                            <h2 className="tasa-ppt-title">
                                Aquí podrás visualizar nuestra <br />
                                <strong>presentación de Tasa de <br />Vinculación y Empleabilidad</strong>
                            </h2>
                        </div>
                        <div className="tasa-ppt-viewer-wrapper">
                            <PptxViewer fileUrl="/uploads/documents/tasa.pptx" />
                        </div>
                    </div>
                </section>

            </main>

            <div className="w-full mt-auto">
                <IntranetFooter block={{ id: 'footer-1', type: 'IntranetFooter' }} />
            </div>
        </div>
    );
}
