import { state } from "./state.js";

const translations = {
  en: {
    // index.html
    switch_to_meme: "switch to MemeBank!",
    switch_to_quote: "switch to QuoteBank!",

    // feed.js
    add_quote: "+ Add Quote",
    add_meme: "+ Add Meme",
    sort_new: "New",
    sort_top: "Top",
    sort_old: "Old",
    sort_random: "Random",
    search_placeholder: "Search Quotebank",
    search_placeholder_meme: "Search Memebank",
    load_more: "Load more",
    no_quotes: "No quotes yet",
    no_memes: "No memes yet",
    be_first: "Be the first to post one!",

    // cards.js
    sure: "Sure?",
    deleted: "Deleted!",
    by: "by",

    // modals.js
    post_quote: "Post a Quote",
    quote_label: "Quote",
    quote_placeholder: "Enter the quote...",
    who_said_it: "Who said it?",
    author_placeholder: "e.g. Albert Einstein",
    when_said: "When was it said?",
    date_placeholder: "e.g. June 2023, last Tuesday",
    btn_post_quote: "Post Quote",
    quote_posted: "Quote posted!",
    post_meme: "Post a Meme",
    image_label: "Image",
    choose_image: "📁 Choose an image or drag & drop",
    caption_label: "Caption",
    caption_placeholder: "Add a caption (optional)",
    credited_to: "Credited to",
    credited_placeholder: "Original author (optional)",
    btn_post_meme: "Post Meme",
    meme_posted: "Meme posted!",
    please_select_image: "Please select an image",

    // pages.js
    your_profile: "Your Profile",
    loading: "Loading...",
    change_password: "Change Password",
    current_password: "Current Password",
    new_password: "New Password",
    update_password: "Update Password",
    password_changed: "Password changed!",
    danger_zone: "Danger Zone",
    delete_warning: "Permanently delete your account and all associated data. This cannot be undone.",
    delete_account: "Delete My Account",
    delete_confirm: "Are you sure? Click again to confirm.",
    account_deleted: "Account deleted",
    admin_panel: "⚙️ Admin Panel",
    loading_users: "Loading users...",
    no_users: "No users found.",
    joined: "Joined",
    quotes_count: "quotes",
    memes_count: "memes",
    admin_lowercase: "admin",
    admin_uppercase: "ADMIN",
    reset_pw: "🔑 Reset PW",
    remove_admin: "👤 Remove Admin",
    make_admin: "🛡️ Make Admin",
    delete_btn: "🗑️ Delete",
    new_pw_placeholder: "New password",
    save: "Save",
    pw_reset_success: "Password reset successfully",
    role_updated: "Role updated",
    user_deleted: "User deleted",
    admin_required: "Admin access required",

    // auth.js
    logout: "Logout",
    logged_out: "Logged out",
    log_in: "Log in",
    sign_up: "Sign up",
    access: "Access",
    welcome_back: "Welcome back",
    create_account: "Create an account",
    login_subtitle: "Log in to start posting",
    signup_subtitle: "Sign up to join the community",
    username: "Username",
    username_placeholder: "Enter your username",
    password: "Password",
    password_placeholder: "Enter your password",
    no_account: "Don't have an account?",
    has_account: "Already have an account?",
    welcome_back_toast: "Welcome back!",
    welcome_guest: "Welcome!",
    account_created: "Account created!",

    // utils.js timeAgo
    time_just_now: "just now",
    time_m: "m",
    time_h: "h",
    time_d: "d",
    time_mo: "mo",
    time_y: "y"
  },
  es: {
    // index.html
    switch_to_meme: "¡cambiar a MemeBank!",
    switch_to_quote: "¡cambiar a QuoteBank!",

    // feed.js
    add_quote: "+ Añadir Cita",
    add_meme: "+ Añadir Meme",
    sort_new: "Nuevos",
    sort_top: "Top",
    sort_old: "Antiguos",
    sort_random: "Aleatorio",
    search_placeholder: "Buscar en Quotebank",
    search_placeholder_meme: "Buscar en Memebank",
    load_more: "Cargar más",
    no_quotes: "No hay citas todavía",
    no_memes: "No hay memes todavía",
    be_first: "¡Sé el primero en publicar!",

    // cards.js
    sure: "¿Seguro?",
    deleted: "¡Eliminado!",
    by: "por",

    // modals.js
    post_quote: "Publicar una Cita",
    quote_label: "Cita",
    quote_placeholder: "Escribe la cita...",
    who_said_it: "¿Quién lo dijo?",
    author_placeholder: "ej. Albert Einstein",
    when_said: "¿Cuándo se dijo?",
    date_placeholder: "ej. Junio 2023, el martes pasado",
    btn_post_quote: "Publicar Cita",
    quote_posted: "¡Cita publicada!",
    post_meme: "Publicar un Meme",
    image_label: "Imagen",
    choose_image: "📁 Elige una imagen o arrástrala aquí",
    caption_label: "Título",
    caption_placeholder: "Añade un título (opcional)",
    credited_to: "Acreditado a",
    credited_placeholder: "Autor original (opcional)",
    btn_post_meme: "Publicar Meme",
    meme_posted: "¡Meme publicado!",
    please_select_image: "Por favor, selecciona una imagen",

    // pages.js
    your_profile: "Tu Perfil",
    loading: "Cargando...",
    change_password: "Cambiar Contraseña",
    current_password: "Contraseña Actual",
    new_password: "Nueva Contraseña",
    update_password: "Actualizar Contraseña",
    password_changed: "¡Contraseña cambiada!",
    danger_zone: "Zona de Peligro",
    delete_warning: "Elimina permanentemente tu cuenta y todos los datos asociados. Esto no se puede deshacer.",
    delete_account: "Eliminar Mi Cuenta",
    delete_confirm: "¿Estás seguro? Haz clic otra vez para confirmar.",
    account_deleted: "Cuenta eliminada",
    admin_panel: "⚙️ Panel de Administración",
    loading_users: "Cargando usuarios...",
    no_users: "No se encontraron usuarios.",
    joined: "Unido",
    quotes_count: "citas",
    memes_count: "memes",
    admin_lowercase: "admin",
    admin_uppercase: "ADMIN",
    reset_pw: "🔑 Rest. Contraseña",
    remove_admin: "👤 Quitar Admin",
    make_admin: "🛡️ Hacer Admin",
    delete_btn: "🗑️ Eliminar",
    new_pw_placeholder: "Nueva contraseña",
    save: "Guardar",
    pw_reset_success: "Contraseña restablecida con éxito",
    role_updated: "Rol actualizado",
    user_deleted: "Usuario eliminado",
    admin_required: "Se requiere acceso de administrador",

    // auth.js
    logout: "Cerrar sesión",
    logged_out: "Sesión cerrada",
    log_in: "Iniciar sesión",
    sign_up: "Registrarse",
    access: "Acceder",
    welcome_back: "Bienvenido de nuevo",
    create_account: "Crear una cuenta",
    login_subtitle: "Inicia sesión para empezar a publicar",
    signup_subtitle: "Regístrate para unirte a la comunidad",
    username: "Usuario",
    username_placeholder: "Introduce tu usuario",
    password: "Contraseña",
    password_placeholder: "Introduce tu contraseña",
    no_account: "¿No tienes una cuenta?",
    has_account: "¿Ya tienes una cuenta?",
    welcome_back_toast: "¡Bienvenido de nuevo!",
    welcome_guest: "¡Bienvenido!",
    account_created: "¡Cuenta creada!",

    // utils.js timeAgo
    time_just_now: "ahora mismo",
    time_m: "m",
    time_h: "h",
    time_d: "d",
    time_mo: "meses",
    time_y: "a"
  },
  ca: {
    // index.html
    switch_to_meme: "canviar a MemeBank!",
    switch_to_quote: "canviar a QuoteBank!",

    // feed.js
    add_quote: "+ Afegir Cita",
    add_meme: "+ Afegir Mem",
    sort_new: "Nous",
    sort_top: "Top",
    sort_old: "Antics",
    sort_random: "Aleatori",
    search_placeholder: "Cercar a Quotebank",
    search_placeholder_meme: "Cercar a Memebank",
    load_more: "Carregar més",
    no_quotes: "Encara no hi ha cites",
    no_memes: "Encara no hi ha mems",
    be_first: "Sigues el primer en publicar-ne un!",

    // cards.js
    sure: "Segur?",
    deleted: "Eliminat!",
    by: "per",

    // modals.js
    post_quote: "Publicar una Cita",
    quote_label: "Cita",
    quote_placeholder: "Escriu la cita...",
    who_said_it: "Qui ho va dir?",
    author_placeholder: "ex. Albert Einstein",
    when_said: "Quan es va dir?",
    date_placeholder: "ex. Juny 2023, dimarts passat",
    btn_post_quote: "Publicar Cita",
    quote_posted: "Cita publicada!",
    post_meme: "Publicar un Mem",
    image_label: "Imatge",
    choose_image: "📁 Tria una imatge o arrossega-la aquí",
    caption_label: "Títol",
    caption_placeholder: "Afegeix un títol (opcional)",
    credited_to: "Acreditat a",
    credited_placeholder: "Autor original (opcional)",
    btn_post_meme: "Publicar Mem",
    meme_posted: "Mem publicat!",
    please_select_image: "Si us plau, selecciona una imatge",

    // pages.js
    your_profile: "El Teu Perfil",
    loading: "Carregant...",
    change_password: "Canviar Contrasenya",
    current_password: "Contrasenya Actual",
    new_password: "Nova Contrasenya",
    update_password: "Actualitzar Contrasenya",
    password_changed: "Contrasenya canviada!",
    danger_zone: "Zona de Perill",
    delete_warning: "Elimina permanentment el teu compte i totes les dades associades. Això no es pot desfer.",
    delete_account: "Eliminar El Meu Compte",
    delete_confirm: "Estàs segur? Fes clic de nou per confirmar.",
    account_deleted: "Compte eliminat",
    admin_panel: "⚙️ Tauler d'Administració",
    loading_users: "Carregant usuaris...",
    no_users: "No s'han trobat usuaris.",
    joined: "Unit",
    quotes_count: "cites",
    memes_count: "mems",
    admin_lowercase: "admin",
    admin_uppercase: "ADMIN",
    reset_pw: "🔑 Rest. Contrasenya",
    remove_admin: "👤 Treure Admin",
    make_admin: "🛡️ Fer Admin",
    delete_btn: "🗑️ Eliminar",
    new_pw_placeholder: "Nova contrasenya",
    save: "Desar",
    pw_reset_success: "Contrasenya restablerta amb èxit",
    role_updated: "Rol actualitzat",
    user_deleted: "Usuari eliminat",
    admin_required: "Es requereix accés d'administrador",

    // auth.js
    logout: "Tancar sessió",
    logged_out: "Sessió tancada",
    log_in: "Iniciar sessió",
    sign_up: "Registrar-se",
    access: "Accedir",
    welcome_back: "Benvingut de nou",
    create_account: "Crear un compte",
    login_subtitle: "Inicia sessió per començar a publicar",
    signup_subtitle: "Registra't per unir-te a la comunitat",
    username: "Usuari",
    username_placeholder: "Introdueix el teu usuari",
    password: "Contrasenya",
    password_placeholder: "Introdueix la teva contrasenya",
    no_account: "No tens un compte?",
    has_account: "Ja tens un compte?",
    welcome_back_toast: "Benvingut de nou!",
    welcome_guest: "Benvingut!",
    account_created: "Compte creat!",

    // utils.js timeAgo
    time_just_now: "ara mateix",
    time_m: "m",
    time_h: "h",
    time_d: "d",
    time_mo: "mesos",
    time_y: "a"
  }
};

export function t(key) {
  const lang = state.lang || "en";
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  return translations["en"][key] || key;
}

export function initI18n() {
  const savedLang = localStorage.getItem("qb_lang");
  if (savedLang && translations[savedLang]) {
    state.lang = savedLang;
  } else {
    const browserLang = navigator.language || navigator.userLanguage || "en";
    if (browserLang.startsWith("es")) state.lang = "es";
    else if (browserLang.startsWith("ca")) state.lang = "ca";
    else state.lang = "en";
  }
}

export function updateStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
}
