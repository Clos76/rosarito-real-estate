"use client"
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ArrowLeft, Shield, FileText, Cookie } from 'lucide-react';
import Link from 'next/link'

type SectionId = 'terms' | 'privacy' | 'cookies';

interface LegalSection {
  id: SectionId;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ExpandedSections {
  [key: string]: boolean;
}

interface CollapsibleSection {
  title: string;
  content: React.ReactNode | string;
}

const LegalCenter: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('terms');
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});

  // Handle URL parameters after component mounts (client-side)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section') as SectionId;
    if (['terms', 'privacy', 'cookies'].includes(section)) {
      setActiveSection(section);
    }
  }, []);

  const toggleSection = (sectionKey: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const sections: LegalSection[] = [
    { id: 'terms', title: 'Términos y Condiciones', icon: FileText },
    { id: 'privacy', title: 'Aviso de Privacidad', icon: Shield },
    { id: 'cookies', title: 'Política de Cookies', icon: Cookie }
  ];

  const TermsContent: React.FC = () => {
    const termsSections: CollapsibleSection[] = [
      {
        title: '1. Aceptación de Términos',
        content: 'Al acceder y utilizar el sitio web de ROSARITO RESORTS (rosaritoresorts.com), usted acepta estar sujeto a estos Términos y Condiciones y que tiene la capacidad legal para celebrar contratos vinculantes. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web.'
      },

      {
        title: '2. Información de la Empresa',
        content: (
          <div>
            <p><strong>ROSARITO RESORTS</strong></p>
            <p>Domicilio: Playas de Rosarito, Baja California, México</p>
            <p>Correo electrónico: info@rosaritoresorts.com</p>
          </div>
        )
      },
      {
        title: '3. Servicios Ofrecidos',
        content: (
          <div>
            <p>ROSARITO RESORTS ofrece:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Asesoría inmobiliaria especializada</li>
              <li>Promoción y marketing de propiedades</li>
              <li>Intermediación en operaciones inmobiliarias</li>
              <li>Información sobre el mercado inmobiliario</li>
              <li>Coordinación con profesionales especializados</li>
            </ul>
          </div>
        )
      },
      {
        title: '4. Uso del Sitio Web',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✓ Uso Permitido</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Navegación e información sobre servicios</li>
                <li>Consulta de propiedades disponibles</li>
                <li>Contacto para solicitar información</li>
                <li>Descarga de materiales informativos autorizados</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-700 mb-2">✗ Uso Prohibido</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Actividades ilegales o no autorizadas</li>
                <li>Transmisión de virus o código malicioso</li>
                <li>Uso comercial no autorizado del contenido</li>
                <li>Interferencia con el funcionamiento del sitio</li>
                <li>Recopilación automatizada de datos (web scraping)</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        title: '5. Propiedad Intelectual',
        content: 'Todo el contenido del sitio web, incluyendo textos, imágenes, logotipos, diseños y software, es propiedad de ROSARITO RESORTS o se usa bajo licencia. Está protegido por las leyes de derechos de autor y propiedad intelectual de México.'
      },
      {
        title: '6. Limitación de Responsabilidad',
        content: (
          <div className="space-y-3">
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="font-semibold text-yellow-800 mb-2">El sitio web se proporciona &quot;como está&quot;</p>
              <p className="text-sm text-yellow-700">ROSARITO RESORTS no garantiza disponibilidad ininterrumpida, ausencia de errores, exactitud absoluta de información, o compatibilidad universal.</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="font-semibold text-red-800 mb-2">No nos responsabilizamos por:</p>
              <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                <li>Pérdidas derivadas del uso del sitio web</li>
                <li>Decisiones basadas en información del sitio</li>
                <li>Interrupciones por mantenimiento o fallas</li>
                <li>Enlaces a sitios de terceros</li>
                <li>Cambios en condiciones del mercado</li>
              </ul>
              <p className="mt-2 font-semibold"></p>
            </div>
          </div>
        )
      },
      {
        title: '7. Exactitud de la Información',
        content: (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
              <li>La información de propiedades puede cambiar sin previo aviso</li>
              <li>Los precios mostrados son referenciales y sujetos a confirmación</li>
              <li>Las fotografías pueden no reflejar el estado actual</li>
              <li>Se recomienda verificar información directamente con nuestro equipo</li>
            </ul>
          </div>
        )
      },
      {
        title: '8. Ley Aplicable y Jurisdicción',
        content: 'Estos términos se rigen por las leyes de México y del Estado de Baja California. Cualquier controversia será resuelta por los tribunales competentes en Tijuana, Baja California.'
      },
      {
        title: '9. Indemnización',
        content: 'Usted acepta proteger y eximir de responsabilidad a ROSARITO RESORTS, así como a sus afiliados, directores, empleados, agentes y licenciantes, de cualquier reclamo, pérdida, daño, juicio, costo o gasto (incluyendo honorarios legales) ocasionado por la violación de estos Términos o por un uso no autorizado del Sitio.'

      }

    ];

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>Última actualización:</strong> 21 de agosto de 2025
          </p>
        </div>

        {termsSections.map((section, index) => {
          const sectionKey = `terms-${index}`;
          return (
            <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left transition-colors"
                type="button"
              >
                <span className="font-semibold text-gray-800">{section.title}</span>
                {expandedSections[sectionKey] ?
                  <ChevronDown className="h-5 w-5 text-gray-500" /> :
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                }
              </button>
              {expandedSections[sectionKey] && (
                <div className="px-4 py-3 text-gray-700 text-sm leading-relaxed">
                  {typeof section.content === 'string' ? (
                    <p>{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const PrivacyContent: React.FC = () => {
    const privacySections: CollapsibleSection[] = [
      {
        title: '1. Datos Personales que Recabamos',
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">A través del sitio web:</h4>
              <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                <li>Nombre y datos de contacto (email, teléfono)</li>
                <li>Consultas y mensajes enviados</li>
                <li>Datos de navegación (cookies, IP, navegador)</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">En servicios presenciales:</h4>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                <li>Identificación oficial y datos personales completos</li>
                <li>Documentación de propiedades</li>
                <li>Información financiera y patrimonial</li>
              </ul>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="font-semibold text-red-800">❌ NO recabamos datos sensibles</p>
              <p className="text-sm text-red-700">Como origen étnico, salud, religión, opiniones políticas, etc.</p>
            </div>
          </div>
        )
      },
      {
        title: '2. Finalidades del Tratamiento',
        content: (
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Finalidades Primarias (necesarias):</h4>
              <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                <li>Responder consultas y brindar información</li>
                <li>Prestar servicios inmobiliarios solicitados</li>
                <li>Cumplir obligaciones legales y contractuales</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Finalidades Secundarias (requieren consentimiento):</h4>
              <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                <li>Envío de promociones e información comercial</li>
                <li>Estudios de satisfacción y mercado</li>
                <li>Mejoras en servicios</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        title: '3. Transferencias de Datos',
        content: (
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Sin consentimiento (por ley o servicio):</h4>
              <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                <li>Notarios públicos y autoridades registrales</li>
                <li>Instituciones financieras para trámites</li>
                <li>Autoridades fiscales cuando sea requerido</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Con consentimiento:</h4>
              <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                <li>Socios comerciales para servicios complementarios</li>
                <li>Empresas de marketing (solo si acepta promociones)</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        title: '4. Derechos ARCO',
        content: (
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="font-semibold text-purple-800 mb-3">Puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición</p>
            <div className="text-sm text-purple-700 space-y-2">
              <p><strong>Email:</strong> info@rosaritoresorts.com</p>
              <p><strong>Incluir:</strong> Identificación oficial, descripción del derecho a ejercer</p>
              <p><strong>Plazo de respuesta:</strong> 20 días hábiles</p>
            </div>
          </div>
        )
      },
      {
        title: '5. Conservación de Datos',
        content: (
          <div className="bg-gray-50 p-3 rounded-lg">
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li><strong>Datos del sitio web:</strong> Hasta que revoque consentimiento</li>
              <li><strong>Servicios contratados:</strong> Durante la relación más tiempo legal requerido</li>
              <li><strong>Obligaciones fiscales:</strong> 5 años posterior al servicio</li>
            </ul>
          </div>
        )
      },
      {
        title: '6. Medidas de Seguridad',
        content: 'Implementamos medidas administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado, conforme a la Ley Federal de Protección de Datos Personales.'
      },
      {
        title: '7. Modificaciones al Aviso',
        content: 'Este Aviso de Privacidad puede modificarse en cualquier momento para cumplir con actualizaciones legales o de nuestros servicios. Cualquier cambio se publicará en este sitio web, en el apartado Centro Legal.'
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-sm text-blue-800">
            <strong>Responsable:</strong> ROSARITO RESORTS<br />
            <strong>Correo:</strong> info@rosaritoresorts.com
          </p>
        </div>

        {privacySections.map((section, index) => {
          const sectionKey = `privacy-${index}`;
          return (
            <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left transition-colors"
                type="button"
              >
                <span className="font-semibold text-gray-800">{section.title}</span>
                {expandedSections[sectionKey] ?
                  <ChevronDown className="h-5 w-5 text-gray-500" /> :
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                }
              </button>
              {expandedSections[sectionKey] && (
                <div className="px-4 py-3 text-gray-700 text-sm leading-relaxed">
                  {typeof section.content === 'string' ? (
                    <p>{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const CookiesContent: React.FC = () => {
    const cookiesSections: CollapsibleSection[] = [
      {
        title: '¿Qué son las Cookies?',
        content: 'Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web para mejorar su experiencia de navegación.'
      },
      {
        title: 'Tipos de Cookies que Utilizamos',
        content: (
          <div className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🔧 Cookies Técnicas (Necesarias)</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li><strong>Propósito:</strong> Funcionamiento básico del sitio</li>
                <li><strong>Duración:</strong> Sesión o hasta 1 año</li>
                <li><strong>Base legal:</strong> Interés legítimo</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📊 Cookies Analíticas</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Propósito:</strong> Estadísticas y rendimiento</li>
                <li><strong>Duración:</strong> Hasta 2 años</li>
                <li><strong>Base legal:</strong> Consentimiento</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🎯 Cookies de Marketing</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li><strong>Propósito:</strong> Personalizar publicidad</li>
                <li><strong>Duración:</strong> Hasta 1 año</li>
                <li><strong>Base legal:</strong> Consentimiento</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        title: 'Servicios de Terceros',
        content: (
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold mr-3">G</div>
              <div className="text-sm">
                <p className="font-semibold text-red-800">Google Analytics & Maps</p>
                <p className="text-red-700">Estadísticas anónimas y mapas interactivos</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold mr-3">f</div>
              <div className="text-sm">
                <p className="font-semibold text-blue-800">Redes Sociales</p>
                <p className="text-blue-700">Botones de compartir y plugins sociales</p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: 'Gestión de Cookies',
        content: (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Cómo controlar las cookies:</h4>
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold">Chrome</p>
                  <p className="text-gray-600">Configuración → Privacidad → Borrar datos</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold">Firefox</p>
                  <p className="text-gray-600">Preferencias → Privacidad → Borrar historial</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-semibold">Safari</p>
                  <p className="text-gray-600">Preferencias → Privacidad → Gestionar datos</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="font-semibold text-yellow-800">⚠️ Cookies Esenciales</p>
              <p className="text-sm text-yellow-700">Algunas cookies son necesarias para el funcionamiento básico y no pueden deshabilitarse.</p>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <p className="text-sm text-orange-800">
            Las cookies mejoran su experiencia de navegación y nos ayudan a entender cómo usa nuestro sitio web.
          </p>
        </div>

        {cookiesSections.map((section, index) => {
          const sectionKey = `cookies-${index}`;
          return (
            <div key={sectionKey} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left transition-colors"
                type="button"
              >
                <span className="font-semibold text-gray-800">{section.title}</span>
                {expandedSections[sectionKey] ?
                  <ChevronDown className="h-5 w-5 text-gray-500" /> :
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                }
              </button>
              {expandedSections[sectionKey] && (
                <div className="px-4 py-3 text-gray-700 text-sm leading-relaxed">
                  {typeof section.content === 'string' ? (
                    <p>{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = (): React.ReactNode => {
    switch (activeSection) {
      case 'terms': return <TermsContent />;
      case 'privacy': return <PrivacyContent />;
      case 'cookies': return <CookiesContent />;
      default: return <TermsContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              
                <Link href="/">
                 <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Link>
               
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Centro Legal</h1>
            </div>
            <div className="text-sm text-gray-500 hidden md:block">
              Rosarito Resorts
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-24">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-gray-900">Navegación</h2>
              </div>
              <nav className="p-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      type="button"
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
              </div>
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>¿Preguntas sobre nuestras políticas?</p>
            <p className="mt-1">
              <a
                href="mailto:info@rosaritoresorts.com"
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                info@rosaritoresorts.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalCenter;