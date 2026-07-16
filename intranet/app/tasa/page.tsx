import Image from "next/image";
import { IntranetTopbar } from "@/lib/blocks/IntranetTopbar";
import { Footer } from "@/lib/blocks/Footer";

export default function TasaPage() {
    return (
        <div className="w-full bg-white flex flex-col items-center min-h-screen">
            <div className="w-full sticky top-0 z-50">
                <IntranetTopbar />
            </div>

            <main className="w-full flex flex-col items-center flex-1 pb-0">
                {/* Banner */}
                <div className="w-full">
                    <Image
                        src="/assets/img/bannertasave.png"
                        alt="Banner Tasa de Vinculación y Empleabilidad"
                        width={1920}
                        height={435}
                        className="w-full h-auto"
                        priority
                    />
                </div>

                {/* Sección: ¿Qué es la Tasa de Vinculación? */}
                <section className="tasa-section-container pt-12">
                    <h2 className="tasa-section-title">
                        ¿Qué es la Tasa de Vinculación?
                    </h2>
                    <p className="tasa-section-text">
                        La Tasa de Vinculación consiste en medir cuál es el porcentaje de
                        egresados certificados de formación titulada del SENA de un semestre
                        (cohorte semestral) que logran vincularse a un empleo formal (que
                        presentan aportes a seguridad social en PILA) en el siguiente
                        semestre.
                    </p>

                    <div className="tasa-image-wrapper">
                        <Image
                            src="/assets/img/vinculacion.png"
                            alt="Estadísticas de Tasa de Vinculación"
                            width={1000}
                            height={300}
                            className="tasa-image"
                        />
                    </div>
                </section>

                {/* Sección: ¿Qué es la Tasa de Empleabilidad? */}
                <section className="tasa-section-container">
                    <h2 className="tasa-section-title">
                        ¿Qué es la Tasa de Empleabilidad?
                    </h2>
                    <p className="tasa-section-text">
                        La Tasa de Empleabilidad consiste en medir cuál es el porcentaje de
                        egresados certificados de formación complementaria del SENA y de
                        certificados por competencias laborales de un año (cohorte anual)
                        que se encuentran en un trabajo formal (que presentan aportes a
                        seguridad social en PILA) durante algún momento del siguiente año.
                    </p>

                    <div className="tasa-image-wrapper">
                        <Image
                            src="/assets/img/sabiasque.png"
                            alt="Estadísticas de Tasa de Empleabilidad"
                            width={1000}
                            height={350}
                            className="tasa-image"
                        />
                    </div>
                </section>

                {/* Sección: Dashboards OLO */}
                <section className="tasa-dashboard-wrapper">
                    {/* Dashboard OLO - Vinculación */}
                    <div className="tasa-dashboard-item">
                        <h2 className="tasa-section-title">
                            Dashboard OLO - Vinculación
                        </h2>
                        <p className="tasa-section-text">
                            Resultados de vinculación laboral formal (titulada), con una periodicidad semestral.
                            Genera un indicador de vinculación donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.
                        </p>
                        
                        <div className="tasa-iframe-wrapper">
                            <iframe
                                title="Dashboard OLO - Vinculación"
                                src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=ReportSection3"
                                allowFullScreen={true}
                                className="tasa-iframe"
                            ></iframe>
                        </div>
                    </div>

                    {/* Dashboard OLO - Empleabilidad */}
                    <div className="tasa-dashboard-item">
                        <h2 className="tasa-section-title">
                            Dashboard OLO - Empleabilidad
                        </h2>
                        <p className="tasa-section-text">
                            Resultados de empleabilidad formal (complementaria), con una periodicidad anual.
                            Genera un indicador de empleabilidad donde se relaciona el número de vinculados laboralmente en el mercado formal y el total de egresados, para un grupo de seguimiento particular.
                        </p>

                        <div className="tasa-iframe-wrapper">
                            <iframe
                                title="Dashboard OLO - Empleabilidad"
                                src="https://app.powerbi.com/view?r=eyJrIjoiMWIxNWMwYjItNzdhZS00ZGE1LWExMDktYzZhOTgwNjZkNTZmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9&pageName=cfd70c690d894046a8d8"
                                allowFullScreen={true}
                                className="tasa-iframe"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>

            <div className="w-full mt-auto">
                <Footer block={{ id: 'footer-1', type: 'Footer' } as any} />
            </div>
        </div>
    );
}