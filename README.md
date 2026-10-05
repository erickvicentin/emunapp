# 🧘‍♀️ Emuná Pilates - Sistema de Gestión y Autogestión de Turnos

Aplicación web responsive integral desarrollada como Trabajo Final Integrador (TFI) para la **Tecnicatura Universitaria en Programación** de la **Universidad Tecnológica Nacional - Facultad Regional Resistencia (UTN FRRe)**.

---

## 📌 Contexto y Descripción del Proyecto

**Emuná Pilates** es un centro de acondicionamiento físico especializado en Pilates Reformer y Mat en Resistencia, Chaco. El centro opera con un cupo estricto de **hasta 4 camas por turno**, garantizando atención personalizada.

### Problemática
La gestión operativa, el registro de cobros y el dictado de clases recaen de manera integral en su instructora y dueña. La coordinación vía WhatsApp y planillas manuales provocaba cuellos de botella en la atención, demoras en respuestas y cupos ociosos por cancelaciones sobre la hora.

### Solución
Una plataforma web moderna y responsive que automatiza la operativa diaria del centro:
* **Para los Alumnos:** Autogestión de turnos en tiempo real, consulta de saldo de paquetes y política de cancelación anticipada (hasta 2 horas antes de la clase).
* **Para la Administración:** Panel de control centralizado con ocupación en vivo (0 a 4 camas por franja), check-in rápido de asistencias, gestión de paquetes móviles y conciliación manual de transferencias.
* **Asistente Virtual con IA:** Chatbot conversacional integrado que responde consultas institucionales frecuentes y orienta sobre la disponibilidad de turnos.

---

## 🚀 Arquitectura y Tecnologías

El proyecto implementa una arquitectura desacoplada y *Serverless*:

* **Frontend:** [React.js](https://react.dev/) desplegado de forma continua en [Vercel](https://vercel.com/).
* **Backend:** [Node.js](https://nodejs.org/) ejecutado sobre [Firebase Cloud Functions](https://firebase.google.com/docs/functions) (arquitectura serverless, transacciones atómicas para reservas concurrentes).
* **Base de Datos:** [Cloud Firestore](https://firebase.google.com/docs/firestore) (Base de datos NoSQL documental con escuchadores reactivos en tiempo real).
* **Inteligencia Artificial:** [Google Gemini API](https://ai.google.dev/) para el procesamiento conversacional del asistente virtual.
* **Notificaciones:** Servicio automatizado de confirmaciones por correo electrónico (Nodemailer / SendGrid).

---

## 📐 Reglas de Negocio Clave

1. **Cupo Máximo por Turno:** Estrictamente 4 camas reformer por horario.
2. **Paquetes Móviles:** Catálogo de 4, 8, 12 y 20 clases mensuales. La vigencia es móvil (inicia desde la fecha de contratación, no por mes calendario). Los cupos no utilizados pueden extenderse al mes siguiente.
3. **Política de Cancelación (Límite de 2 horas):**
   * Cancelaciones con **>= 2 horas de anticipación:** El turno se libera en tiempo real y el crédito se reintegra al paquete del alumno.
   * Cancelaciones con **< 2 horas:** La clase se registra como consumida/perdida para evitar cupos ociosos.
4. **Modalidad de Cobro:** Conciliación manual de transferencias bancarias o efectivo desde el panel de administración.
5. **Check-in y Asistencias:** La instructora marca *Presente* o *Ausente / Clase Perdida*, con habilitación excepcional para recuperos en situaciones justificadas.

---

## 👥 Equipo de Desarrollo (Clutch Software Studio)

* **Lautaro Höfer** - Maquetación y desarrollo Frontend (UI/UX)
* **Santiago Nickisch** - Diseño de base de datos y desarrollo Backend
* **Erick Vicentin** - Infraestructura backend, integraciones (DevOps & IA) y despliegue

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18 o superior
* Cuenta de Firebase y CLI configurado (`firebase-tools`)

### Configuración
```bash
# 1. Clonar el repositorio
git clone [https://github.com/tu-usuario/emuna-pilates-web.git](https://github.com/tu-usuario/emuna-pilates-web.git)
cd emuna-pilates-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (.env)
cp .env.example .env
# Completar con las credenciales de Firebase, Gemini API y Vercel

# 4. Iniciar servidor de desarrollo
npm run dev
