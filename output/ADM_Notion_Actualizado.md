# Administración del Sistema (ADM)

> **Versión actualizada:** 10 de julio de 2026  
> **Estado:** alcance funcional consolidado con el prototipo actual, la plantilla de integración, el mapa de subsistemas de Notion y el feedback sobre entidades maestras.  
> **Representante:** Gary Defas  
> **Integrantes:** Gary Defas, Lindsay Guzmán, Anahí Achote y Jarvin Ríos.

---

## 1. Objetivo del módulo

Administrar la seguridad lógica, la configuración general y las entidades maestras compartidas del Sistema de Seguridad EPN. ADM centraliza usuarios, sesiones, roles, permisos, parámetros y auditoría, y garantiza que los demás módulos trabajen con identificadores, estados y reglas consistentes.

ADM también es propietario del dato maestro de **Persona**, **Vehículo** y **PersonaVehículo**, aunque algunos de estos elementos todavía no tengan pantallas dentro del prototipo. La propiedad del dato no significa que ADM ejecute todos los procesos funcionales: GPI y GPE originan información y asociaciones; CAC consulta los datos para validar accesos; PCO aporta el contexto físico donde ocurre la validación.

---

## 2. Alcance actual

### Alcance visible en el prototipo

- Autenticación y cierre de sesión.
- Gestión de cuentas de usuario.
- Cambio y restablecimiento de contraseñas.
- Asignación y revocación de roles.
- Bloqueo, desbloqueo, activación y baja lógica de usuarios.
- Consulta, registro y actualización de parámetros.
- Consulta de bitácora con filtros avanzados.
- Exportación de reportes en PDF o XLSX.

### Alcance requerido para integración y backend

- Configuración de la matriz rol-permiso.
- Verificación centralizada de autorizaciones.
- Registro inmutable de acciones en bitácora.
- Gestión del dato maestro Vehículo.
- Gestión de la asociación PersonaVehículo.

> Los casos de integración no tienen una pantalla vigente en el prototipo, pero deben mantenerse en el modelo porque son necesarios para la base de datos única y la comunicación entre módulos.

### Estado técnico actual

El repositorio vigente es un prototipo frontend desarrollado con React y Vite. Utiliza datos simulados y credenciales de demostración. La estructura Postgres/Supabase descrita en esta página corresponde al backend objetivo y no debe interpretarse como una base de datos ya implementada.

---

## 3. Responsabilidades de ADM

1. Mantener cuentas de usuario y sus estados.
2. Gestionar autenticación, sesiones y políticas de contraseña.
3. Mantener el catálogo institucional de roles y permisos.
4. Asociar o revocar roles de los usuarios.
5. Verificar si un usuario está autorizado para ejecutar una acción.
6. Administrar parámetros generales y parámetros consumidos por otros módulos.
7. Mantener una bitácora de auditoría de solo inserción.
8. Mantener las entidades maestras Persona, Vehículo y PersonaVehículo.
9. Evitar duplicados de personas, vehículos, usuarios, roles y permisos.
10. Proveer información consistente a GPI, GPE, PCO y CAC.

### 3.1 Entradas consolidadas

Esta tabla conserva las entradas de la página original y añade los nombres de variables solicitados por la decisión 012.

| Dato recibido | Proveedor | Variables principales | Descripción |
|---|---|---|---|
| Datos mínimos de Persona | GPI / GPE | `id_persona`, `cedula_identidad`, `nombres_apellidos`, `tipo_persona`, `estado_persona` | Identifica a la persona que se asociará con una cuenta o vehículo. |
| Solicitud de creación de usuario | GPI / GPE / PCO / CAC | `id_persona`, `nombre_usuario`, `correo_electronico`, `id_rol`, `estado_usuario` | Solicita una cuenta para un responsable, guardia, director o administrador. |
| Solicitud de asignación de rol | Todos los módulos | `id_usuario`, `id_rol`, `fecha_asignacion`, `observacion` | Indica el rol requerido por el usuario para ejecutar sus funciones. |
| Requerimiento de permiso | Todos los módulos | `codigo_permiso`, `nombre_permiso`, `modulo`, `tipo_accion`, `descripcion` | Define una acción que debe autorizarse dentro de un módulo. |
| Requerimiento de parámetro | Todos los módulos | `codigo_parametro`, `valor_parametro`, `tipo_dato`, `modulo_aplicacion` | Solicita registrar, consultar o actualizar un valor configurable. |
| Datos de vehículo | GPI / GPE / CAC | `id_vehiculo`, `placa`, `tipo_vehiculo`, `marca`, `modelo`, `color`, `estado_vehiculo` | Información necesaria para mantener Vehiculo como dato maestro. |
| Solicitud de asociación persona-vehículo | GPI / GPE | `id_persona`, `id_vehiculo`, `tipo_relacion`, `fecha_inicio`, `fecha_fin` | Registra propietario o conductor autorizado. |
| Acción administrativa | Todos los módulos | `id_usuario`, `accion`, `modulo`, `entidad_afectada`, `id_entidad_afectada`, `valor_anterior`, `valor_nuevo`, `resultado`, `ip_origen` | Información de una acción que debe registrarse en BitacoraSistema. |
| Evento de acceso o alerta | CAC | `id_evento`, `id_persona`, `id_vehiculo`, `id_punto_control`, `fecha_hora`, `resultado`, `motivo` | Información consumida por ADM para auditoría y supervisión; CAC conserva el evento original. |

### 3.2 Salidas consolidadas

| Dato generado | Consumidor | Variables principales | Descripción |
|---|---|---|---|
| UsuarioSistema habilitado | GPI / GPE / PCO / CAC / ADM | `id_usuario`, `nombre_usuario`, `estado_usuario`, `requiere_cambio_password` | Cuenta habilitada para autenticación y autorización. |
| Rol asignado | Todos los módulos | `id_usuario_rol`, `id_usuario`, `id_rol`, `estado_asignacion` | Rol activo asociado con el usuario. |
| Permisos autorizados | Todos los módulos | `codigo_permiso`, `autorizado`, `motivo`, `roles_activos` | Acciones que el usuario puede ejecutar según roles y permisos vigentes. |
| Parámetros del sistema | Todos los módulos | `codigo_parametro`, `valor_parametro`, `tipo_dato`, `estado_parametro` | Valores configurables consumidos por los módulos. |
| Estados y catálogos | Todos los módulos | `catalogo`, `codigo`, `nombre`, `estado` | Valores comunes para mantener consistencia. |
| Datos maestros de vehículos | GPI / GPE / CAC / PCO | `id_vehiculo`, `placa`, `tipo_vehiculo`, `marca`, `modelo`, `color`, `estado_vehiculo` | Información general del vehículo sin duplicaciones por módulo. |
| Asociaciones persona-vehículo | GPI / GPE / CAC | `id_persona_vehiculo`, `id_persona`, `id_vehiculo`, `tipo_relacion`, `fecha_inicio`, `fecha_fin`, `estado_relacion` | Propietarios y conductores autorizados vigentes o históricos. |
| Resultado de autenticación | Todos los módulos | `autenticado`, `id_sesion`, `fecha_expiracion`, `mensaje` | Informa si las credenciales son válidas. |
| Estado de UsuarioSistema | Todos los módulos | `id_usuario`, `estado_usuario`, `fecha_modificacion` | Indica si la cuenta está activa, inactiva, bloqueada o dada de baja. |
| Registro de bitácora | ADM | `id_bitacora`, `fecha_hora` | Evidencia histórica de la acción recibida. |
| Reporte de auditoría | AdministradorDelSistema / DirectorAdministrativo | `formato`, `fecha_inicio`, `fecha_fin`, `filtros`, `archivo_generado` | Resultado consultado o exportado desde la bitácora. |

---

## 4. Decisiones y correcciones incorporadas

### 4.1 Vehículo y PersonaVehículo son entidades maestras de ADM

Se confirma que **Vehículo** debe existir una sola vez en la base de datos común. GPI, GPE, PCO y CAC no deben crear tablas independientes como `VehiculoGPI`, `VehiculoGPE` o equivalentes.

ADM mantiene:

- Identificador maestro del vehículo.
- Placa normalizada y única.
- Tipo, marca, modelo y color.
- Estado del vehículo.
- Fechas de registro y actualización.
- Usuario responsable del registro.
- Historial de asociaciones con personas.

### 4.2 Responsabilidad por módulo

| Módulo | Responsabilidad respecto al vehículo |
|---|---|
| ADM | Mantiene el dato maestro, valida unicidad, estados e historial. |
| GPI | Origina o solicita registros y asociaciones para personal interno. |
| GPE | Origina o solicita registros y asociaciones para personal externo. |
| PCO | Aporta la zona, parqueadero, dispositivo o punto físico. No es propietario del vehículo. |
| CAC | Consulta vehículo y asociación para autorizar o denegar el acceso. Registra el evento resultante. |

### 4.3 La clasificación se obtiene desde Persona

No se agrega a **Vehiculo** un atributo para indicar si pertenece a GPI o GPE. Cuando el vehículo está asociado mediante **PersonaVehiculo**, la clasificación se obtiene desde `Persona.tipo_persona`.

Esta decisión evita información duplicada o contradictoria. Si una persona cambia de categoría o un vehículo cambia de propietario, se actualiza la relación correspondiente sin alterar la identidad maestra del vehículo. El módulo que ejecutó la operación puede registrarse en **BitacoraSistema** como información de auditoría, pero no es la fuente de verdad para clasificar al propietario.

### 4.4 Una asociación no concede acceso automáticamente

Que una persona esté asociada con un vehículo no implica que el ingreso esté autorizado. CAC debe combinar:

- Estado de la persona.
- Estado del vehículo.
- Estado y vigencia de PersonaVehículo.
- Rol y permisos del usuario cuando corresponda.
- Regla y horario de acceso.
- Punto de control o parqueadero.
- Alertas o restricciones activas.

### 4.5 Decisiones del proyecto relacionadas con ADM

| ID | Estado | Decisión | Aplicación en ADM |
|---|---|---|---|
| 002 | Pendiente de aprobación | GPE debe eliminar su copia de Persona porque ADM mantiene la entidad maestra con `tipo_persona`. | Persona permanece como maestra ADM; GPI/GPE la referencian. |
| 003 | Pendiente de aprobación | GPE debe eliminar sus copias de Vehiculo y PersonaVehiculo porque ADM mantiene las entidades maestras. | Vehiculo y PersonaVehiculo se conservan en ADM y se exponen mediante interfaces. |
| 011 | Pendiente de aprobación | No agregar un atributo al vehículo para diferenciar proveedor/personal interno; se determina por la Persona asociada. | Se elimina `modulo_origen` del modelo funcional y se usa `Persona.tipo_persona`. |
| 012 | Pendiente de aprobación | Todas las entradas y salidas deben indicar el nombre de la variable intercambiada. | Se documentan variables en la sección de interfaces. |
| 013 | Aprobada | Definir un parámetro único para el número máximo de vehículos que una persona puede registrar. | Se agrega `MAX_VEHICULOS_POR_PERSONA` a ParametroSistema. |

---

## 5. Actores

| ID | Actor | Tipo | Responsabilidad |
|---|---|---|---|
| ACT-ADM-001 | UsuarioSistema | Humano | Inicia/cierra sesión y cambia su propia contraseña. |
| ACT-ADM-002 | AdministradorDelSistema | Humano | Gestiona usuarios, roles, parámetros, auditoría y datos maestros. |
| ACT-ADM-003 | DirectorAdministrativo | Humano | Consulta usuarios, parámetros, bitácora y reportes. No modifica configuración. |
| ACT-ADM-004 | ResponsableDePersonalInterno | Humano | Rol de ingreso para operar GPI. |
| ACT-ADM-005 | ResponsableDePersonalExterno | Humano | Rol de ingreso para operar GPE. |
| ACT-ADM-006 | GuardiaDeSeguridad | Humano | Rol operativo para funciones pertenecientes a GPE/CAC. |

### Módulos internos relacionados

GPI, GPE, PCO y CAC no se modelan como actores porque son módulos internos del mismo sistema. Se documentan como proveedores o consumidores de información:

| Módulo | Relación con ADM |
|---|---|
| GPI | Provee datos internos y solicitudes de gestión/asociación vehicular; consume autorización y parámetros. |
| GPE | Provee datos externos y solicitudes de gestión/asociación vehicular; consume autorización y parámetros. |
| PCO | Provee zonas, puntos y dispositivos; consume configuración y autorización. |
| CAC | Consume datos maestros/autorización y provee eventos, alertas y resultados. |

### Roles de ingreso vigentes

- AdministradorDelSistema.
- DirectorAdministrativo.
- ResponsableDePersonalInterno.
- ResponsableDePersonalExterno.
- GuardiaDeSeguridad.

---

## 6. Casos de uso

### 6.1 Casos visibles en el prototipo

La tabla conserva exactamente los seis campos solicitados por la plantilla de integración. La revisión se limita a las pantallas y flujos visibles del mockup; no afirma que exista persistencia o backend.

| ID CU | Nombre del CU | Actor(es) | Descripción breve | Entidades involucradas | ¿Depende de otro módulo? ¿Cuál? |
|---|---|---|---|---|---|
| CU-ADM-001 | Autenticar usuario | UsuarioSistema | Valida los campos y las credenciales de demostración; al aprobarlas permite ingresar al panel. | UsuarioSistema, Sesion | No. |
| CU-ADM-002 | Cerrar sesión | UsuarioSistema | Finaliza la sesión de interfaz y regresa a la pantalla de ingreso. | Sesion | No. |
| CU-ADM-003 | Consultar usuario | AdministradorDelSistema, DirectorAdministrativo | Filtra cuentas por usuario, correo, estado, rol y fecha de creación. | UsuarioSistema, Rol | No. |
| CU-ADM-004 | Cambiar contraseña propia | UsuarioSistema | Solicita contraseña actual, nueva contraseña y confirmación. | UsuarioSistema, ParametroSistema, BitacoraSistema | No. |
| CU-ADM-005 | Registrar usuario | AdministradorDelSistema | Registra una cuenta, la Persona asociada, un rol inicial, el estado y una contraseña temporal. | UsuarioSistema, Persona, Rol, UsuarioRol, BitacoraSistema | Sí: GPI/GPE pueden proveer los datos de Persona. |
| CU-ADM-006 | Actualizar usuario | AdministradorDelSistema | Modifica los datos permitidos, el estado y la observación; muestra el rol anterior como referencia. | UsuarioSistema, Persona, BitacoraSistema | Sí: GPI/GPE pueden proveer o actualizar los datos de Persona. |
| CU-ADM-007 | Resetear contraseña | AdministradorDelSistema | Genera o recibe una contraseña temporal y permite exigir su cambio en el siguiente ingreso. | UsuarioSistema, ParametroSistema, BitacoraSistema | No. |
| CU-ADM-008 | Asignar rol a usuario | AdministradorDelSistema | Asocia un rol disponible, registra la fecha y permite añadir una observación opcional. | UsuarioSistema, Rol, UsuarioRol, BitacoraSistema | No. |
| CU-ADM-009 | Revocar rol a usuario | AdministradorDelSistema | Revoca una asignación de rol mediante confirmación y motivo obligatorio, sin borrar su historial. | UsuarioSistema, Rol, UsuarioRol, BitacoraSistema | No. |
| CU-ADM-010 | Bloquear usuario | AdministradorDelSistema | Bloquea temporal o indefinidamente una cuenta e indica motivo, fecha y duración. | UsuarioSistema, BitacoraSistema | No. |
| CU-ADM-011 | Desbloquear usuario | AdministradorDelSistema | Restaura el acceso de una cuenta bloqueada y registra el motivo y una observación opcional. | UsuarioSistema, BitacoraSistema | No. |
| CU-ADM-012 | Activar usuario | AdministradorDelSistema | Cambia una cuenta inactiva a activa mediante motivo y fecha. | UsuarioSistema, BitacoraSistema | No. |
| CU-ADM-013 | Dar de baja usuario | AdministradorDelSistema | Realiza la baja lógica de una cuenta y conserva su historial. | UsuarioSistema, BitacoraSistema | No. |
| CU-ADM-014 | Consultar parámetro | AdministradorDelSistema, DirectorAdministrativo | Filtra parámetros por código, nombre, módulo, estado y tipo de dato. | ParametroSistema | No. |
| CU-ADM-015 | Registrar parámetro | AdministradorDelSistema | Registra código, nombre, módulo, tipo, valor, fecha, estado y condición editable. | ParametroSistema, BitacoraSistema | No. |
| CU-ADM-016 | Actualizar parámetro | AdministradorDelSistema | Modifica el valor de un parámetro y exige justificar el cambio. | ParametroSistema, BitacoraSistema | No. |
| CU-ADM-017 | Consultar bitácora | AdministradorDelSistema, DirectorAdministrativo | Muestra la pantalla de consulta por fechas y filtros de usuario, acción, resultado, entidad e IP. | BitacoraSistema | No. |
| CU-ADM-018 | Exportar reporte de bitácora | AdministradorDelSistema, DirectorAdministrativo | Simula la generación de un reporte en PDF o XLSX por rango y módulo, con detalle opcional. | BitacoraSistema | No. |

### 6.2 Casos requeridos para integración/backend

Estos casos se conservan por las decisiones de integración, pero no representan pantallas existentes en el mockup actual.

| ID CU | Nombre del CU | Actor(es) | Descripción breve | Entidades involucradas | ¿Depende de otro módulo? ¿Cuál? |
|---|---|---|---|---|---|
| CU-ADM-019 | Configurar matriz rol-permiso | AdministradorDelSistema | Mantiene la asociación entre el catálogo de roles y los permisos técnicos. Sin pantalla vigente. | Rol, Permiso, RolPermiso, BitacoraSistema | No. |
| CU-ADM-020 | Verificar autorización de una acción | UsuarioSistema | Determina si el usuario posee un permiso activo; la autorización es una condición del flujo, no un actor diferente. | UsuarioRol, RolPermiso, Permiso | Sí: GPI, GPE, PCO y CAC consumen el servicio. |
| CU-ADM-021 | Registrar acción en bitácora | UsuarioSistema | Registra la acción originada por el usuario; un servicio interno realiza el registro y el módulo ejecutor se conserva como origen, no como actor. | BitacoraSistema | Sí: GPI, GPE, PCO y CAC remiten acciones. |
| CU-ADM-022 | Gestionar vehículo maestro | AdministradorDelSistema, ResponsableDePersonalInterno, ResponsableDePersonalExterno | Registra, consulta, actualiza, suspende o da de baja el vehículo maestro. Sin pantalla vigente. | Vehiculo, BitacoraSistema | Sí: GPI/GPE originan datos y CAC los consulta. |
| CU-ADM-023 | Gestionar asociación persona-vehículo | AdministradorDelSistema, ResponsableDePersonalInterno, ResponsableDePersonalExterno | Mantiene propietario o conductor, vigencia, estado y revocación. La clasificación se obtiene desde Persona. Sin pantalla vigente. | Persona, Vehiculo, PersonaVehiculo, BitacoraSistema | Sí: GPI/GPE originan asociaciones y CAC las consulta. |

### 6.3 Correspondencia con los casos de uso originales de Notion

La siguiente tabla mantiene la trazabilidad con la nomenclatura anterior sin conservar IDs inconsistentes o procesos redundantes como casos independientes.

| Caso original | Correspondencia actual | Tratamiento |
|---|---|---|
| `ingresarAlSistema` | CU-ADM-001 | Se conserva como autenticación. |
| `actualizarContraseñaPropia` | CU-ADM-004 | Se conserva. |
| `validarCredenciales` | CU-ADM-001 | Se integra como paso interno de autenticación, no como caso humano independiente. |
| `registrarUsuarioSistema` | CU-ADM-005 | Se conserva. |
| `consultarUsuarioSistema` | CU-ADM-003 | Se conserva. |
| `actualizarUsuarioSistema` | CU-ADM-006 | Se conserva. |
| `resetearPassword` | CU-ADM-007 | Se conserva. |
| `asignarRolUsuario` | CU-ADM-008 | Se conserva. |
| `revocarRolUsuario` | CU-ADM-009 | Se conserva. |
| `bloquearUsuarioSistema` | CU-ADM-010 | Se conserva. |
| `desbloquearUsuarioSistema` | CU-ADM-011 | Se conserva. |
| `darDeAltaUsuarioSistema` | CU-ADM-012 | Se conserva como Activar usuario. |
| `darDeBajaUsuarioSistema` | CU-ADM-013 | Se conserva. |
| `registrarEnBitacoraDeAuditoria` | CU-ADM-021 | Se conserva como servicio interno de integración. |
| `consultarBitacoraDeAuditoria` | CU-ADM-017 | Se conserva. |
| `filtrarBitacora` | CU-ADM-017 | Se integra como comportamiento de la consulta. |
| `emitirReporte` | CU-ADM-018 | Se conserva como exportación PDF/XLSX. |
| `registrarParametro` | CU-ADM-015 | Se conserva. |
| `consultarParametro` | CU-ADM-014 | Se conserva. |
| `actualizarParametro` | CU-ADM-016 | Se conserva. |

---

## 7. Entidades del módulo

| Entidad | Clasificación | Propósito y consumidores |
|---|---|---|
| Persona | Maestra compartida ADM | Identidad única referenciada por usuarios, GPI, GPE, PCO y CAC. |
| UsuarioSistema | Maestra compartida ADM | Cuenta lógica utilizada para autenticación, autorización y auditoría. |
| Sesion | Propia de ADM | Inicio, vigencia, cierre, token e IP de una sesión. |
| Rol | Compartida | Catálogo de responsabilidades funcionales. |
| Permiso | Compartida | Autorización técnica atómica con formato `MODULO_ENTIDAD_ACCION`. |
| UsuarioRol | Propia de ADM | Asignación histórica entre usuarios y roles. |
| RolPermiso | Propia de ADM | Matriz histórica entre roles y permisos. |
| ParametroSistema | Compartida | Configuración general consumida por los módulos. |
| BitacoraSistema | Compartida | Evidencia de auditoría de solo inserción. |
| Vehiculo | Maestra compartida ADM | Registro único de placa y características generales. |
| PersonaVehiculo | Maestra compartida ADM | Asociación histórica entre una persona y un vehículo. |

### 7.1 Consideraciones de Persona conservadas

- Una Persona puede existir sin una cuenta UsuarioSistema.
- Una Persona puede generar múltiples eventos de acceso.
- Una Persona puede tener varias autorizaciones o asociaciones históricas.
- `matricula` es obligatoria únicamente cuando `tipo_persona = ESTUDIANTE`.
- La cédula debe validarse según las reglas institucionales y puede ser nula cuando se usa otro documento.
- La baja de Persona es lógica y no elimina su trazabilidad.
- Las credenciales biométricas no se almacenan como atributos duplicados de Persona en ADM; pertenecen al modelo definido con GPI/CAC y se referencian mediante identificadores o rutas seguras.

### 7.2 Diccionario de datos consolidado

Los nombres se normalizan a `snake_case` y los tipos se expresan para Postgres/Supabase.

#### Persona

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_persona | uuid | PK, `gen_random_uuid()`. |
| cedula_identidad | varchar(10) | UNIQUE, nullable cuando existe otro documento. |
| nombres_apellidos | varchar(150) | NOT NULL. |
| fecha_nacimiento | date | Nullable. |
| sexo | text | Catálogo institucional. |
| tipo_persona | text | ESTUDIANTE, DOCENTE, ADMINISTRATIVO, VISITANTE, PROVEEDOR o CONTRATISTA. |
| estado_persona | text | ACTIVO, INACTIVO, PENDIENTE, BLOQUEADO o DADO_DE_BAJA. |
| matricula | varchar(30) | UNIQUE, requerida para estudiantes. |
| correo_electronico | varchar(120) | Medio de contacto. |
| telefono | varchar(20) | Nullable. |
| fecha_registro | timestamptz | `DEFAULT now()`. |
| fecha_modificacion | timestamptz | Nullable. |

#### UsuarioSistema

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_usuario | uuid | PK. |
| nombre_usuario | varchar(50) | UNIQUE, NOT NULL. |
| correo_electronico | varchar(120) | UNIQUE, NOT NULL. |
| password_hash | text | NOT NULL; nunca exponer en claro. |
| estado_usuario | text | ACTIVO, INACTIVO, BLOQUEADO o DADO_DE_BAJA. |
| intentos_fallidos | integer | `DEFAULT 0`. |
| fecha_ultimo_login | timestamptz | Nullable. |
| requiere_cambio_password | boolean | `DEFAULT false`. |
| id_persona | uuid | FK a Persona, nullable. |
| fecha_creacion | timestamptz | `DEFAULT now()`. |
| fecha_modificacion | timestamptz | Nullable. |

#### Sesion

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_sesion | uuid | PK. |
| id_usuario | uuid | FK a UsuarioSistema. |
| token_hash | text | Hash protegido mediante RLS. |
| recordar_sesion | boolean | `DEFAULT false`. |
| fecha_inicio | timestamptz | `DEFAULT now()`. |
| fecha_expiracion | timestamptz | Calculada según la política. |
| fecha_cierre | timestamptz | Nullable. |
| estado_sesion | text | ACTIVA, EXPIRADA o CERRADA. |
| ip_origen | varchar(45) | IPv4/IPv6. |

#### Rol

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_rol | uuid | PK. |
| nombre_rol | varchar(80) | UNIQUE, NOT NULL. |
| descripcion | varchar(255) | Nullable. |
| estado_rol | text | ACTIVO o INACTIVO. |
| fecha_creacion | timestamptz | `DEFAULT now()`. |
| fecha_modificacion | timestamptz | Nullable. |

#### Permiso

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_permiso | uuid | PK. |
| codigo_permiso | varchar(100) | UNIQUE; formato `MODULO_ENTIDAD_ACCION`. |
| nombre_permiso | varchar(120) | NOT NULL. |
| descripcion | varchar(255) | Nullable. |
| modulo | text | ADM, GPI, GPE, PCO o CAC. |
| tipo_accion | text | CREAR, CONSULTAR, ACTUALIZAR, ACTIVAR, BLOQUEAR, REVOCAR, EXPORTAR, etc. |
| estado_permiso | text | ACTIVO o INACTIVO. |

#### UsuarioRol

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_usuario_rol | uuid | PK. |
| id_usuario | uuid | FK a UsuarioSistema. |
| id_rol | uuid | FK a Rol. |
| estado_asignacion | text | ACTIVO o REVOCADO. |
| fecha_asignacion | timestamptz | NOT NULL. |
| fecha_revocacion | timestamptz | Nullable. |
| id_usuario_asigno | uuid | FK al administrador responsable. |
| id_usuario_revoco | uuid | FK nullable. |

Debe impedirse más de una asignación activa para la misma combinación `id_usuario + id_rol`.

#### RolPermiso

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_rol_permiso | uuid | PK. |
| id_rol | uuid | FK a Rol. |
| id_permiso | uuid | FK a Permiso. |
| estado_asignacion | text | ACTIVO o REVOCADO. |
| fecha_asignacion | timestamptz | NOT NULL. |
| fecha_revocacion | timestamptz | Nullable. |

Debe existir unicidad para la combinación `id_rol + id_permiso` mientras la asignación esté activa.

#### BitacoraSistema

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_bitacora | uuid | PK. |
| fecha_hora | timestamptz | `DEFAULT now()`. |
| id_usuario | uuid | FK nullable para procesos técnicos. |
| accion | varchar(100) | NOT NULL. |
| modulo | text | ADM, GPI, GPE, PCO o CAC. |
| entidad_afectada | varchar(80) | NOT NULL. |
| id_entidad_afectada | varchar(60) | Nullable. |
| valor_anterior | jsonb | Nullable. |
| valor_nuevo | jsonb | Nullable. |
| resultado | text | EXITO o ERROR. |
| descripcion | text | Nullable. |
| ip_origen | varchar(45) | Nullable. |

Las consultas simples no necesariamente generan bitácora. Los cambios administrativos, autenticaciones sensibles, bloqueos, asignaciones, revocaciones y operaciones sobre datos maestros sí deben registrarse.

#### ParametroSistema

| Atributo | Tipo | Regla principal |
|---|---|---|
| id_parametro | uuid | PK. |
| codigo_parametro | varchar(80) | UNIQUE, NOT NULL. |
| nombre_parametro | varchar(120) | NOT NULL. |
| valor_parametro | text | NOT NULL. |
| tipo_dato | text | ENTERO, DECIMAL, TEXTO, BOOLEANO, FECHA u HORA. |
| descripcion | varchar(255) | Nullable. |
| modulo_aplicacion | text | Módulo consumidor. |
| valor_defecto | varchar(255) | Nullable. |
| estado_parametro | text | ACTIVO o INACTIVO. |
| editable | boolean | `DEFAULT true`. |
| fecha_modificacion | timestamptz | Nullable. |
| id_usuario_modifico | uuid | FK nullable a UsuarioSistema. |

### 7.3 Permisos esenciales conservados

Ejemplos de permisos propios de ADM:

- `ADM_USUARIO_CREAR`
- `ADM_USUARIO_CONSULTAR`
- `ADM_USUARIO_ACTUALIZAR`
- `ADM_USUARIO_BLOQUEAR`
- `ADM_USUARIO_ASIGNAR_ROL`
- `ADM_PARAMETRO_ACTUALIZAR`
- `ADM_BITACORA_CONSULTAR`
- `ADM_BITACORA_EXPORTAR`
- `ADM_VEHICULO_GESTIONAR`
- `ADM_PERSONA_VEHICULO_GESTIONAR`

Permisos esenciales del GuardiaDeSeguridad conservados del contenido original:

| Código | Módulo | Descripción |
|---|---|---|
| SIS_INICIAR_SESION | ADM | Iniciar sesión. |
| SIS_CERRAR_SESION | ADM | Cerrar la sesión activa. |
| SIS_CAMBIAR_PASSWORD_PROPIA | ADM | Cambiar su propia contraseña. |
| GPE_PERSONA_EXTERNA_CONSULTAR | GPE | Consultar una persona externa. |
| GPE_PERSONA_EXTERNA_NOTIFICAR_LLEGADA | GPE | Notificar llegada al punto de control. |
| CAC_ACCESO_REGISTRAR_ENTRADA | CAC | Registrar entrada de persona o vehículo. |
| CAC_ACCESO_REGISTRAR_SALIDA | CAC | Registrar salida de persona o vehículo. |
| CAC_AUTORIZACION_CONSULTAR | CAC | Consultar una autorización vigente. |
| CAC_EVENTO_CONSULTAR | CAC | Consultar eventos relacionados con el punto de control. |
| CAC_VEHICULO_CONSULTAR | CAC | Consultar datos básicos de un vehículo. |
| CAC_DOCUMENTO_CUSTODIA_REGISTRAR | CAC | Registrar recepción temporal de un documento. |
| CAC_DOCUMENTO_CUSTODIA_DEVOLVER | CAC | Registrar devolución del documento. |

---

## 8. Modelo de datos vehicular

### 8.1 Vehiculo

| Atributo | Tipo Postgres | Obligatorio | Regla |
|---|---|---|---|
| id_vehiculo | uuid | Sí | PK, `gen_random_uuid()`. |
| placa | varchar(15) | Condicional | Única y normalizada en mayúsculas; puede ser nula cuando legalmente no aplica. |
| tipo_vehiculo | text | Sí | AUTOMOVIL, MOTOCICLETA, CAMIONETA, BICICLETA u OTRO. |
| marca | varchar(50) | No | Marca comercial. |
| modelo | varchar(60) | No | Modelo comercial. |
| color | varchar(40) | No | Color predominante. |
| estado_vehiculo | text | Sí | ACTIVO, SUSPENDIDO o DADO_DE_BAJA. |
| fecha_registro | timestamptz | Sí | `DEFAULT now()`. |
| fecha_actualizacion | timestamptz | No | Fecha del último cambio. |
| id_usuario_registro | uuid | Sí | FK a UsuarioSistema. |

### 8.2 PersonaVehiculo

| Atributo | Tipo Postgres | Obligatorio | Regla |
|---|---|---|---|
| id_persona_vehiculo | uuid | Sí | PK, `gen_random_uuid()`. |
| id_persona | uuid | Sí | FK a Persona. |
| id_vehiculo | uuid | Sí | FK a Vehiculo. |
| tipo_relacion | text | Sí | PROPIETARIO, CONDUCTOR_AUTORIZADO o TEMPORAL. |
| fecha_inicio | timestamptz | Sí | Inicio de vigencia. |
| fecha_fin | timestamptz | No | Fin de vigencia; nula cuando es indefinida. |
| estado_relacion | text | Sí | ACTIVA, SUSPENDIDA, VENCIDA o REVOCADA. |
| fecha_registro | timestamptz | Sí | `DEFAULT now()`. |
| id_usuario_registro | uuid | Sí | FK a UsuarioSistema. |
| motivo_revocacion | varchar(255) | No | Justificación de suspensión o revocación. |

### Restricciones recomendadas

- Índice único parcial para placas no nulas.
- Normalizar la placa eliminando espacios y convirtiendo a mayúsculas.
- No eliminar físicamente vehículos ni asociaciones con historial.
- Impedir asociaciones activas duplicadas para la misma persona, vehículo y tipo de relación.
- No permitir nuevas asociaciones cuando `estado_vehiculo` sea SUSPENDIDO o DADO_DE_BAJA.
- Actualizar automáticamente relaciones vencidas cuando se alcance `fecha_fin`.

---

## 9. Interfaces principales

| ID | Origen → destino | Información intercambiada |
|---|---|---|
| INT-GPI-ADM-001 | GPI → ADM | Persona interna y cuenta requerida. |
| INT-GPE-ADM-001 | GPE → ADM | Persona externa, autorización y trazabilidad. |
| INT-GPI-ADM-002 | GPI → ADM | Datos del vehículo y asociación con personal interno. |
| INT-GPE-ADM-002 | GPE → ADM | Datos del vehículo y asociación con personal externo. |
| INT-PCO-ADM-001 | PCO → ADM | Zonas, puntos de control y dispositivos para configuración/auditoría. |
| INT-CAC-ADM-001 | CAC → ADM | Eventos, alertas y resultados de validación. |
| INT-ADM-PCO-001 | ADM → PCO | Roles, permisos, parámetros y autorización. |
| INT-ADM-CAC-001 | ADM → CAC | Roles y permisos para acciones protegidas. |
| INT-ADM-CAC-002 | ADM → CAC | Parámetros de configuración. |
| INT-ADM-CAC-004 | ADM → CAC | Vehículo, placa y estado. |
| INT-ADM-CAC-005 | ADM → CAC | Persona asociada, tipo de relación, estado y vigencia. |

### 9.1 Contratos técnicos resumidos

Esta vista complementa las entradas y salidas de las secciones 3.1 y 3.2 mostrando cada solicitud junto con su respuesta esperada.

| Operación/interfaz | Proveedor | Variables de entrada | Consumidor | Variables de salida |
|---|---|---|---|---|
| Autenticar usuario | UsuarioSistema | `nombre_usuario`, `password` | ADM | `id_sesion`, `fecha_expiracion`, `requiere_cambio_password` |
| Verificar autorización | GPI/GPE/PCO/CAC | `id_usuario`, `codigo_permiso`, `modulo`, `accion` | ADM | `autorizado`, `motivo`, `roles_activos` |
| Consultar parámetro | GPI/GPE/PCO/CAC | `codigo_parametro` | ADM | `valor_parametro`, `tipo_dato`, `estado_parametro` |
| Registrar acción | GPI/GPE/PCO/CAC | `id_usuario`, `accion`, `modulo`, `entidad_afectada`, `id_entidad_afectada`, `resultado`, `ip_origen` | ADM | `id_bitacora`, `fecha_hora` |
| Gestionar vehículo | GPI/GPE/ADM | `id_vehiculo`, `placa`, `tipo_vehiculo`, `marca`, `modelo`, `color`, `estado_vehiculo` | ADM | `id_vehiculo`, `resultado_operacion`, `mensaje` |
| Asociar persona-vehículo | GPI/GPE/ADM | `id_persona`, `id_vehiculo`, `tipo_relacion`, `fecha_inicio`, `fecha_fin` | ADM | `id_persona_vehiculo`, `estado_relacion`, `resultado_operacion` |
| Validar vehículo | CAC | `placa` o `id_vehiculo`, `fecha_hora`, `id_punto_control` | ADM | `existe`, `estado_vehiculo`, `personas_asociadas`, `relaciones_vigentes` |
| Registrar evento/alerta | CAC | `id_evento`, `id_persona`, `id_vehiculo`, `id_punto_control`, `resultado`, `motivo` | ADM | `id_bitacora`, `fecha_hora` |

---

## 10. Reglas de negocio

1. Una Persona debe existir una sola vez en la base de datos común.
2. Un Vehículo debe existir una sola vez, independientemente del módulo que originó el registro.
3. La relación PersonaVehículo debe conservar historial y nunca sobrescribirse sin trazabilidad.
4. Las bajas de usuarios, vehículos y asociaciones son lógicas.
5. Toda acción administrativa relevante genera un registro en BitacoraSistema.
6. BitacoraSistema y EventoAcceso son históricos: no admiten actualización ni eliminación.
7. Una persona puede tener cero o una cuenta UsuarioSistema, según la decisión de integración vigente.
8. Un usuario puede poseer varios roles activos.
9. Un rol puede contener varios permisos y un permiso puede pertenecer a varios roles.
10. Las contraseñas y tokens nunca se almacenan ni retornan en texto plano.
11. Una asociación PersonaVehículo activa no equivale a una autorización de acceso.
12. CAC es responsable de la decisión de acceso; ADM proporciona datos maestros, autorización lógica y parámetros.
13. PCO administra infraestructura física, no el ciclo de vida del vehículo.

---

## 11. Parámetros iniciales

| Código | Propósito |
|---|---|
| MAX_INTENTOS_LOGIN | Número máximo de intentos fallidos antes del bloqueo. |
| TIEMPO_SESION_MIN | Duración estándar de una sesión. |
| LONGITUD_MINIMA_PASSWORD | Longitud mínima permitida para contraseñas. |
| TIEMPO_BLOQUEO_CUENTA_MIN | Duración predeterminada del bloqueo automático. |
| FORMATO_FECHA | Formato general utilizado por la interfaz. |
| MAX_VEHICULOS_POR_PERSONA | Número máximo de asociaciones vehiculares activas permitidas para una persona. |
| VIGENCIA_CODIGO_TEMPORAL_HORAS | Vigencia de contraseñas o códigos temporales de recuperación. |

---

## 12. Seguridad y Supabase

- Utilizar UUID en entidades compartidas.
- Activar Row Level Security en UsuarioSistema, Sesion, UsuarioRol, RolPermiso, Permiso, BitacoraSistema, Persona, Vehiculo y PersonaVehiculo.
- Guardar únicamente `password_hash` y `token_hash`.
- Prohibir UPDATE y DELETE sobre BitacoraSistema mediante políticas y permisos de base de datos.
- Registrar el usuario responsable, fecha, IP y resultado de cada operación sensible.
- No almacenar biometría como BLOB en las tablas de ADM.
- Crear índices para placa, nombre de usuario, correo, estado, fechas y claves foráneas.
- Validar permisos tanto en frontend como en backend; la interfaz no constituye un control de seguridad suficiente.

---

## 13. Tareas de mejora

### Prioridad crítica — integración y seguridad

- [ ] Reemplazar las credenciales `admin/admin123` por autenticación real mediante Supabase.
- [ ] Crear migraciones para las 11 entidades de ADM.
- [ ] Implementar constraints, índices y claves foráneas.
- [ ] Implementar RLS y separación de permisos por rol.
- [ ] Sustituir el campo libre “Persona asociada” por una selección que persista `id_persona`.
- [ ] Implementar BitacoraSistema como tabla de solo inserción.
- [ ] Definir contratos/API para CU-ADM-020 y CU-ADM-021.
- [ ] Acordar con GPI/GPE el flujo de creación y actualización de Vehiculo y PersonaVehiculo.
- [ ] Acordar con CAC el contrato de consulta vehicular y la respuesta esperada.

### Prioridad alta — entidades maestras

- [ ] Implementar CU-ADM-022 para el dato maestro Vehiculo.
- [ ] Implementar CU-ADM-023 para PersonaVehiculo.
- [ ] Normalizar y validar placas.
- [ ] Implementar vigencia, suspensión, revocación y baja lógica.
- [ ] Evitar asociaciones activas duplicadas.
- [ ] Registrar `id_usuario_registro` y el módulo ejecutor dentro de BitacoraSistema, sin duplicar `Persona.tipo_persona`.
- [ ] Definir cómo GPI/GPE reportan errores de duplicidad o conflictos de asociación.

### Prioridad alta — roles, permisos y parámetros

- [ ] Implementar la matriz RolPermiso en backend.
- [ ] Mantener los cinco roles de ingreso definidos y evitar nombres duplicados.
- [ ] Implementar verificación de autorización antes de cada operación protegida.
- [ ] Validar que el valor de cada parámetro corresponda con su tipo de dato.
- [ ] Registrar valor anterior, valor nuevo y justificación de cada cambio.

### Prioridad media — interfaz y reportes

- [ ] Conectar formularios y tablas con Supabase.
- [ ] Implementar búsquedas reales, paginación y estados de carga/error.
- [ ] Implementar exportación real a PDF y XLSX.
- [ ] Mostrar mensajes de conflicto de placa o asociación de forma comprensible.
- [ ] Evaluar si ADM requiere pantallas propias para Vehiculo/PersonaVehiculo o si solo expondrá servicios a GPI/GPE.

### Prioridad media — calidad

- [ ] Crear pruebas unitarias para validaciones y transiciones de estado.
- [ ] Crear pruebas de integración entre ADM, GPI, GPE, PCO y CAC.
- [ ] Probar accesos concurrentes y duplicidad de placas.
- [ ] Verificar que ninguna baja lógica elimine evidencia histórica.
- [ ] Documentar códigos de error, formatos de respuesta y permisos requeridos por interfaz.
- [ ] Validar con los equipos los nombres definitivos de las variables de entrada y salida documentadas en la sección 9.1.

---

## 14. Criterios de aceptación de la integración vehicular

- [ ] GPI puede registrar o asociar un vehículo sin crear una tabla propia.
- [ ] GPE puede registrar o asociar un vehículo sin duplicar una placa existente.
- [ ] ADM conserva un único registro maestro por vehículo.
- [ ] ADM conserva el historial de propietarios y conductores autorizados.
- [ ] CAC puede consultar por placa y obtener vehículo, persona, tipo de relación, estado y vigencia.
- [ ] CAC puede distinguir entre persona interna y externa mediante `Persona.tipo_persona`.
- [ ] PCO puede relacionar el evento con un punto físico sin convertirse en propietario del vehículo.
- [ ] Suspender o dar de baja un vehículo impide nuevas autorizaciones.
- [ ] Revocar una asociación no elimina el vehículo ni el historial.
- [ ] Toda operación produce evidencia en BitacoraSistema.

---

## 15. Observaciones finales

- El prototipo actual sigue siendo la referencia para las pantallas y flujos visibles.
- La plantilla de integración define convenciones, restricciones y responsabilidades de la base única.
- Notion aporta el mapa general de módulos e interfaces.
- El feedback recibido confirma a ADM como propietario de las entidades maestras compartidas.
- Las funcionalidades sin pantalla se mantienen identificadas como **integración/backend** para no confundirlas con funciones ya implementadas.
- Al reemplazar el contenido en Notion deben conservarse los bloques o enlaces existentes de **UML - ADM**, **Prototipo-ADM**, **Prototipo 1 v2**, **MODELO DE DATOS ADM** y los archivos adjuntos vigentes.
- Los antiguos atributos `TipoVehículo` (proveedor/CEC/etc.) y `NumMáxmioVehículoPersona` no se conservan como columnas: la clasificación se deriva de `Persona.tipo_persona` y el máximo se administra mediante `MAX_VEHICULOS_POR_PERSONA`.
