# ADM — Definición de login, roles, permisos y acceso por módulo

> **Versión propuesta:** 12 de julio de 2026  
> **Responsable:** Administración del Sistema (ADM)  
> **Objetivo:** definir cómo inicia sesión cada tipo de usuario, qué módulos puede visualizar y qué acciones puede ejecutar.

---

## 1. Decisión general

El inicio de sesión es centralizado y pertenece a ADM. Todos los usuarios ingresan por la misma pantalla, pero la experiencia posterior depende de sus roles y permisos.

Después de autenticar al usuario, ADM debe determinar:

1. Si la cuenta está activa y puede iniciar sesión.
2. Qué roles activos tiene asignados.
3. Qué permisos efectivos obtiene mediante esos roles.
4. Qué módulos puede abrir desde el panel principal.
5. Qué acciones puede ejecutar dentro de cada módulo.
6. Si debe ingresar directamente a un módulo o visualizar un selector.

> Iniciar sesión no concede acceso general al sistema. Un usuario autenticado solo puede abrir los módulos incluidos en `allowed_modules` y ejecutar acciones contenidas en sus permisos efectivos.

---

## 2. Principios de autorización

- **Mínimo privilegio:** cada usuario recibe únicamente los permisos necesarios para sus funciones.
- **Denegación por defecto:** si un permiso no está asignado explícitamente, la acción se rechaza.
- **Separación por módulo:** administrar GPI no permite administrar GPE, PCO, CAC o ADM.
- **Validación doble:** ocultar botones en frontend mejora la experiencia, pero el backend debe validar cada solicitud.
- **Roles acumulables:** una persona puede tener varios roles; sus permisos efectivos son la unión de las asignaciones activas.
- **Trazabilidad:** autenticaciones, accesos rechazados y cambios sensibles se registran en BitacoraSistema.
- **Baja lógica:** revocar un rol o dar de baja una cuenta no elimina su historial.
- **Acceso puntual entre módulos:** consumir datos de otro módulo no implica poder abrir toda su interfaz.

---

## 3. Flujo de login

### 3.1 Entrada

El usuario proporciona:

- `nombre_usuario`
- `password`
- `recordar_sesion`

### 3.2 Validaciones

ADM ejecuta las siguientes comprobaciones:

1. Los campos obligatorios están completos.
2. Existe un UsuarioSistema con `nombre_usuario` normalizado.
3. La contraseña coincide con `password_hash`.
4. `estado_usuario = ACTIVO`.
5. El usuario tiene al menos un UsuarioRol activo.
6. Los roles asignados están activos.
7. La matriz RolPermiso contiene permisos activos.
8. Los módulos derivados de los permisos están habilitados.

### 3.3 Resultado exitoso

ADM crea una Sesion y devuelve:

```json
{
  "id_usuario": "uuid",
  "nombre_usuario": "responsable.gpi",
  "roles": ["RESPONSABLE_PERSONAL_INTERNO"],
  "allowed_modules": ["GPI"],
  "permissions": [
    "GPI_PERSONA_INTERNA_CONSULTAR",
    "GPI_PERSONA_INTERNA_CREAR",
    "GPI_PERSONA_INTERNA_ACTUALIZAR"
  ],
  "requiere_cambio_password": false,
  "fecha_expiracion": "2026-07-12T18:00:00-05:00"
}
```

### 3.4 Redirección

- Si `allowed_modules` contiene un solo módulo, el usuario ingresa directamente a ese módulo.
- Si contiene varios módulos, se muestra el panel principal únicamente con los módulos autorizados.
- Si no contiene módulos, se rechaza el acceso y se informa que la cuenta no tiene funciones asignadas.
- Cambiar la URL manualmente no permite entrar a otro módulo; la ruta y el backend deben rechazar la solicitud.

### 3.5 Resultado fallido

El sistema devuelve un mensaje genérico como “Usuario o contraseña incorrectos” para no revelar si la cuenta existe.

ADM debe:

- Incrementar `intentos_fallidos`.
- Bloquear la cuenta al alcanzar `MAX_INTENTOS_LOGIN`.
- Aplicar `TIEMPO_BLOQUEO_CUENTA_MIN`.
- Registrar el intento fallido en BitacoraSistema.

---

## 4. Diferencia entre acceso al módulo y permiso puntual

### Acceso al módulo

Permite visualizar y navegar por la interfaz completa o parcial de un módulo. Se representa con permisos como:

- `ADM_MODULO_ACCEDER`
- `GPI_MODULO_ACCEDER`
- `GPE_MODULO_ACCEDER`
- `PCO_MODULO_ACCEDER`
- `CAC_MODULO_ACCEDER`

### Permiso puntual entre módulos

Permite ejecutar una consulta o servicio concreto sin mostrar el módulo proveedor.

Ejemplo:

- Un GuardiaDeSeguridad abre CAC.
- CAC consulta datos de una PersonaExterna mediante una interfaz con GPE.
- El guardia no visualiza el módulo GPE ni obtiene permisos administrativos sobre GPE.

---

## 5. Roles del sistema

### 5.1 Roles vigentes

| Rol | Módulo visible | Alcance |
|---|---|---|
| AdministradorDelSistema | ADM | Seguridad lógica, usuarios, roles, permisos, parámetros, auditoría y entidades maestras. |
| DirectorAdministrativo | ADM — consultas y reportes | Acceso de solo lectura a usuarios, parámetros, auditoría e indicadores autorizados. |
| ResponsableDePersonalInterno | GPI | Gestión del personal interno, biometría y solicitudes vehiculares dentro de GPI. |
| ResponsableDePersonalExterno | GPE | Gestión del personal externo, autorizaciones y solicitudes vehiculares dentro de GPE. |
| GuardiaDeSeguridad | CAC | Operación diaria de entradas, salidas, validaciones y alertas autorizadas. |

### 5.2 Roles que deben añadirse o confirmarse

El esquema actual no define claramente un responsable administrativo para PCO ni un administrador funcional de CAC. Para cubrir todos los módulos se proponen:

| Rol propuesto | Módulo visible | Justificación |
|---|---|---|
| ResponsableDePuntosDeControl | PCO | Administra zonas, puntos de control, dispositivos y horarios. |
| ResponsableDeControlDeAccesos | CAC | Configura y supervisa la operación de CAC sin administrar seguridad lógica de ADM. |

> Estos nombres deben aprobarse con PCO y CAC antes de incorporarlos como registros definitivos en Rol.

---

## 6. Matriz de acceso por rol y módulo

| Rol | ADM | GPI | GPE | PCO | CAC |
|---|---:|---:|---:|---:|---:|
| AdministradorDelSistema | Administrar | Sin acceso funcional | Sin acceso funcional | Sin acceso funcional | Sin acceso funcional |
| DirectorAdministrativo | Solo lectura/reportes | Sin interfaz | Sin interfaz | Sin interfaz | Sin interfaz |
| ResponsableDePersonalInterno | Cuenta propia únicamente | Administrar según permisos | Sin acceso | Sin acceso | Sin acceso |
| ResponsableDePersonalExterno | Cuenta propia únicamente | Sin acceso | Administrar según permisos | Sin acceso | Sin acceso |
| ResponsableDePuntosDeControl | Cuenta propia únicamente | Sin acceso | Sin acceso | Administrar según permisos | Sin acceso |
| ResponsableDeControlDeAccesos | Cuenta propia únicamente | Sin acceso | Sin acceso | Sin acceso | Administrar/supervisar CAC |
| GuardiaDeSeguridad | Cuenta propia únicamente | Sin acceso | Sin interfaz; consultas puntuales | Sin interfaz; consulta del punto asignado | Operación limitada |

### Significado de “Cuenta propia únicamente”

El usuario puede:

- Cambiar su contraseña.
- Cerrar sesión.
- Consultar información básica de su propia sesión.

Esto no significa que pueda abrir el módulo administrativo ADM.

---

## 7. Permisos por tipo de usuario

### 7.1 AdministradorDelSistema

Puede abrir únicamente ADM y administrar:

- Usuarios del sistema.
- Estados de cuentas.
- Restablecimiento de contraseñas.
- Asignación y revocación de roles.
- Catálogo de roles y permisos.
- Matriz RolPermiso.
- Parámetros del sistema.
- Bitácora y reportes de auditoría.
- Entidades maestras Persona, Vehiculo y PersonaVehiculo.

Permisos principales:

```text
ADM_MODULO_ACCEDER
ADM_USUARIO_CREAR
ADM_USUARIO_CONSULTAR
ADM_USUARIO_ACTUALIZAR
ADM_USUARIO_RESETEAR_PASSWORD
ADM_USUARIO_BLOQUEAR
ADM_USUARIO_DESBLOQUEAR
ADM_USUARIO_ACTIVAR
ADM_USUARIO_DAR_BAJA
ADM_USUARIO_ASIGNAR_ROL
ADM_USUARIO_REVOCAR_ROL
ADM_ROL_CONSULTAR
ADM_ROL_CONFIGURAR_PERMISOS
ADM_PARAMETRO_CREAR
ADM_PARAMETRO_CONSULTAR
ADM_PARAMETRO_ACTUALIZAR
ADM_BITACORA_CONSULTAR
ADM_BITACORA_EXPORTAR
ADM_PERSONA_CONSULTAR
ADM_VEHICULO_GESTIONAR
ADM_PERSONA_VEHICULO_GESTIONAR
```

No puede, por defecto:

- Registrar personal interno directamente en GPI.
- Registrar visitas o proveedores en GPE.
- Modificar puntos físicos en PCO.
- Autorizar manualmente accesos operativos en CAC.

### 7.2 DirectorAdministrativo

Puede abrir una vista de consultas/reportes de ADM.

Permisos:

```text
ADM_MODULO_ACCEDER
ADM_USUARIO_CONSULTAR
ADM_PARAMETRO_CONSULTAR
ADM_BITACORA_CONSULTAR
ADM_BITACORA_EXPORTAR
ADM_VEHICULO_CONSULTAR
```

No puede:

- Crear o modificar usuarios.
- Asignar o revocar roles.
- Cambiar parámetros.
- Bloquear, activar o dar de baja cuentas.
- Modificar vehículos o asociaciones.
- Alterar registros de auditoría.

### 7.3 ResponsableDePersonalInterno — administrador funcional de GPI

Puede abrir únicamente GPI.

Permisos sugeridos:

```text
GPI_MODULO_ACCEDER
GPI_PERSONA_INTERNA_CREAR
GPI_PERSONA_INTERNA_CONSULTAR
GPI_PERSONA_INTERNA_ACTUALIZAR
GPI_PERSONA_INTERNA_DAR_BAJA
GPI_BIOMETRIA_REGISTRAR
GPI_BIOMETRIA_ACTUALIZAR
GPI_VEHICULO_SOLICITAR_REGISTRO
GPI_VEHICULO_SOLICITAR_ACTUALIZACION
GPI_PERSONA_VEHICULO_GESTIONAR
```

Puede consumir servicios de ADM para:

- Consultar Persona/Vehiculo.
- Solicitar creación o actualización del vehículo maestro.
- Solicitar la asociación PersonaVehiculo.
- Consultar parámetros aplicables a GPI.
- Registrar acciones en BitacoraSistema.

No puede abrir ADM, GPE, PCO o CAC.

### 7.4 ResponsableDePersonalExterno — administrador funcional de GPE

Puede abrir únicamente GPE.

Permisos sugeridos:

```text
GPE_MODULO_ACCEDER
GPE_PERSONA_EXTERNA_CREAR
GPE_PERSONA_EXTERNA_CONSULTAR
GPE_PERSONA_EXTERNA_ACTUALIZAR
GPE_PERSONA_EXTERNA_DAR_BAJA
GPE_AUTORIZACION_CREAR
GPE_AUTORIZACION_CONSULTAR
GPE_AUTORIZACION_ACTUALIZAR
GPE_AUTORIZACION_REVOCAR
GPE_MEMORANDO_REGISTRAR
GPE_VEHICULO_SOLICITAR_REGISTRO
GPE_PERSONA_VEHICULO_GESTIONAR
```

No puede abrir ADM, GPI, PCO o CAC.

### 7.5 ResponsableDePuntosDeControl — rol propuesto para PCO

Puede abrir únicamente PCO.

Permisos sugeridos:

```text
PCO_MODULO_ACCEDER
PCO_ZONA_CREAR
PCO_ZONA_CONSULTAR
PCO_ZONA_ACTUALIZAR
PCO_ZONA_DESACTIVAR
PCO_PUNTO_CONTROL_CREAR
PCO_PUNTO_CONTROL_CONSULTAR
PCO_PUNTO_CONTROL_ACTUALIZAR
PCO_DISPOSITIVO_REGISTRAR
PCO_DISPOSITIVO_ACTUALIZAR
PCO_DISPOSITIVO_CAMBIAR_ESTADO
PCO_HORARIO_CONFIGURAR
```

No administra vehículos. Puede relacionar eventos o parqueaderos con un PuntoControl, pero el dato maestro Vehiculo pertenece a ADM.

### 7.6 ResponsableDeControlDeAccesos — rol propuesto para CAC

Puede abrir únicamente CAC con funciones de supervisión.

Permisos sugeridos:

```text
CAC_MODULO_ACCEDER
CAC_VALIDACION_EJECUTAR
CAC_EVENTO_CONSULTAR
CAC_ALERTA_CONSULTAR
CAC_ALERTA_GESTIONAR
CAC_REGLA_ACCESO_CONSULTAR
CAC_REGLA_ACCESO_CONFIGURAR
CAC_REPORTE_CONSULTAR
```

No puede cambiar usuarios, roles, permisos o parámetros globales de ADM.

### 7.7 GuardiaDeSeguridad

Puede abrir únicamente la vista operativa de CAC.

Permisos sugeridos:

```text
CAC_MODULO_ACCEDER
CAC_VALIDACION_EJECUTAR
CAC_ACCESO_REGISTRAR_ENTRADA
CAC_ACCESO_REGISTRAR_SALIDA
CAC_AUTORIZACION_CONSULTAR
CAC_EVENTO_CONSULTAR_PUNTO_ASIGNADO
CAC_VEHICULO_CONSULTAR
CAC_DOCUMENTO_CUSTODIA_REGISTRAR
CAC_DOCUMENTO_CUSTODIA_DEVOLVER
GPE_PERSONA_EXTERNA_CONSULTAR_SERVICIO
GPE_PERSONA_EXTERNA_NOTIFICAR_LLEGADA_SERVICIO
```

Restricciones:

- No puede abrir la interfaz completa de GPE.
- Solo consulta datos necesarios para la validación actual.
- Solo consulta eventos del punto de control asignado.
- No modifica reglas, usuarios, parámetros o permisos.
- No elimina eventos de acceso.

---

## 8. Comportamiento del panel principal

### AdministradorDelSistema

```text
[Administración del Sistema]
```

### ResponsableDePersonalInterno

```text
[Gestión de Personal Interno]
```

### ResponsableDePersonalExterno

```text
[Gestión de Personal Externo]
```

### ResponsableDePuntosDeControl

```text
[Puntos de Control]
```

### ResponsableDeControlDeAccesos o GuardiaDeSeguridad

```text
[Control de Accesos]
```

### Usuario con varios roles

Si una persona posee, por ejemplo, ResponsableDePersonalInterno y DirectorAdministrativo:

```text
[Gestión de Personal Interno] [Consultas y Auditoría ADM]
```

El sistema no debe mostrar módulos sin `MODULO_ACCEDER`.

---

## 9. Modelo de permisos

### Entidades utilizadas

- UsuarioSistema.
- Rol.
- Permiso.
- UsuarioRol.
- RolPermiso.
- Sesion.
- BitacoraSistema.

### Cálculo de permisos efectivos

```text
UsuarioSistema
  → UsuarioRol activos
  → Rol activos
  → RolPermiso activos
  → Permiso activos
  → permisos efectivos
  → allowed_modules
```

Un módulo pertenece a `allowed_modules` únicamente cuando el usuario posee su permiso `*_MODULO_ACCEDER`.

---

## 10. Reglas especiales

### 10.1 Cambio de rol durante una sesión

Cuando se asigna o revoca un rol:

- Se registra el cambio en BitacoraSistema.
- Se invalidan o actualizan las sesiones activas del usuario.
- En la siguiente solicitud se recalculan los permisos.

### 10.2 Usuario bloqueado o dado de baja

- No puede iniciar sesión.
- Sus sesiones activas se cierran.
- Sus roles no se eliminan; permanecen para trazabilidad.

### 10.3 Permiso revocado

La revocación debe surtir efecto inmediatamente en backend, incluso si el frontend todavía muestra la pantalla.

### 10.4 Acceso directo mediante URL

Si un usuario de GPI intenta acceder a `/admin` o `/gpe`:

- El frontend redirige a “Acceso no autorizado”.
- El backend responde HTTP 403.
- Se registra el intento si corresponde a un patrón sensible o reiterado.

### 10.5 Director Administrativo

“Solo lectura” debe aplicarse en backend. No basta con ocultar botones.

---

## 11. Casos de uso relacionados

| ID | Caso de uso | Resultado esperado |
|---|---|---|
| CU-ADM-001 | Autenticar usuario | Crea sesión, roles, permisos y módulos autorizados. |
| CU-ADM-002 | Cerrar sesión | Invalida la sesión activa. |
| CU-ADM-004 | Cambiar contraseña propia | Disponible para cualquier usuario autenticado. |
| CU-ADM-005 | Registrar usuario | Crea la cuenta sin otorgar permisos implícitos. |
| CU-ADM-008 | Asignar rol | Modifica permisos y módulos efectivos. |
| CU-ADM-009 | Revocar rol | Retira acceso inmediatamente. |
| CU-ADM-010 | Bloquear usuario | Impide login y cierra sesiones. |
| CU-ADM-011 | Desbloquear usuario | Permite volver a autenticarse. |
| CU-ADM-019 | Configurar matriz rol-permiso | Define las acciones de cada rol. |
| CU-ADM-020 | Verificar autorización | Valida una acción en backend. |
| CU-ADM-021 | Registrar acción en bitácora | Registra autenticación, rechazo o cambio sensible. |

---

## 12. Respuestas de autorización

### Autorizado

```json
{
  "authorized": true,
  "module": "GPI",
  "permission": "GPI_PERSONA_INTERNA_ACTUALIZAR"
}
```

### No autorizado

```json
{
  "authorized": false,
  "code": "PERMISSION_DENIED",
  "message": "No tiene permisos para realizar esta acción."
}
```

### Módulo no permitido

```json
{
  "authorized": false,
  "code": "MODULE_ACCESS_DENIED",
  "message": "No tiene acceso a este módulo."
}
```

---

## 13. Criterios de aceptación

- [ ] Un usuario de GPI solo visualiza GPI.
- [ ] Un usuario de GPE solo visualiza GPE.
- [ ] Un responsable de PCO solo visualiza PCO.
- [ ] Un guardia solo visualiza la interfaz operativa de CAC.
- [ ] El AdministradorDelSistema solo administra ADM y no obtiene automáticamente funciones operativas de otros módulos.
- [ ] El DirectorAdministrativo no puede modificar datos.
- [ ] Un usuario con varios roles visualiza únicamente la unión de módulos autorizados.
- [ ] Un módulo oculto tampoco puede abrirse escribiendo la URL.
- [ ] Cada endpoint valida el permiso requerido.
- [ ] Revocar un rol retira el acceso sin esperar un nuevo login.
- [ ] Bloquear una cuenta invalida sus sesiones activas.
- [ ] Los accesos rechazados sensibles quedan auditados.
- [ ] Los servicios entre módulos no conceden acceso a la interfaz completa del módulo proveedor.

---

## 14. Tareas de implementación

### Prioridad crítica

- [ ] Crear los permisos `*_MODULO_ACCEDER`.
- [ ] Aprobar los roles ResponsableDePuntosDeControl y ResponsableDeControlDeAccesos.
- [ ] Crear la matriz RolPermiso inicial.
- [ ] Implementar autenticación real con Supabase.
- [ ] Calcular permisos efectivos en backend.
- [ ] Retornar `allowed_modules` después del login.
- [ ] Proteger rutas frontend y endpoints backend.
- [ ] Invalidar sesiones tras bloqueos o revocaciones.

### Prioridad alta

- [ ] Adaptar el panel principal para mostrar solo módulos autorizados.
- [ ] Implementar redirección directa cuando exista un único módulo.
- [ ] Separar la vista administrativa y operativa de CAC.
- [ ] Implementar permisos de solo lectura del DirectorAdministrativo.
- [ ] Definir permisos puntuales consumidos entre módulos.
- [ ] Registrar intentos de acceso no autorizado.

### Pruebas

- [ ] Probar cada rol con accesos permitidos y rechazados.
- [ ] Probar usuarios con varios roles.
- [ ] Probar roles revocados durante una sesión.
- [ ] Probar acceso manual por URL.
- [ ] Probar llamadas directas a la API sin permiso.
- [ ] Probar bloqueo por intentos fallidos.
- [ ] Probar que un permiso puntual no muestre el módulo proveedor.

---

## 15. Decisiones pendientes de aprobación

1. Aprobar el nombre definitivo del rol administrativo de PCO.
2. Aprobar el nombre definitivo del rol supervisor/administrador de CAC.
3. Definir si el DirectorAdministrativo puede consultar indicadores resumidos de GPI, GPE, PCO y CAC desde un tablero común.
4. Definir si el AdministradorDelSistema tendrá un permiso temporal de soporte para otros módulos, separado de sus permisos normales.
5. Definir la duración de sesión y de “Recordar sesión” por tipo de usuario.
6. Confirmar qué acciones del GuardiaDeSeguridad estarán limitadas al PuntoControl asignado.
