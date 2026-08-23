# Bendito Café - Point of Sale (POS) & Sistema de Ventas

Sistema web moderno y responsivo de Punto de Venta (POS) diseñado para optimizar el flujo operativo, la toma ágil de pedidos, el control de inventario en tiempo real y la facturación diaria en establecimientos gastronómicos.

---

## 🛠️ Tecnologías y Arquitectura

* **Frontend:** Next.js (React), TypeScript
* **Estilos & UI:** Tailwind CSS (diseño fluido y optimizado para pantallas táctiles y móviles)
* **Backend & Base de Datos:** Supabase (PostgreSQL, Autenticación y datos en tiempo real)
* **Despliegue & CI/CD:** Vercel

---

## ✨ Características Principales

* ⚡ **Toma de Pedidos Rápida:** Interfaz táctil intuitiva pensada para reducir los tiempos de atención en caja.
* 📦 **Gestión de Menú e Inventario:** Control de categorías, productos, modificadores y actualización de stock en tiempo real.
* 📊 **Módulo de Caja y Reportes:** Registro automático de transacciones, cálculo de totales, métodos de pago y reportes para cierres de caja diarios.
* 🔒 **Seguridad y Roles:** Autenticación segura para administradores y cajeros con políticas de seguridad a nivel de fila (RLS).
* 📱 **Diseño 100% Responsivo:** Operativo en tablets, computadoras de escritorio y dispositivos móviles.

---

## 🚀 Instalación y Despliegue Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Faliendre/bendito-cafe-pos.git](https://github.com/Faliendre/bendito-cafe-pos.git)
cd bendito-cafe-pos
```
### 2. Instalar dependencias
```bash
npm install
# o con yarn / pnpm:
# yarn install
# pnpm install
```
### 3. Configurar variables de entorno
Crea un archivo .env.local en la raíz del proyecto y añade tus credenciales de Supabase:
NEXT_PUBLIC_SUPABASE_URL=[https://tu-proyecto.supabase.co](https://tu-proyecto.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
### 4. Ejecutar el servidor de desarrollo
```Bash
npm run dev
Abre http://localhost:3000 en tu navegador para ver la aplicación en ejecución.
```
---
👨‍💻 Autor
Favio Aliendre — Lic. en Ingeniería de Sistemas & Full Stack Developer

GitHub: @Faliendre

Email: favioaliendre@gmail.com
