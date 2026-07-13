import React, { useState } from "react";
import securityLogo from "../assets/logo-seguridad-epn.png";
import {
  Users, UserPlus, UserMinus, UserCheck, UserX, UserCog,
  Lock, Unlock, Key, Search, Settings, Filter, Download,
  LogOut, ChevronRight, ArrowLeft, Eye, EyeOff,
  Shield, AlertTriangle, X, CheckCircle, XCircle,
  ClipboardList, Edit, ChevronDown, ChevronUp,
  MapPin, User as UserIcon, FileText,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type Screen = "login" | "main" | "admin" | string;
type BtnVariant = "navy" | "red" | "green" | "gold";
type AlertKind = "success" | "error" | "warning";
type Section = "users" | "params" | "audit";

interface FieldDef {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "select" | "date" | "textarea" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  fullWidth?: boolean;
  readOnly?: boolean;
}

interface UCConfig {
  id: string;
  section: Section;
  title: string;
  actor: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  primaryBtn: string;
  btnVariant: BtnVariant;
  fields: FieldDef[];
  hasModal?: boolean;
  modalMessage?: string;
  hasTable?: boolean;
  tableData?: Record<string, string>[];
  tableColumns?: string[];
  successMsg: string;
  errorEmpty: string;
}

// ── EPN Shield ─────────────────────────────────────────────────────────────────

function EpnShield({ size = 44 }: { size?: number }) {
  return (
    <img
      src={securityLogo}
      alt="Logo del Sistema de Seguridad EPN"
      width={size}
      height={Math.round(size * 1.18)}
      className="object-contain"
    />
  );
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MOCK_USERS: Record<string, string>[] = [
  { "Usuario": "admin.epn", "Correo": "admin@epn.edu.ec", "Estado": "ACTIVO", "Rol": "Administrador del Sistema", "Último acceso": "05/07/2026" },
  { "Usuario": "director.administrativo", "Correo": "director@epn.edu.ec", "Estado": "ACTIVO", "Rol": "Director Administrativo", "Último acceso": "04/07/2026" },
  { "Usuario": "responsable.interno", "Correo": "r.interno@epn.edu.ec", "Estado": "INACTIVO", "Rol": "Responsable de Personal Interno", "Último acceso": "02/07/2026" },
  { "Usuario": "responsable.externo", "Correo": "r.externo@epn.edu.ec", "Estado": "BLOQUEADO", "Rol": "Responsable de Personal Externo", "Último acceso": "28/06/2026" },
  { "Usuario": "guardia.control", "Correo": "guardia@epn.edu.ec", "Estado": "ACTIVO", "Rol": "Guardia de Seguridad", "Último acceso": "05/07/2026" },
];

const MOCK_PARAMS: Record<string, string>[] = [
  { "Código": "MAX_INTENTOS_LOGIN", "Nombre": "Máx. intentos de login", "Valor": "3", "Tipo": "Entero", "Módulo": "Autenticación", "Estado": "ACTIVO", "Modificado": "10/01/2024" },
  { "Código": "TIEMPO_SESION_MIN", "Nombre": "Tiempo de sesión (min)", "Valor": "15", "Tipo": "Entero", "Módulo": "Sesión", "Estado": "ACTIVO", "Modificado": "10/01/2024" },
  { "Código": "LONGITUD_MINIMA_PASSWORD", "Nombre": "Longitud mínima contraseña", "Valor": "8", "Tipo": "Entero", "Módulo": "Seguridad", "Estado": "CRÍTICO", "Modificado": "05/01/2024" },
  { "Código": "TIEMPO_BLOQUEO_CUENTA_MIN", "Nombre": "Tiempo de bloqueo (min)", "Valor": "30", "Tipo": "Entero", "Módulo": "Autenticación", "Estado": "ACTIVO", "Modificado": "10/01/2024" },
  { "Código": "FORMATO_FECHA", "Nombre": "Formato de fecha del sistema", "Valor": "dd/mm/aaaa", "Tipo": "Texto", "Módulo": "General", "Estado": "ACTIVO", "Modificado": "08/01/2024" },
];

const MOCK_AUDIT: Record<string, string>[] = [
  { "Fecha y hora": "05/01/2024 09:15", "Usuario": "admin.epn", "Acción": "Registrar usuario", "Módulo": "Gestión Usuarios", "Entidad": "Usuario", "Resultado": "ÉXITO", "IP": "192.168.1.10" },
  { "Fecha y hora": "05/01/2024 09:22", "Usuario": "admin.epn", "Acción": "Actualizar usuario", "Módulo": "Gestión Usuarios", "Entidad": "Usuario", "Resultado": "ÉXITO", "IP": "192.168.1.10" },
  { "Fecha y hora": "04/01/2024 14:30", "Usuario": "director.administrativo", "Acción": "Consultar bitácora", "Módulo": "Auditoría", "Entidad": "Bitácora", "Resultado": "ÉXITO", "IP": "192.168.1.15" },
  { "Fecha y hora": "04/01/2024 11:45", "Usuario": "admin.epn", "Acción": "Bloquear usuario", "Módulo": "Gestión Usuarios", "Entidad": "Usuario", "Resultado": "ÉXITO", "IP": "192.168.1.10" },
  { "Fecha y hora": "03/01/2024 16:00", "Usuario": "admin.epn", "Acción": "Resetear contraseña", "Módulo": "Gestión Usuarios", "Entidad": "Usuario", "Resultado": "ERROR", "IP": "192.168.1.10" },
  { "Fecha y hora": "03/01/2024 10:15", "Usuario": "admin.epn", "Acción": "Actualizar parámetro", "Módulo": "Gestión Parámetros", "Entidad": "Parámetro", "Resultado": "ÉXITO", "IP": "192.168.1.10" },
  { "Fecha y hora": "02/01/2024 09:00", "Usuario": "admin.epn", "Acción": "Asignar rol", "Módulo": "Gestión Usuarios", "Entidad": "Rol", "Resultado": "ÉXITO", "IP": "192.168.1.10" },
];

// ── Use Cases ──────────────────────────────────────────────────────────────────

const USE_CASES: UCConfig[] = [
  // GESTIÓN DE USUARIOS
  {
    id: "consultar-usuario", section: "users",
    title: "Consultar Usuario",
    actor: "Administrador del Sistema / Director Administrativo",
    description: "Busca y muestra información detallada de una cuenta registrada en el sistema.",
    icon: <Search size={28} />, iconBg: "text-blue-600 bg-blue-50",
    primaryBtn: "CONSULTAR", btnVariant: "navy",
    hasTable: true, tableData: MOCK_USERS,
    tableColumns: ["Usuario", "Correo", "Estado", "Rol", "Último acceso"],
    fields: [
      { name: "username", label: "Nombre de usuario", type: "text", placeholder: "Ingrese nombre de usuario" },
      { name: "email", label: "Correo electrónico", type: "email", placeholder: "Ingrese correo electrónico" },
      { name: "status", label: "Estado del usuario", type: "select", options: ["Todos", "Activo", "Inactivo", "Bloqueado", "Dado de baja"] },
      { name: "role", label: "Rol", type: "select", options: ["Todos", "Administrador del Sistema", "Director Administrativo", "Responsable de Personal Interno", "Responsable de Personal Externo", "Guardia de Seguridad"] },
      { name: "createdDate", label: "Fecha de creación", type: "date" },
    ],
    successMsg: "Datos consultados correctamente.", errorEmpty: "Ingrese al menos un criterio de búsqueda.",
  },
  {
    id: "cambiar-password-propia", section: "users",
    title: "Cambiar Contraseña Propia",
    actor: "Usuario del Sistema",
    description: "Permite al usuario autenticado actualizar su contraseña de acceso de forma segura.",
    icon: <Key size={28} />, iconBg: "text-blue-600 bg-blue-50",
    primaryBtn: "CAMBIAR CONTRASEÑA", btnVariant: "navy",
    fields: [
      { name: "currentPassword", label: "Contraseña actual", type: "password", required: true, placeholder: "Ingrese su contraseña actual" },
      { name: "newPassword", label: "Nueva contraseña", type: "password", required: true, placeholder: "Mínimo 8 caracteres" },
      { name: "confirmNewPassword", label: "Confirmar nueva contraseña", type: "password", required: true, placeholder: "Repita la nueva contraseña", fullWidth: true },
    ],
    successMsg: "Contraseña actualizada satisfactoriamente.", errorEmpty: "Debe completar todos los campos obligatorios.",
  },
  {
    id: "registrar-usuario", section: "users",
    title: "Registrar Usuario",
    actor: "Administrador del Sistema",
    description: "Crea una nueva cuenta para una persona que necesita acceder al software del sistema.",
    icon: <UserPlus size={28} />, iconBg: "text-blue-600 bg-blue-50",
    primaryBtn: "REGISTRAR USUARIO", btnVariant: "navy",
    fields: [
      { name: "username", label: "Nombre de usuario", type: "text", required: true, placeholder: "Ej: usuario.epn" },
      { name: "email", label: "Correo electrónico", type: "email", required: true, placeholder: "Ej: usuario@epn.edu.ec" },
      { name: "person", label: "Persona asociada", type: "text", required: true, placeholder: "Nombre completo" },
      { name: "role", label: "Rol inicial", type: "select", required: true, options: ["Seleccione un rol...", "Administrador del Sistema", "Director Administrativo", "Responsable de Personal Interno", "Responsable de Personal Externo", "Guardia de Seguridad"] },
      { name: "status", label: "Estado inicial", type: "select", required: true, options: ["Activo", "Inactivo"] },
      { name: "password", label: "Contraseña temporal", type: "password", required: true, placeholder: "Mínimo 8 caracteres" },
      { name: "confirmPassword", label: "Confirmar contraseña temporal", type: "password", required: true, placeholder: "Repita la contraseña" },
      { name: "forceChange", label: "Solicitar cambio de contraseña en el próximo ingreso", type: "checkbox", fullWidth: true },
    ],
    successMsg: "Usuario registrado satisfactoriamente.", errorEmpty: "Debe completar todos los campos obligatorios.",
  },
  {
    id: "actualizar-usuario", section: "users",
    title: "Actualizar Usuario",
    actor: "Administrador del Sistema",
    description: "Modifica la información permitida de una cuenta de usuario existente.",
    icon: <UserCog size={28} />, iconBg: "text-blue-600 bg-blue-50",
    primaryBtn: "ACTUALIZAR USUARIO", btnVariant: "navy",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario o correo electrónico", fullWidth: true },
      { name: "username", label: "Nombre de usuario", type: "text", required: true, placeholder: "usuario.epn" },
      { name: "email", label: "Correo electrónico", type: "email", required: true, placeholder: "usuario@epn.edu.ec" },
      { name: "person", label: "Persona asociada", type: "text", placeholder: "Nombre completo" },
      { name: "previousRole", label: "Rol anterior", type: "text", placeholder: "Se mostrará al buscar el usuario", helpText: "Rol asignado antes de realizar la actualización.", readOnly: true },
      { name: "status", label: "Estado", type: "select", required: true, options: ["Activo", "Inactivo"] },
      { name: "observation", label: "Observación de modificación", type: "textarea", required: true, placeholder: "Describa el motivo del cambio realizado", fullWidth: true },
    ],
    successMsg: "Usuario actualizado satisfactoriamente.", errorEmpty: "Debe completar todos los campos obligatorios.",
  },
  {
    id: "resetear-password", section: "users",
    title: "Resetear Contraseña",
    actor: "Administrador del Sistema",
    description: "Genera una contraseña temporal o fuerza al usuario a establecer una nueva contraseña.",
    icon: <Key size={28} />, iconBg: "text-blue-600 bg-blue-50",
    primaryBtn: "RESETEAR CONTRASEÑA", btnVariant: "navy",
    fields: [
      { name: "username", label: "Nombre de usuario", type: "text", required: true, placeholder: "usuario.epn" },
      { name: "email", label: "Correo registrado", type: "email", required: true, placeholder: "usuario@epn.edu.ec" },
      { name: "reason", label: "Motivo del reseteo", type: "select", required: true, options: ["Seleccione motivo...", "Olvido de contraseña", "Seguridad preventiva", "Solicitud del usuario", "Cambio de política"] },
      { name: "tempPassword", label: "Contraseña temporal", type: "text", placeholder: "Dejar vacío para generación automática", helpText: "Si se deja vacío, se generará una contraseña segura de forma automática." },
      { name: "forceChange", label: "Obligar cambio de contraseña en el próximo inicio de sesión", type: "checkbox", fullWidth: true },
    ],
    successMsg: "Contraseña reseteada satisfactoriamente.", errorEmpty: "Debe completar los campos obligatorios.",
  },
  {
    id: "asignar-rol", section: "users",
    title: "Asignar Rol a Usuario",
    actor: "Administrador del Sistema",
    description: "Asigna uno o varios roles activos del sistema a una cuenta de usuario.",
    icon: <Shield size={28} />, iconBg: "text-blue-600 bg-blue-50",
    primaryBtn: "ASIGNAR ROL", btnVariant: "navy",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
      { name: "username", label: "Nombre del usuario", type: "text", required: true, placeholder: "Se cargará automáticamente" },
      { name: "role", label: "Rol disponible", type: "select", required: true, options: ["Seleccione un rol...", "Administrador del Sistema", "Director Administrativo", "Responsable de Personal Interno", "Responsable de Personal Externo", "Guardia de Seguridad"] },
      { name: "date", label: "Fecha de asignación", type: "date", required: true },
      { name: "observation", label: "Observación", type: "textarea", placeholder: "Motivo o justificación de la asignación", fullWidth: true },
    ],
    successMsg: "Rol asignado satisfactoriamente.", errorEmpty: "Debe completar los campos obligatorios.",
  },
  {
    id: "revocar-rol", section: "users",
    title: "Revocar Rol a Usuario",
    actor: "Administrador del Sistema",
    description: "Retira un rol previamente asignado de una cuenta de usuario activa.",
    icon: <UserX size={28} />, iconBg: "text-red-600 bg-red-50",
    primaryBtn: "REVOCAR ROL", btnVariant: "red",
    hasModal: true, modalMessage: "¿Está seguro de revocar el rol seleccionado? Esta acción modificará los permisos del usuario de manera inmediata.",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
      { name: "activeRoles", label: "Roles activos del usuario", type: "select", required: true, options: ["Seleccione...", "Administrador del Sistema", "Director Administrativo", "Responsable de Personal Interno", "Responsable de Personal Externo", "Guardia de Seguridad"] },
      { name: "revokeRole", label: "Rol que se desea revocar", type: "select", required: true, options: ["Seleccione...", "Administrador del Sistema", "Director Administrativo", "Responsable de Personal Interno", "Responsable de Personal Externo", "Guardia de Seguridad"] },
      { name: "reason", label: "Motivo de revocación", type: "textarea", required: true, placeholder: "Describa el motivo de la revocación", fullWidth: true },
    ],
    successMsg: "Rol revocado satisfactoriamente.", errorEmpty: "Debe completar los campos obligatorios.",
  },
  {
    id: "bloquear-usuario", section: "users",
    title: "Bloquear Usuario",
    actor: "Administrador del Sistema",
    description: "Bloquea temporal o indefinidamente una cuenta de usuario por razones de seguridad institucional.",
    icon: <Lock size={28} />, iconBg: "text-red-600 bg-red-50",
    primaryBtn: "BLOQUEAR USUARIO", btnVariant: "red",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
      { name: "currentStatus", label: "Estado actual", type: "text", placeholder: "Se cargará automáticamente" },
      { name: "reason", label: "Motivo de bloqueo", type: "select", required: true, options: ["Seleccione motivo...", "Seguridad preventiva", "Actividad sospechosa", "Solicitud del área", "Incumplimiento de políticas"] },
      { name: "date", label: "Fecha de bloqueo", type: "date", required: true },
      { name: "duration", label: "Duración del bloqueo", type: "select", required: true, options: ["Seleccione...", "24 horas", "48 horas", "7 días", "30 días", "Indefinido"] },
    ],
    successMsg: "Usuario bloqueado satisfactoriamente.", errorEmpty: "Debe ingresar un motivo de bloqueo.",
  },
  {
    id: "desbloquear-usuario", section: "users",
    title: "Desbloquear Usuario",
    actor: "Administrador del Sistema",
    description: "Retira el bloqueo temporal de una cuenta de usuario para restaurar su acceso.",
    icon: <Unlock size={28} />, iconBg: "text-green-700 bg-green-50",
    primaryBtn: "DESBLOQUEAR USUARIO", btnVariant: "green",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
      { name: "currentStatus", label: "Estado actual", type: "text", placeholder: "BLOQUEADO" },
      { name: "reason", label: "Motivo del desbloqueo", type: "select", required: true, options: ["Seleccione motivo...", "Solicitud del usuario", "Resolución de incidente", "Expiración del período de bloqueo", "Autorización del director"] },
      { name: "observation", label: "Observación adicional", type: "textarea", placeholder: "Observaciones del proceso de desbloqueo", fullWidth: true },
    ],
    successMsg: "Usuario desbloqueado satisfactoriamente.", errorEmpty: "Debe completar los campos obligatorios.",
  },
  {
    id: "activar-usuario", section: "users",
    title: "Activar Usuario",
    actor: "Administrador del Sistema",
    description: "Cambia el estado de una cuenta de usuario inactiva al estado activo.",
    icon: <UserCheck size={28} />, iconBg: "text-green-700 bg-green-50",
    primaryBtn: "ACTIVAR USUARIO", btnVariant: "green",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
      { name: "currentStatus", label: "Estado actual", type: "text", placeholder: "INACTIVO" },
      { name: "reason", label: "Motivo de activación", type: "select", required: true, options: ["Seleccione motivo...", "Reincorporación institucional", "Nuevo rol asignado", "Corrección de datos", "Autorización del director"] },
      { name: "date", label: "Fecha de activación", type: "date", required: true },
    ],
    successMsg: "Usuario activado satisfactoriamente.", errorEmpty: "Debe completar los campos obligatorios.",
  },
  {
    id: "dar-baja-usuario", section: "users",
    title: "Dar de Baja Usuario",
    actor: "Administrador del Sistema",
    description: "Da de baja lógicamente una cuenta de usuario sin eliminar su historial.",
    icon: <UserMinus size={28} />, iconBg: "text-red-600 bg-red-50",
    primaryBtn: "DAR DE BAJA", btnVariant: "red",
    hasModal: true, modalMessage: "Esta acción dará de baja lógicamente la cuenta, pero conservará su historial de actividad. ¿Desea continuar?",
    fields: [
      { name: "search", label: "Buscar usuario", type: "text", required: true, placeholder: "Nombre de usuario" },
      { name: "currentStatus", label: "Estado actual", type: "text", placeholder: "Se cargará automáticamente" },
      { name: "reason", label: "Motivo de baja", type: "select", required: true, options: ["Seleccione motivo...", "Desvinculación institucional", "Término de contrato", "Solicitud propia", "Medida disciplinaria"] },
      { name: "date", label: "Fecha de baja", type: "date", required: true },
      { name: "observation", label: "Observación", type: "textarea", placeholder: "Observaciones adicionales sobre la baja", fullWidth: true },
    ],
    successMsg: "Usuario dado de baja satisfactoriamente.", errorEmpty: "Debe ingresar un motivo de baja.",
  },
  // GESTIÓN DE PARÁMETROS
  {
    id: "consultar-parametro", section: "params",
    title: "Consultar Parámetro",
    actor: "Administrador del Sistema / Director Administrativo",
    description: "Busca y muestra los parámetros de configuración registrados en el sistema.",
    icon: <Search size={28} />, iconBg: "text-yellow-600 bg-yellow-50",
    primaryBtn: "CONSULTAR", btnVariant: "navy",
    hasTable: true, tableData: MOCK_PARAMS,
    tableColumns: ["Código", "Nombre", "Valor", "Tipo", "Módulo", "Estado", "Modificado"],
    fields: [
      { name: "code", label: "Código del parámetro", type: "text", placeholder: "Ej: MAX_INTENTOS_LOGIN" },
      { name: "name", label: "Nombre del parámetro", type: "text", placeholder: "Nombre descriptivo" },
      { name: "module", label: "Módulo de aplicación", type: "select", options: ["Todos", "Autenticación", "Sesión", "Seguridad", "General"] },
      { name: "status", label: "Estado", type: "select", options: ["Todos", "Activo", "Inactivo", "Crítico"] },
      { name: "dataType", label: "Tipo de dato", type: "select", options: ["Todos", "Entero", "Texto", "Booleano", "Decimal", "Fecha"] },
    ],
    successMsg: "Parámetros consultados correctamente.", errorEmpty: "Ingrese al menos un criterio de búsqueda.",
  },
  {
    id: "registrar-parametro", section: "params",
    title: "Registrar Parámetro",
    actor: "Administrador del Sistema",
    description: "Crea un nuevo valor configurable que modifica el comportamiento del sistema.",
    icon: <Settings size={28} />, iconBg: "text-yellow-600 bg-yellow-50",
    primaryBtn: "REGISTRAR PARÁMETRO", btnVariant: "gold",
    fields: [
      { name: "code", label: "Código del parámetro", type: "text", required: true, placeholder: "NOMBRE_SIN_ESPACIOS", helpText: "Use mayúsculas y guiones bajos. Ej: MAX_INTENTOS_LOGIN" },
      { name: "name", label: "Nombre del parámetro", type: "text", required: true, placeholder: "Nombre descriptivo" },
      { name: "description", label: "Descripción", type: "textarea", placeholder: "Propósito del parámetro", fullWidth: true },
      { name: "module", label: "Módulo de aplicación", type: "select", required: true, options: ["Seleccione...", "Autenticación", "Sesión", "Seguridad", "General"] },
      { name: "dataType", label: "Tipo de dato", type: "select", required: true, options: ["Seleccione...", "Entero", "Texto", "Booleano", "Decimal", "Fecha"] },
      { name: "value", label: "Valor del parámetro", type: "text", required: true, placeholder: "Valor inicial" },
      { name: "registrationDate", label: "Fecha de registro", type: "date", required: true, helpText: "La fecha se completa automáticamente.", readOnly: true },
      { name: "status", label: "Estado inicial", type: "select", required: true, options: ["Activo", "Inactivo"] },
      { name: "editable", label: "Parámetro editable por el administrador", type: "checkbox", fullWidth: true },
    ],
    successMsg: "Parámetro registrado satisfactoriamente.", errorEmpty: "Debe completar todos los campos obligatorios.",
  },
  {
    id: "actualizar-parametro", section: "params",
    title: "Actualizar Parámetro",
    actor: "Administrador del Sistema",
    description: "Modifica el valor de un parámetro de configuración existente en el sistema.",
    icon: <Edit size={28} />, iconBg: "text-yellow-600 bg-yellow-50",
    primaryBtn: "ACTUALIZAR PARÁMETRO", btnVariant: "gold",
    fields: [
      { name: "code", label: "Buscar código de parámetro", type: "text", required: true, placeholder: "Ej: MAX_INTENTOS_LOGIN", fullWidth: true },
      { name: "name", label: "Nombre del parámetro", type: "text", placeholder: "Se cargará automáticamente" },
      { name: "newValue", label: "Nuevo valor", type: "text", required: true, placeholder: "Ingrese el nuevo valor" },
      { name: "dataType", label: "Tipo de dato", type: "text", placeholder: "Se cargará automáticamente" },
      { name: "module", label: "Módulo", type: "text", placeholder: "Se cargará automáticamente" },
      { name: "changeDescription", label: "Descripción del cambio", type: "textarea", required: true, placeholder: "Justifique el motivo del cambio", fullWidth: true },
    ],
    successMsg: "Parámetro actualizado satisfactoriamente.", errorEmpty: "Debe completar los campos obligatorios.",
  },
  // AUDITORÍA Y REPORTES
  {
    id: "consultar-bitacora", section: "audit",
    title: "Consultar Bitácora",
    actor: "Administrador del Sistema / Director Administrativo",
    description: "Revisa y filtra las acciones administrativas registradas en la bitácora del sistema.",
    icon: <ClipboardList size={28} />, iconBg: "text-yellow-600 bg-yellow-50",
    primaryBtn: "CONSULTAR BITÁCORA", btnVariant: "navy",
    hasTable: true, tableData: MOCK_AUDIT,
    tableColumns: ["Fecha y hora", "Usuario", "Acción", "Módulo", "Entidad", "Resultado", "IP"],
    fields: [
      { name: "startDate", label: "Fecha inicial", type: "date", required: true },
      { name: "endDate", label: "Fecha final", type: "date", required: true },
    ],
    successMsg: "Bitácora consultada correctamente.", errorEmpty: "Debe completar el rango de fechas.",
  },
  {
    id: "exportar-reporte", section: "audit",
    title: "Exportar Reporte de Bitácora",
    actor: "Administrador del Sistema / Director Administrativo",
    description: "Genera y descarga un reporte de la bitácora en el formato seleccionado.",
    icon: <Download size={28} />, iconBg: "text-yellow-600 bg-yellow-50",
    primaryBtn: "EXPORTAR REPORTE", btnVariant: "gold",
    fields: [
      { name: "format", label: "Formato de exportación", type: "select", required: true, options: ["Seleccione formato...", "PDF", "XLSX"] },
      { name: "startDate", label: "Fecha inicial", type: "date", required: true },
      { name: "endDate", label: "Fecha final", type: "date", required: true },
      { name: "module", label: "Módulo a exportar", type: "select", options: ["Todos", "Gestión Usuarios", "Gestión Parámetros", "Auditoría"] },
      { name: "fullDetails", label: "Incluir detalles completos de cada evento", type: "checkbox", fullWidth: true },
    ],
    successMsg: "Reporte generado satisfactoriamente. El archivo está listo para descarga.", errorEmpty: "Debe completar los campos obligatorios.",
  },
];

// ── Shared Components ──────────────────────────────────────────────────────────

function TopBar({ onLogout }: { onLogout: () => void }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 h-20"
      style={{ backgroundColor: "#14284B", borderBottom: "3px solid #D4AF37" }}
    >
      <div className="flex items-center gap-4">
        <EpnShield size={44} />
        <div>
          <div className="text-white font-bold text-sm sm:text-lg leading-tight tracking-wide">
            Sistema de Seguridad — EPN
          </div>
          <div className="text-xs leading-tight hidden sm:block" style={{ color: "#D4AF37" }}>
            Plataforma Institucional de Seguridad
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-5">
        <div className="text-right hidden md:block">
          <div className="text-white font-semibold text-sm">Administrador del Sistema</div>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            <span className="text-xs" style={{ color: "#D8D1A7" }}>En línea</span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#B3262D", color: "white", letterSpacing: "0.06em" }}
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">SALIR</span>
        </button>
      </div>
    </header>
  );
}

function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: "#667085" }}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={11} />}
          <span
            className={i === items.length - 1 ? "font-semibold" : ""}
            style={{ color: i === items.length - 1 ? "#14284B" : "#667085" }}
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    "ACTIVO":      "bg-green-100 text-green-800 border-green-200",
    "INACTIVO":    "bg-gray-100 text-gray-600 border-gray-200",
    "BLOQUEADO":   "bg-red-100 text-red-700 border-red-200",
    "DADO DE BAJA":"bg-red-900/10 text-red-900 border-red-300",
    "PENDIENTE":   "bg-yellow-100 text-yellow-700 border-yellow-200",
    "CRÍTICO":     "bg-red-100 text-red-700 border-red-200",
    "EDITABLE":    "bg-blue-100 text-blue-700 border-blue-200",
    "ÉXITO":       "bg-green-100 text-green-800 border-green-200",
    "ERROR":       "bg-red-100 text-red-700 border-red-200",
    "ADVERTENCIA": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full border text-xs font-semibold tracking-wide ${map[value] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {value}
    </span>
  );
}

function AlertBox({ kind, message, onClose }: { kind: AlertKind; message: string; onClose: () => void }) {
  const cfg = {
    success: { wrap: "bg-green-50 border-green-400 text-green-800", icon: <CheckCircle size={18} className="text-green-600 shrink-0" /> },
    error:   { wrap: "bg-red-50 border-red-400 text-red-800",       icon: <XCircle size={18} className="text-red-600 shrink-0" /> },
    warning: { wrap: "bg-yellow-50 border-yellow-400 text-yellow-800", icon: <AlertTriangle size={18} className="text-yellow-600 shrink-0" /> },
  }[kind];
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 mb-5 ${cfg.wrap}`}>
      {cfg.icon}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity mt-0.5">
        <X size={14} />
      </button>
    </div>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(20,40,75,0.55)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-yellow-600" />
          </div>
          <h3 className="font-bold text-base" style={{ color: "#14284B" }}>Confirmación requerida</h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed" style={{ color: "#344054" }}>{message}</p>
        </div>
        <div className="px-6 pb-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg border transition-colors hover:bg-gray-50"
            style={{ borderColor: "#D0D5DD", color: "#344054" }}
          >
            CANCELAR
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 text-sm font-bold rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#14284B" }}
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ field, value, onChange }: { field: FieldDef; value: string; onChange: (v: string) => void }) {
  const [showPw, setShowPw] = useState(false);
  const base = `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors border-gray-200 ${
    field.readOnly
      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
      : "bg-white focus:border-[#14284B] focus:ring-2 focus:ring-[#14284B]/10"
  }`;

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={e => onChange(e.target.checked ? "true" : "false")}
          className="w-4 h-4 rounded accent-[#14284B]"
        />
        <span className="text-sm font-medium" style={{ color: "#14284B" }}>{field.label}</span>
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold" style={{ color: "#14284B" }}>
          {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea className={`${base} resize-none`} rows={3} placeholder={field.placeholder} value={value} onChange={e => onChange(e.target.value)} />
        {field.helpText && <p className="text-xs" style={{ color: "#667085" }}>{field.helpText}</p>}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold" style={{ color: "#14284B" }}>
          {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select className={`${base} cursor-pointer`} value={value} onChange={e => onChange(e.target.value)}>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {field.helpText && <p className="text-xs" style={{ color: "#667085" }}>{field.helpText}</p>}
      </div>
    );
  }
  if (field.type === "password") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold" style={{ color: "#14284B" }}>
          {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <input type={showPw ? "text" : "password"} className={`${base} pr-10`} placeholder={field.placeholder} value={value} onChange={e => onChange(e.target.value)} />
          <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80">
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
        {field.helpText && <p className="text-xs" style={{ color: "#667085" }}>{field.helpText}</p>}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: "#14284B" }}>
        {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={field.type}
        className={base}
        placeholder={field.placeholder}
        value={value}
        readOnly={field.readOnly}
        aria-readonly={field.readOnly}
        onChange={e => onChange(e.target.value)}
      />
      {field.helpText && <p className="text-xs" style={{ color: "#667085" }}>{field.helpText}</p>}
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Record<string, string>[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ backgroundColor: "#14284B" }}>
            {columns.map(col => (
              <th key={col} className="px-4 py-3 text-left font-semibold text-white text-xs tracking-wide whitespace-nowrap">{col}</th>
            ))}
            <th className="px-4 py-3 text-left font-semibold text-white text-xs tracking-wide">Acción</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-t border-gray-100 transition-colors hover:bg-blue-50/40 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
              {columns.map(col => (
                <td key={col} className="px-4 py-3 whitespace-nowrap" style={{ color: "#344054" }}>
                  {col === "Estado" || col === "Resultado" ? <StatusBadge value={row[col]} /> : row[col]}
                </td>
              ))}
              <td className="px-4 py-3">
                <button className="text-xs font-semibold px-3 py-1 rounded-md border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#14284B", color: "#14284B" }}>
                  VER DETALLE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [alert, setAlert] = useState<{ kind: AlertKind; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit() {
    if (!username.trim() || !password.trim()) {
      setAlert({ kind: "error", msg: "Debe completar los campos obligatorios." });
      return;
    }
    if (username === "admin" && password === "admin123") {
      setLoading(true);
      setAlert({ kind: "success", msg: "Bienvenido al Sistema de Seguridad EPN. Cargando módulos..." });
      setTimeout(() => { setAlert(null); setLoading(false); onLogin(); }, 1500);
    } else {
      setAlert({ kind: "error", msg: "Usuario o contraseña incorrectos. Verifique sus credenciales." });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="w-full max-w-sm">
        {alert && <AlertBox kind={alert.kind} message={alert.msg} onClose={() => setAlert(null)} />}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-8 text-center" style={{ backgroundColor: "#14284B", borderBottom: "4px solid #D4AF37" }}>
            <div className="flex justify-center mb-4">
              <EpnShield size={68} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">Sistema de Seguridad — EPN</h1>
            <p className="text-sm mt-1.5 font-medium" style={{ color: "#D4AF37" }}>Plataforma Institucional de Seguridad</p>
          </div>
          {/* Card body */}
          <div className="px-8 py-8">
            <p className="text-center text-sm mb-6" style={{ color: "#667085" }}>Ingrese sus credenciales institucionales para acceder al sistema.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#14284B" }}>
                  Nombre de usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Ingrese su nombre de usuario"
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#14284B] focus:ring-2 focus:ring-[#14284B]/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#14284B" }}>
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#14284B] focus:ring-2 focus:ring-[#14284B]/10 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 accent-[#14284B]" />
                  <span className="text-sm" style={{ color: "#344054" }}>Recordar sesión</span>
                </label>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full py-3 rounded-lg text-white font-bold text-sm tracking-widest transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#14284B" }}
            >
              {loading ? "INGRESANDO..." : "INGRESAR AL SISTEMA"}
            </button>
            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs" style={{ color: "#98A2B3" }}>
                Acceso de demostración: <strong className="text-[#14284B]">admin</strong> / <strong className="text-[#14284B]">admin123</strong>
              </p>
              <p className="text-xs font-semibold mt-2" style={{ color: "#B3262D" }}>
                Prototipo académico — Módulo de Administración del Sistema
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-5" style={{ color: "#98A2B3" }}>
          Escuela Politécnica Nacional © 2026 — Ingeniería de Software I · Periodo 2026-A
        </p>
      </div>
    </div>
  );
}

// ── MAIN PANEL ─────────────────────────────────────────────────────────────────

function MainPanelScreen({ onNavigate, onLogout }: { onNavigate: (s: Screen) => void; onLogout: () => void }) {
  const [unavailMsg, setUnavailMsg] = useState("");

  const modules = [
    {
      id: "none-1", label: "GESTIÓN DE PERSONAL INTERNO (GPI)",
      desc: "Gestión de estudiantes, docentes y personal administrativo de la EPN.",
      icon: <Users size={40} />, iconBg: "bg-blue-100 text-blue-700", available: false,
    },
    {
      id: "none-2", label: "PUNTOS DE CONTROL (PCO)",
      desc: "Administración de zonas, puntos físicos y dispositivos de seguridad.",
      icon: <MapPin size={40} />, iconBg: "bg-indigo-100 text-indigo-700", available: false,
    },
    {
      id: "none-3", label: "GESTIÓN DE PERSONAL EXTERNO (GPE)",
      desc: "Registro y administración de visitantes, proveedores y contratistas.",
      icon: <UserIcon size={40} />, iconBg: "bg-purple-100 text-purple-700", available: false,
    },
    {
      id: "none-4", label: "CONTROL DE ACCESOS (CAC)",
      desc: "Validación de ingresos, salidas, credenciales y autorizaciones de acceso.",
      icon: <Lock size={40} />, iconBg: "bg-orange-100 text-orange-700", available: false,
    },
    {
      id: "admin", label: "ADMINISTRACIÓN DEL SISTEMA (ADM)",
      desc: "Gestión de usuarios, parámetros, configuración, auditoría y reportes del sistema.",
      icon: <Settings size={40} />, iconBg: "bg-yellow-100 text-yellow-700", available: true,
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <TopBar onLogout={onLogout} />
      <main className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold" style={{ color: "#14284B" }}>Panel Principal del Sistema</h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#FDECEC", color: "#B3262D" }}>
              PROTOTIPO 2026-A
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#667085" }}>
            Seleccione un módulo para acceder. Solo el módulo de Administración del Sistema está disponible en este prototipo.
          </p>
        </div>
        {unavailMsg && (
          <div className="mb-6">
            <AlertBox kind="warning" message={unavailMsg} onClose={() => setUnavailMsg("")} />
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {modules.map(m => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl flex flex-col items-center text-center p-6 transition-all ${
                m.available
                  ? "shadow-md border-2 hover:shadow-lg"
                  : "shadow-sm border border-gray-100 hover:shadow-md"
              }`}
              style={m.available ? { borderColor: "#D4AF37" } : {}}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ${m.iconBg}`}>
                {m.icon}
              </div>
              {m.available && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full mb-2" style={{ backgroundColor: "#D4AF37", color: "#14284B" }}>
                  DISPONIBLE
                </span>
              )}
              <h3 className="font-bold text-xs tracking-wide mb-2 leading-tight" style={{ color: "#14284B" }}>
                {m.label}
              </h3>
              <p className="text-xs leading-relaxed mb-5 flex-1" style={{ color: "#667085" }}>{m.desc}</p>
              {m.available ? (
                <button
                  onClick={() => onNavigate("admin")}
                  className="w-full py-2.5 rounded-lg text-white text-xs font-bold tracking-wider transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#14284B" }}
                >
                  ACCEDER AL MÓDULO
                </button>
              ) : (
                <button
                  onClick={() => setUnavailMsg("Módulo no disponible en este prototipo.")}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold tracking-wide border cursor-not-allowed opacity-50"
                  style={{ borderColor: "#D0D5DD", color: "#667085" }}
                >
                  ACCEDER AL MÓDULO
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// ── ADMIN PANEL (all sections inline) ─────────────────────────────────────────

interface SectionConfig {
  key: Section;
  label: string;
  desc: string;
  accent: string;
  headerBg: string;
}

const SECTIONS: SectionConfig[] = [
  {
    key: "users", label: "Gestión de Usuarios",
    desc: "Permite administrar las cuentas que pueden iniciar sesión en el sistema. Los usuarios del sistema son diferentes de las personas que ingresan físicamente a la universidad.",
    accent: "#1E40AF", headerBg: "from-blue-900 to-blue-800",
  },
  {
    key: "params", label: "Gestión de Parámetros",
    desc: "Permite administrar valores configurables que modifican el comportamiento general del sistema sin cambiar el código fuente. Ejemplo: MAX_INTENTOS_LOGIN, TIEMPO_SESION_MIN, FORMATO_FECHA.",
    accent: "#92400E", headerBg: "from-yellow-900 to-yellow-800",
  },
  {
    key: "audit", label: "Auditoría y Reportes",
    desc: "Permite revisar las acciones administrativas registradas dentro del sistema, aplicar filtros avanzados y exportar reportes en múltiples formatos.",
    accent: "#78350F", headerBg: "from-amber-900 to-amber-800",
  },
];

function UCCard({ uc, onClick }: { uc: UCConfig; onClick: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${uc.iconBg}`}>
        {uc.icon}
      </div>
      <h4 className="font-bold text-sm mb-1 leading-snug" style={{ color: "#14284B" }}>{uc.title}</h4>
      <p className="text-xs leading-relaxed flex-1 mb-2" style={{ color: "#667085" }}>{uc.description}</p>
      <button
        onClick={onClick}
        className="w-full py-2 rounded-lg text-white text-xs font-bold tracking-wider transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#14284B" }}
      >
        ACCEDER
      </button>
    </div>
  );
}

function AdminPanelScreen({ onNavigate, onBack, onLogout }: {
  onNavigate: (id: string) => void;
  onBack: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <TopBar onLogout={onLogout} />
      <main className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <Breadcrumb items={["Inicio", "Administración del Sistema"]} />
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#14284B" }}>Administración del Sistema</h2>
            <p className="text-sm mt-1" style={{ color: "#667085" }}>
              Gestión de usuarios, parámetros y auditoría del Sistema de Seguridad EPN
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50 shrink-0 md:ml-6 self-start"
            style={{ borderColor: "#D0D5DD", color: "#344054" }}
          >
            <ArrowLeft size={14} />
            VOLVER AL PANEL PRINCIPAL
          </button>
        </div>

        {/* Quick-nav anchors */}
        <div className="flex flex-wrap gap-3 mb-8">
          {SECTIONS.map(s => (
            <a key={s.key} href={`#section-${s.key}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border"
              style={{ borderColor: "#14284B", color: "#14284B", backgroundColor: "white" }}
            >
              <ChevronRight size={14} />
              {s.label}
            </a>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {SECTIONS.map(section => {
            const cards = USE_CASES
              .filter(u => u.section === section.key)
              .sort((a, b) => Number(b.title.startsWith("Registrar")) - Number(a.title.startsWith("Registrar")));
            const gridCols = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
            return (
              <div key={section.key} id={`section-${section.key}`}>
                {/* Section header bar */}
                <div
                  className="rounded-xl px-6 py-5 mb-5"
                  style={{ backgroundColor: "#14284B", borderLeft: "5px solid #D4AF37" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white mb-1">{section.label}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: "#D8D1A7" }}>{section.desc}</p>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shrink-0 mt-0.5"
                      style={{ backgroundColor: "#D4AF37", color: "#14284B" }}
                    >
                      {cards.length} casos de uso
                    </span>
                  </div>
                </div>
                {/* Cards grid */}
                <div className={`grid gap-4 ${gridCols}`}>
                  {cards.map(uc => (
                    <UCCard key={uc.id} uc={uc} onClick={() => onNavigate(uc.id)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ── USE CASE FORM SCREEN ───────────────────────────────────────────────────────

function UseCaseFormScreen({ ucId, onBack, onLogout }: {
  ucId: string;
  onBack: () => void;
  onLogout: () => void;
}) {
  const uc = USE_CASES.find(u => u.id === ucId)!;
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (ucId !== "registrar-parametro") return {};
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return { registrationDate: `${year}-${month}-${day}` };
  });
  const [alert, setAlert] = useState<{ kind: AlertKind; msg: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sectionLabels: Record<Section, string> = {
    users:  "Gestión de Usuarios",
    params: "Gestión de Parámetros",
    audit:  "Auditoría y Reportes",
  };

  const btnCls: Record<BtnVariant, string> = {
    navy:  "bg-[#14284B] text-white hover:bg-[#0d1e38]",
    red:   "bg-[#B3262D] text-white hover:bg-[#8a1c22]",
    green: "bg-[#2E7D32] text-white hover:bg-[#1e5c21]",
    gold:  "bg-[#D4AF37] text-[#14284B] hover:bg-[#b89930]",
  };

  function setField(name: string, val: string) {
    setValues(prev => ({ ...prev, [name]: val }));
  }

  function allRequiredFilled() {
    return uc.fields
      .filter(f => f.required)
      .every(f => {
        const v = (values[f.name] || "").trim();
        return v !== "" && !v.startsWith("Seleccione");
      });
  }

  function handleSubmit() {
    if (!allRequiredFilled()) {
      setAlert({ kind: "error", msg: uc.errorEmpty });
      return;
    }
    if (uc.hasModal) {
      setShowModal(true);
    } else {
      execute();
    }
  }

  function execute() {
    setShowModal(false);
    setAlert({ kind: "success", msg: uc.successMsg });
    if (uc.hasTable) setShowTable(true);
  }

  // Advanced filter fields shown inside consultar-bitacora
  const advFields: FieldDef[] = [
    { name: "adv_user", label: "Usuario", type: "text", placeholder: "Nombre de usuario o correo" },
    { name: "adv_module", label: "Módulo", type: "select", options: ["Todos", "Gestión Usuarios", "Gestión Parámetros", "Auditoría"] },
    { name: "adv_action", label: "Acción realizada", type: "select", options: ["Todas", "Registrar", "Actualizar", "Resetear contraseña", "Asignar rol", "Revocar rol", "Bloquear", "Desbloquear", "Activar", "Dar de baja", "Consultar", "Exportar"] },
    { name: "adv_entity", label: "Entidad afectada", type: "text", placeholder: "Ej: Usuario, Parámetro" },
    { name: "adv_result", label: "Resultado", type: "select", options: ["Todos", "Éxito", "Error", "Advertencia"] },
    { name: "adv_ip", label: "Dirección IP de origen", type: "text", placeholder: "Ej: 192.168.1.10" },
  ];

  const activeAdvancedFilters = advFields.filter(field => {
    const value = (values[field.name] || "").trim();
    return value !== "" && value !== "Todos" && value !== "Todas";
  }).length;

  function applyAdvancedFilters() {
    if (!allRequiredFilled()) {
      setAlert({ kind: "error", msg: uc.errorEmpty });
      return;
    }
    setShowTable(true);
    setAlert({
      kind: "success",
      msg: activeAdvancedFilters > 0
        ? `Filtros avanzados aplicados correctamente (${activeAdvancedFilters} activos).`
        : "Consulta realizada con el rango de fechas seleccionado.",
    });
  }

  function clearAdvancedFilters() {
    setValues(previous => {
      const next = { ...previous };
      advFields.forEach(field => delete next[field.name]);
      return next;
    });
    setAlert(null);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <TopBar onLogout={onLogout} />
      {showModal && (
        <ConfirmModal
          message={uc.modalMessage!}
          onConfirm={execute}
          onCancel={() => setShowModal(false)}
        />
      )}
      <main className="pt-28 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <Breadcrumb items={["Inicio", "Administración del Sistema", sectionLabels[uc.section], uc.title]} />

        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${uc.iconBg}`}>
              {uc.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight" style={{ color: "#14284B" }}>{uc.title}</h2>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50 shrink-0 md:ml-6 self-start"
            style={{ borderColor: "#D0D5DD", color: "#344054" }}
          >
            <ArrowLeft size={14} />
            VOLVER AL PANEL DEL MÓDULO
          </button>
        </div>

        {/* Alert */}
        {alert && <AlertBox kind={alert.kind} message={alert.msg} onClose={() => setAlert(null)} />}

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
          <div className="mb-6 pb-5 border-b border-gray-100">
            <h3 className="font-bold text-base" style={{ color: "#14284B" }}>{uc.title}</h3>
            <p className="text-sm mt-1" style={{ color: "#667085" }}>{uc.description}</p>
            <p className="text-xs mt-1" style={{ color: "#98A2B3" }}>
              Los campos marcados con <span className="text-red-500 font-bold">*</span> son obligatorios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {uc.fields.map(field => (
              <div key={field.name} className={field.fullWidth ? "md:col-span-2" : ""}>
                <FormField field={field} value={values[field.name] || ""} onChange={v => setField(field.name, v)} />
              </div>
            ))}
          </div>

          {/* Advanced filters collapsible for consultar-bitacora */}
          {uc.id === "consultar-bitacora" && (
            <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden bg-gray-50/60">
              <button
                type="button"
                onClick={() => setShowAdvanced(s => !s)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-bold transition-colors hover:bg-gray-100/70"
                style={{ color: "#14284B" }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                    <Filter size={15} />
                  </span>
                  <span className="text-left">
                    <span className="block">FILTROS AVANZADOS</span>
                    <span className="block text-xs font-normal mt-0.5" style={{ color: "#667085" }}>
                      Acote la búsqueda por usuario, acción, resultado, entidad o IP
                    </span>
                  </span>
                  {activeAdvancedFilters > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "#D4AF37", color: "#14284B" }}>
                      {activeAdvancedFilters} activos
                    </span>
                  )}
                </span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showAdvanced && (
                <div className="px-5 pb-5 border-t border-gray-200 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                    {advFields.map(f => (
                      <FormField key={f.name} field={f} value={values[f.name] || ""} onChange={v => setField(f.name, v)} />
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={applyAdvancedFilters}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#14284B" }}
                    >
                      <Filter size={13} />
                      APLICAR FILTROS
                    </button>
                    <button
                      type="button"
                      onClick={clearAdvancedFilters}
                      className="px-5 py-2.5 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50"
                      style={{ borderColor: "#D0D5DD", color: "#344054" }}
                    >
                      LIMPIAR FILTROS
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-7 pt-5 border-t border-gray-100">
            <button
              onClick={handleSubmit}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide transition-opacity ${btnCls[uc.btnVariant]}`}
            >
              {uc.primaryBtn}
            </button>
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50"
              style={{ borderColor: "#D0D5DD", color: "#344054" }}
            >
              CANCELAR
            </button>
          </div>
        </div>

        {/* Result table */}
        {showTable && uc.hasTable && uc.tableData && uc.tableColumns && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-sm" style={{ color: "#14284B" }}>
                Resultados de la consulta
                <span className="ml-2 text-xs font-normal" style={{ color: "#667085" }}>
                  {uc.tableData.length} registros encontrados
                </span>
              </h4>
              <button
                onClick={() => setAlert({ kind: "success", msg: "Reporte exportado satisfactoriamente." })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#D4AF37", color: "#14284B" }}
              >
                <FileText size={12} />
                EXPORTAR VISTA
              </button>
            </div>
            <DataTable columns={uc.tableColumns} rows={uc.tableData} />
          </div>
        )}
      </main>
    </div>
  );
}

// ── APP ROUTER ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [history, setHistory] = useState<Screen[]>([]);

  function go(s: Screen) {
    setHistory(h => [...h, screen]);
    setScreen(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    const h = [...history];
    const prev = h.pop() ?? "login";
    setHistory(h);
    setScreen(prev);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function logout() {
    setScreen("login");
    setHistory([]);
  }

  const ucMatch = USE_CASES.find(u => u.id === screen);

  if (screen === "login") return <LoginScreen onLogin={() => go("main")} />;
  if (screen === "main")  return <MainPanelScreen onNavigate={go} onLogout={logout} />;
  if (screen === "admin") return <AdminPanelScreen onNavigate={go} onBack={back} onLogout={logout} />;
  if (ucMatch)            return <UseCaseFormScreen ucId={screen} onBack={back} onLogout={logout} />;

  return <LoginScreen onLogin={() => go("main")} />;
}
