# 🧘‍♀️ Emuná Pilates - Sistema de Gestión y Autogestión de Turnos

Aplicación web responsive integral desarrollada como Trabajo Final Integrador (TFI) para la **Tecnicatura Universitaria en Programación** de la **Universidad Tecnológica Nacional - Facultad Regional Resistencia (UTN FRRe)**[span_0](start_span)[span_0](end_span)[span_1](start_span)[span_1](end_span).

---

## 📌 Contexto y Descripción del Proyecto

**Emuná Pilates** es un centro de acondicionamiento físico especializado en Pilates Reformer y Mat en Resistencia, Chaco[span_2](start_span)[span_2](end_span). El centro opera con un cupo estricto de **hasta 4 camas por turno**, garantizando atención personalizada[span_3](start_span)[span_3](end_span)[span_4](start_span)[span_4](end_span).

### Problemática
La gestión operativa, el registro de cobros y el dictado de clases recaen de manera integral en su instructora y dueña[span_5](start_span)[span_5](end_span). La coordinación vía WhatsApp y planillas manuales provocaba cuellos de botella en la atención, demoras en respuestas y cupos ociosos por cancelaciones sobre la hora[span_6](start_span)[span_6](end_span)[span_7](start_span)[span_7](end_span).

### Solución
Una plataforma web moderna y responsive que automatiza la operativa diaria del centro[span_8](start_span)[span_8](end_span)[span_9](start_span)[span_9](end_span):
* **Para los Alumnos:** Autogestión de turnos en tiempo real, consulta de saldo de paquetes y política de cancelación anticipada (hasta 2 horas antes de la clase)[span_10](start_span)[span_10](end_span)[span_11](start_span)[span_11](end_span).
* **Para la Administración:** Panel de control centralizado con ocupación en vivo (0 a 4 camas por franja), check-in rápido de asistencias, gestión de paquetes móviles y conciliación manual de transferencias[span_12](start_span)[span_12](end_span)[span_13](start_span)[span_13](end_span).
* **Asistente Virtual con IA:** Chatbot conversacional integrado que responde consultas institucionales frecuentes y orienta sobre la disponibilidad de turnos[span_14](start_span)[span_14](end_span)[span_15](start_span)[span_15](end_span).

---

## 🚀 Arquitectura y Tecnologías

El proyecto implementa una arquitectura desacoplada y *Serverless*[span_16](start_span)[span_16](end_span)[span_17](start_span)[span_17](end_span):

* **Frontend:** [React.js](https://react.dev/) desplegado de forma continua en [Vercel](https://vercel.com/)[span_18](start_span)[span_18](end_span)[span_19](start_span)[span_19](end_span).
* **Backend:** [Node.js](https://nodejs.org/) ejecutado sobre [Firebase Cloud Functions](https://firebase.google.com/docs/functions) (arquitectura serverless, transacciones atómicas para reservas concurrentes)[span_20](start_span)[span_20](end_span)[span_21](start_span)[span_21](end_span).
* **Base de Datos:** [Cloud Firestore](https://firebase.google.com/docs/firestore) (Base de datos NoSQL documental con escuchadores reactivos en tiempo real)[span_22](start_span)[span_22](end_span)[span_23](start_span)[span_23](end_span).
* **Inteligencia Artificial:** [Google Gemini API](https://ai.google.dev/) para el procesamiento conversacional del asistente virtual[span_24](start_span)[span_24](end_span)[span_25](start_span)[span_25](end_span).
* **Notificaciones:** Servicio automatizado de confirmaciones por correo electrónico (Nodemailer / SendGrid)[span_26](start_span)[span_26](end_span)[span_27](start_span)[span_27](end_span).

---

## 📐 Reglas de Negocio Clave

1. **Cupo Máximo por Turno:** Estrictamente 4 camas reformer por horario[span_28](start_span)[span_28](end_span)[span_29](start_span)[span_29](end_span).
2. **Paquetes Móviles:** Catálogo de 4, 8, 12 y 20 clases mensuales[span_30](start_span)[span_30](end_span)[span_31](start_span)[span_31](end_span). La vigencia es móvil (inicia desde la fecha de contratación, no por mes calendario)[span_32](start_span)[span_32](end_span). Los cupos no utilizados pueden extenderse al mes siguiente[span_33](start_span)[span_33](end_span).
3. **Política de Cancelación (Límite de 2 horas):**
   * Cancelaciones con **>= 2 horas de anticipación:** El turno se libera en tiempo real y el crédito se reintegra al paquete del alumno[span_34](start_span)[span_34](end_span)[span_35](start_span)[span_35](end_span).
   * Cancelaciones con **< 2 horas:** La clase se registra como consumida/perdida para evitar cupos ociosos[span_36](start_span)[span_36](end_span)[span_37](start_span)[span_37](end_span).
4. **Modalidad de Cobro:** Conciliación manual de transferencias bancarias o efectivo desde el panel de administración[span_38](start_span)[span_38](end_span).
5. **Check-in y Asistencias:** La instructora marca *Presente* o *Ausente / Clase Perdida*, con habilitación excepcional para recuperos en situaciones justificadas[span_39](start_span)[span_39](end_span).

---

## 👥 Equipo de Desarrollo (Clutch Software Studio)

* **Lautaro Höfer** - Maquetación y desarrollo Frontend (UI/UX)[span_40](start_span)[span_40](end_span)
* **Santiago Nickisch** - Diseño de base de datos y desarrollo Backend[span_41](start_span)[span_41](end_span)
* **Erick Vicentin** - Infraestructura backend, integraciones (DevOps & IA) y despliegue[span_42](start_span)[span_42](end_span)

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
