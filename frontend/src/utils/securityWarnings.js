/**
 * Advertencia de seguridad contra Self-XSS
 * Se muestra en la consola para alertar a usuarios sobre ataques potenciales
 */
export const initSecurityWarnings = () => {
  const warningStyle = 'color: red; font-size: 20px; font-weight: bold;';
  const infoStyle = 'color: orange; font-size: 14px;';

  console.log(
    '%c⚠️ ADVERTENCIA DE SEGURIDAD',
    warningStyle
  );

  console.log(
    '%cNo pegues código de fuentes desconocidas en esta consola. ' +
    'Los atacantes pueden utilizar esta consola para acceder a tu cuenta y datos personales.',
    infoStyle
  );

  console.log(
    '%cSi alguien te pide que pegues algo aquí, ¡NO LO HAGAS! ' +
    'Esto se conoce como un ataque "Self-XSS".',
    infoStyle
  );

  console.log(
    '%cMás información: https://owasp.org/www-community/attacks/xss/#self-xss',
    infoStyle
  );
};
