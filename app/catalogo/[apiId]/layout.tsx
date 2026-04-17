const API_IDS = [
  'api-vida-cotizacion',
  'api-vida-beneficiarios',
  'api-hogar-poliza',
  'api-hogar-siniestro',
  'api-autos-cotizacion',
  'api-autos-siniestro',
  'api-salud-autorizacion',
  'api-salud-red-medica',
];

export function generateStaticParams() {
  return API_IDS.map((apiId) => ({ apiId }));
}

export default function ApiDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
