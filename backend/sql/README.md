# Migraciones de Supabase

Ejecuta los archivos `.sql` en el SQL Editor de Supabase, en orden.

`002_transfer_settings.sql` crea la configuración única de pagos y añade `payment_method` a `orders`. Después de ejecutarla, el dashboard permitirá editar los datos bancarios y el checkout mostrará esos datos usando transferencia bancaria.