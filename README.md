# Tao Fit · TAOS

Tu entrenador personal en el celular: rutina a tu medida (objetivo, nivel, días, tiempo, equipo y molestias), menú semanal con comida mexicana, registro semanal que ajusta tu plan, gráficas de progreso y un personaje que cambia con tus medidas. Todo gratis y sin IA.

## Instalar

[![Instalar en Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frigodlt-maker%2Ftaos-fit&project-name=tao-fit&repository-name=tao-fit&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,SUPABASE_SECRET_KEY,ALLOWED_EMAIL,CRON_SECRET&envDescription=Datos%20de%20tu%20proyecto%20de%20Supabase%2C%20tu%20correo%20y%20un%20texto%20al%20azar%20para%20los%20recordatorios)

1. Toca el botón y entra con GitHub.
2. Pega las variables (abajo) y toca **Deploy**.
3. En Supabase › Authentication › URL Configuration, agrega la dirección de tu app + `/auth/callback`.
4. Abre tu app: la primera vez te da el código para Supabase › SQL Editor (un solo pegado).

| Variable | Qué pegar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto de Supabase, solo hasta `.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_…`) |
| `ALLOWED_EMAIL` | Tu correo: solo ese puede entrar |
| `CRON_SECRET` | Un texto al azar (por ejemplo de generate-secret.vercel.app/32) |

## Probar en tu computadora

```bash
npm install
npm run dev     # sin variables corre en modo demostración con un ejemplo de 3 meses
npm test
```

## Créditos y aviso

Fotos de ejercicios: [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), dominio público. Tao Fit da orientación general; no sustituye a un médico, nutriólogo ni entrenador certificado.

## Soporte y modificaciones

- El soporte de TAOS cubre **la versión original** de esta app, instalada siguiendo la guía.
- Si cambias el código (tú, otra persona o una IA), la app lo detecta al publicarse y muestra el aviso **“versión modificada”**. Puede dejar de funcionar como se diseñó y ya no tiene soporte.
- Para instalar o arreglar un error de configuración **no necesitas cambiar código**: casi siempre es una variable en Vercel o el SQL de Supabase.
- Tus datos viven en tus propias cuentas (Supabase, Vercel y Google). Nadie más puede verlos.
