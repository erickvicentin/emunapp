import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import nodemailer from 'nodemailer';
import {
  isValidRecipientEmail,
  resetTransporterCache,
  sendClassReminderEmail,
  sendEmail,
  sendPaymentStatusEmail,
  sendReservationCancelledEmail,
  sendReservationConfirmedEmail,
  sendWelcomeEmail,
} from '../services/emailService.js';

describe('emailService', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    resetTransporterCache();
    mock.restoreAll();
  });

  describe('isValidRecipientEmail', () => {
    it('accepts standard email addresses', () => {
      assert.equal(isValidRecipientEmail('alumna@gmail.com'), true);
      assert.equal(isValidRecipientEmail('  Test.User@emuna-pilates.com.ar '), true);
    });

    it('rejects empty, malformed, and internal @dni.emuna.local emails', () => {
      assert.equal(isValidRecipientEmail(''), false);
      assert.equal(isValidRecipientEmail(null), false);
      assert.equal(isValidRecipientEmail('not-an-email'), false);
      assert.equal(isValidRecipientEmail('12345678@dni.emuna.local'), false);
      assert.equal(isValidRecipientEmail('12345678@DNI.EMUNA.LOCAL'), false);
    });
  });

  describe('sendEmail', () => {
    it('skips internal @dni.emuna.local recipients without calling SMTP', async () => {
      const result = await sendEmail({
        to: '30111222@dni.emuna.local',
        subject: 'Test',
        text: 'Hola',
        html: '<p>Hola</p>',
      });
      assert.deepEqual(result, { sent: false, reason: 'invalid_or_internal_recipient' });
    });

    it('skips sending gracefully when SMTP credentials are missing', async () => {
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      const result = await sendEmail({
        to: 'alumna@example.com',
        subject: 'Test',
        text: 'Hola',
        html: '<p>Hola</p>',
      });
      assert.deepEqual(result, { sent: false, reason: 'smtp_not_configured' });
    });

    it('sends branded email via transporter when SMTP is configured', async () => {
      process.env.SMTP_USER = 'smtp-user';
      process.env.SMTP_PASS = 'smtp-pass';
      process.env.SMTP_FROM = 'Emuná Pilates <no-reply@emuna-pilates.com.ar>';
      process.env.APP_URL = 'https://emuna-pilates.com.ar';

      const sentPayloads = [];
      mock.method(nodemailer, 'createTransport', () => ({
        sendMail: async (payload) => {
          sentPayloads.push(payload);
          return { messageId: '<msg-123@brevo>' };
        },
      }));

      const result = await sendWelcomeEmail({
        to: 'sofia@example.com',
        nombre: 'Sofía <script>alert(1)</script>',
      });

      assert.deepEqual(result, { sent: true, messageId: '<msg-123@brevo>' });
      assert.equal(sentPayloads.length, 1);
      assert.equal(sentPayloads[0].to, 'sofia@example.com');
      assert.equal(sentPayloads[0].from, 'Emuná Pilates <no-reply@emuna-pilates.com.ar>');
      assert.match(sentPayloads[0].html, /https:\/\/emuna-pilates\.com\.ar\/logo-email\.jpg/);
      assert.match(sentPayloads[0].html, /#2c2422/);
      assert.match(sentPayloads[0].html, /#82533e/);
      assert.doesNotMatch(sentPayloads[0].html, /<script>alert\(1\)<\/script>/);
      assert.match(sentPayloads[0].html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    });
  });

  describe('template helpers', () => {
    it('formats reservation confirmation, cancellation, payment, and reminder emails', async () => {
      process.env.SMTP_USER = 'smtp-user';
      process.env.SMTP_PASS = 'smtp-pass';

      const sentPayloads = [];
      mock.method(nodemailer, 'createTransport', () => ({
        sendMail: async (payload) => {
          sentPayloads.push(payload);
          return { messageId: '<ok>' };
        },
      }));

      await sendReservationConfirmedEmail({
        to: 'a@example.com',
        nombre: 'Ana',
        dateKey: '2026-12-01',
        startTime: '18:00',
        instructorName: 'Vale',
      });
      await sendReservationCancelledEmail({
        to: 'a@example.com',
        nombre: 'Ana',
        dateKey: '2026-12-01',
        startTime: '18:00',
        status: 'cancelado_estudio',
        reason: 'Feriado',
      });
      await sendPaymentStatusEmail({
        to: 'a@example.com',
        nombre: 'Ana',
        paqueteNombre: 'Pack 8 Clases',
        monto: 45000,
        estado: 'aprobado',
      });
      await sendClassReminderEmail({
        to: 'a@example.com',
        nombre: 'Ana',
        dateKey: '2026-12-01',
        startTime: '18:00',
        instructorName: 'Vale',
      });

      assert.equal(sentPayloads.length, 4);
      assert.match(sentPayloads[0].subject, /01\/12\/2026/);
      assert.match(sentPayloads[1].html, /Feriado/);
      assert.match(sentPayloads[2].subject, /Pago aprobado/);
      assert.match(sentPayloads[3].subject, /Recordatorio/);
    });
  });
});
