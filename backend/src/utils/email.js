const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

exports.enviarVerificacion = async (email, token) => {
    await resend.emails.send({
        from: 'Auto Care <onboarding@resend.dev>',
        to: email,
        subject: 'Verificá tu cuenta — Auto Care',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px;">
                <h1 style="color: #e63946; font-size: 24px; margin-bottom: 8px;">Auto Care</h1>
                <h2 style="color: #111; font-size: 18px; font-weight: 600;">Verificá tu cuenta</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    Gracias por registrarte. Hacé click en el botón para activar tu cuenta.
                </p>
                <a href="${FRONTEND_URL}/verificar?token=${token}"
                   style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: linear-gradient(90deg, #e63946, #f4845f); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px;">
                    Verificar cuenta
                </a>
                <p style="color: #999; font-size: 12px;">Este link expira en 24 horas. Si no creaste una cuenta, ignorá este email.</p>
            </div>
        `
    });
};

exports.enviarResetPassword = async (email, token) => {
    await resend.emails.send({
        from: 'Auto Care <onboarding@resend.dev>',
        to: email,
        subject: 'Resetear contraseña — Auto Care',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px;">
                <h1 style="color: #e63946; font-size: 24px; margin-bottom: 8px;">Auto Care</h1>
                <h2 style="color: #111; font-size: 18px; font-weight: 600;">Resetear contraseña</h2>
                <p style="color: #555; font-size: 15px; line-height: 1.6;">
                    Recibimos una solicitud para resetear tu contraseña. Hacé click en el botón para crear una nueva.
                </p>
                <a href="${FRONTEND_URL}/reset-password?token=${token}"
                   style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: linear-gradient(90deg, #e63946, #f4845f); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px;">
                    Resetear contraseña
                </a>
                <p style="color: #999; font-size: 12px;">Este link expira en 1 hora. Si no solicitaste esto, ignorá este email.</p>
            </div>
        `
    });
};