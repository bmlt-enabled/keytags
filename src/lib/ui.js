/**
 * UI string catalog and language helpers.
 *
 * The clean-time *sentence* is localized separately (see `label.js` + the NACC
 * language packs in `lang/`). This module localizes everything else — the
 * builder form, card/display chrome, and milestone names — so the whole
 * experience follows one language.
 *
 * English is authoritative; every other language falls back to English
 * per-key, so a missing translation shows English rather than a blank. The
 * non-English strings are a best effort and should be reviewed by native NA
 * members, especially fellowship-specific terms ("clean time", "Just for
 * Today", keytag/llavero/ficha/portachiavi).
 */
import { sprintf } from './sprintf.js';

const UI = {
    en: {
        title: 'Send a {Virtual} Keytag',
        intro: "Celebrate someone's clean time. Nothing is stored — the card lives entirely in the link you share.",
        editing_note: 'Editing this keytag — change anything and share a new link.',
        field_recipient: "Recipient's name or initial",
        ph_recipient: 'e.g. Sam R.',
        field_milestone: 'Milestone',
        help_milestone: 'The clean-time tag to celebrate. A clean date below can pick it for you.',
        field_cleandate: 'Clean date',
        optional: '(optional)',
        help_cleandate:
            'Adds exact clean time to the card (e.g. “This is 1 year”) and auto-selects the matching milestone.',
        field_message: 'Personal message',
        ph_message: 'Just for Today',
        field_from: 'From',
        ph_from: 'Your name',
        field_language: 'Language',
        toggle_special: 'Show specialty long-term tags',
        help_special:
            'Adds commemorative 5-, 10-, 15-, 25- and 30-year tags to the milestone list above.',
        toggle_official: 'Use official NA tag faces',
        help_official:
            'Puts the official NA logo on the front of the tag. Leave off (the default) for a plain face.',
        note_trademark:
            'The official NA name and symbol are NAWS registered trademarks. Only enable this if your service body is authorized to use them; otherwise leave it off for generic faces.',
        action_copy: 'Copy share link',
        action_copied: 'Copied!',
        action_download: 'Download image',
        action_preparing: 'Preparing…',
        action_display: 'Open display view',
        action_startover: 'Start over',
        copy_error: "Couldn't copy automatically — select the link below and copy it:",
        fallback_label: 'Share link (copy manually)',
        download_error: "The image couldn't be created. Please try again.",
        hint_flip: 'Tap the tag to flip it.',
        aria_form: 'Create a keytag',
        aria_preview: 'Preview',
        aria_flip: '{headline} keytag — activate to flip',
        label_for: 'For',
        card_edit: 'Edit this keytag',
        card_fullscreen: 'Open full screen',
        card_create: 'Create your own →',
        display_exit: 'Exit display view',
        ms_welcome: 'Welcome',
        ms_30d: '30 Days',
        ms_60d: '60 Days',
        ms_90d: '90 Days',
        ms_6m: '6 Months',
        ms_9m: '9 Months',
        ms_1y: '1 Year',
        ms_18m: '18 Months',
        ms_years: '%d Years',
        ms_cleantime: 'Clean Time',
    },

    es: {
        title: 'Envía un llavero {virtual}',
        intro: 'Celebra el tiempo limpio de alguien. No se guarda nada — la tarjeta vive por completo en el enlace que compartes.',
        editing_note: 'Editando este llavero — cambia lo que quieras y comparte un nuevo enlace.',
        field_recipient: 'Nombre o inicial del destinatario',
        ph_recipient: 'p. ej. Sam R.',
        field_milestone: 'Hito',
        help_milestone:
            'El llavero de tiempo limpio a celebrar. Una fecha de inicio abajo puede elegirlo por ti.',
        field_cleandate: 'Fecha de inicio',
        optional: '(opcional)',
        help_cleandate:
            'Añade el tiempo limpio exacto a la tarjeta (p. ej. «Esto suma un total de 1 año») y selecciona el hito correspondiente.',
        field_message: 'Mensaje personal',
        ph_message: 'Solo por hoy',
        field_from: 'De',
        ph_from: 'Tu nombre',
        field_language: 'Idioma',
        toggle_special: 'Mostrar llaveros especiales de largo plazo',
        help_special:
            'Añade llaveros conmemorativos de 5, 10, 15, 25 y 30 años a la lista de arriba.',
        toggle_official: 'Usar las caras oficiales de los llaveros NA',
        help_official:
            'Pone el logo oficial de NA en el frente del llavero. Déjalo desactivado (por defecto) para una cara genérica.',
        note_trademark:
            'El nombre y el símbolo oficiales de NA son marcas registradas de NAWS. Actívalo solo si tu comité de servicio está autorizado a usarlos; de lo contrario, déjalo desactivado para caras genéricas.',
        action_copy: 'Copiar enlace',
        action_copied: '¡Copiado!',
        action_download: 'Descargar imagen',
        action_preparing: 'Preparando…',
        action_display: 'Abrir vista de pantalla',
        action_startover: 'Empezar de nuevo',
        copy_error: 'No se pudo copiar automáticamente — selecciona el enlace de abajo y cópialo:',
        fallback_label: 'Enlace para compartir (copiar manualmente)',
        download_error: 'No se pudo crear la imagen. Inténtalo de nuevo.',
        hint_flip: 'Toca el llavero para girarlo.',
        aria_form: 'Crear un llavero',
        aria_preview: 'Vista previa',
        aria_flip: 'Llavero de {headline} — activa para girar',
        label_for: 'Para',
        card_edit: 'Editar este llavero',
        card_fullscreen: 'Abrir en pantalla completa',
        card_create: 'Crea el tuyo →',
        display_exit: 'Salir de la vista',
        ms_welcome: 'Bienvenido',
        ms_30d: '30 Días',
        ms_60d: '60 Días',
        ms_90d: '90 Días',
        ms_6m: '6 Meses',
        ms_9m: '9 Meses',
        ms_1y: '1 Año',
        ms_18m: '18 Meses',
        ms_years: '%d Años',
        ms_cleantime: 'Tiempo Limpio',
    },

    pt: {
        title: 'Envie uma ficha {virtual}',
        intro: 'Celebre o tempo limpo de alguém. Nada é armazenado — o cartão vive inteiramente no link que você compartilha.',
        editing_note: 'Editando esta ficha — mude o que quiser e compartilhe um novo link.',
        field_recipient: 'Nome ou inicial do destinatário',
        ph_recipient: 'ex.: Sam R.',
        field_milestone: 'Marco',
        help_milestone:
            'A ficha de tempo limpo a celebrar. Uma data abaixo pode escolhê-la para você.',
        field_cleandate: 'Data que ficou limpo',
        optional: '(opcional)',
        help_cleandate:
            'Adiciona o tempo limpo exato ao cartão (ex.: “Que é 1 ano”) e seleciona o marco correspondente.',
        field_message: 'Mensagem pessoal',
        ph_message: 'Só por hoje',
        field_from: 'De',
        ph_from: 'Seu nome',
        field_language: 'Idioma',
        toggle_special: 'Mostrar fichas especiais de longo prazo',
        help_special: 'Adiciona fichas comemorativas de 5, 10, 15, 25 e 30 anos à lista acima.',
        toggle_official: 'Usar as faces oficiais das fichas NA',
        help_official:
            'Coloca o logo oficial de NA na frente da ficha. Deixe desativado (padrão) para uma face comum.',
        note_trademark:
            'O nome e o símbolo oficiais de NA são marcas registradas da NAWS. Ative apenas se o seu corpo de serviço estiver autorizado a usá-los; caso contrário, deixe desativado para faces genéricas.',
        action_copy: 'Copiar link',
        action_copied: 'Copiado!',
        action_download: 'Baixar imagem',
        action_preparing: 'Preparando…',
        action_display: 'Abrir visualização',
        action_startover: 'Começar de novo',
        copy_error: 'Não foi possível copiar automaticamente — selecione o link abaixo e copie:',
        fallback_label: 'Link para compartilhar (copiar manualmente)',
        download_error: 'Não foi possível criar a imagem. Tente novamente.',
        hint_flip: 'Toque na ficha para virá-la.',
        aria_form: 'Criar uma ficha',
        aria_preview: 'Pré-visualização',
        aria_flip: 'Ficha de {headline} — ative para virar',
        label_for: 'Para',
        card_edit: 'Editar esta ficha',
        card_fullscreen: 'Abrir em tela cheia',
        card_create: 'Crie a sua →',
        display_exit: 'Sair da visualização',
        ms_welcome: 'Bem-vindo',
        ms_30d: '30 Dias',
        ms_60d: '60 Dias',
        ms_90d: '90 Dias',
        ms_6m: '6 Meses',
        ms_9m: '9 Meses',
        ms_1y: '1 Ano',
        ms_18m: '18 Meses',
        ms_years: '%d Anos',
        ms_cleantime: 'Tempo Limpo',
    },

    it: {
        title: 'Invia un portachiavi {virtuale}',
        intro: 'Celebra il tempo di pulizia di qualcuno. Non viene memorizzato nulla — la card vive interamente nel link che condividi.',
        editing_note:
            'Modifica di questo portachiavi — cambia ciò che vuoi e condividi un nuovo link.',
        field_recipient: 'Nome o iniziale del destinatario',
        ph_recipient: 'es. Sam R.',
        field_milestone: 'Traguardo',
        help_milestone:
            'Il portachiavi del tempo di pulizia da celebrare. Una data di pulizia qui sotto può sceglierlo per te.',
        field_cleandate: 'Data di pulizia',
        optional: '(facoltativo)',
        help_cleandate:
            'Aggiunge il tempo di pulizia esatto alla card (es. “1 anno”) e seleziona il traguardo corrispondente.',
        field_message: 'Messaggio personale',
        ph_message: 'Solo per oggi',
        field_from: 'Da',
        ph_from: 'Il tuo nome',
        field_language: 'Lingua',
        toggle_special: 'Mostra i portachiavi speciali a lungo termine',
        help_special:
            'Aggiunge i portachiavi commemorativi da 5, 10, 15, 25 e 30 anni alla lista qui sopra.',
        toggle_official: 'Usa le facce ufficiali dei portachiavi NA',
        help_official:
            'Mette il logo ufficiale di NA sul fronte del portachiavi. Lascialo disattivato (predefinito) per una faccia generica.',
        note_trademark:
            'Il nome e il simbolo ufficiali di NA sono marchi registrati di NAWS. Attivalo solo se il tuo organo di servizio è autorizzato a usarli; altrimenti lascialo disattivato per le facce generiche.',
        action_copy: 'Copia link',
        action_copied: 'Copiato!',
        action_download: 'Scarica immagine',
        action_preparing: 'Preparazione…',
        action_display: 'Apri visualizzazione',
        action_startover: 'Ricomincia',
        copy_error: 'Impossibile copiare automaticamente — seleziona il link qui sotto e copialo:',
        fallback_label: 'Link da condividere (copia manualmente)',
        download_error: 'Impossibile creare l’immagine. Riprova.',
        hint_flip: 'Tocca il portachiavi per girarlo.',
        aria_form: 'Crea un portachiavi',
        aria_preview: 'Anteprima',
        aria_flip: 'Portachiavi di {headline} — attiva per girare',
        label_for: 'Per',
        card_edit: 'Modifica questo portachiavi',
        card_fullscreen: 'Apri a schermo intero',
        card_create: 'Crea il tuo →',
        display_exit: 'Esci dalla visualizzazione',
        ms_welcome: 'Benvenuto',
        ms_30d: '30 Giorni',
        ms_60d: '60 Giorni',
        ms_90d: '90 Giorni',
        ms_6m: '6 Mesi',
        ms_9m: '9 Mesi',
        ms_1y: '1 Anno',
        ms_18m: '18 Mesi',
        ms_years: '%d Anni',
        ms_cleantime: 'Tempo di Pulizia',
    },

    'zh-Hans': {
        title: '发送一个{虚拟}钥匙扣',
        intro: '庆祝某人的清醒时间。不存储任何内容——卡片完全存在于你分享的链接中。',
        editing_note: '正在编辑此钥匙扣——随意修改并分享新链接。',
        field_recipient: '接收者的姓名或缩写',
        ph_recipient: '例如 Sam R.',
        field_milestone: '里程碑',
        help_milestone: '要庆祝的清醒时间钥匙扣。下方的清醒日期可以为你自动选择。',
        field_cleandate: '清醒日期',
        optional: '（可选）',
        help_cleandate: '为卡片添加确切的清醒时间（例如“这是一年了”）并自动选择对应的里程碑。',
        field_message: '个人留言',
        ph_message: '只为今天',
        field_from: '来自',
        ph_from: '你的名字',
        field_language: '语言',
        toggle_special: '显示特殊的长期钥匙扣',
        help_special: '在上面的里程碑列表中添加 5、10、15、25 和 30 年的纪念钥匙扣。',
        toggle_official: '使用官方 NA 钥匙扣正面',
        help_official: '在钥匙扣正面放上官方 NA 标志。保持关闭（默认）以使用普通正面。',
        note_trademark:
            'NA 的官方名称和标志是 NAWS 的注册商标。只有在你的服务机构获得授权使用时才启用；否则请保持关闭以使用通用正面。',
        action_copy: '复制分享链接',
        action_copied: '已复制！',
        action_download: '下载图片',
        action_preparing: '正在准备…',
        action_display: '打开展示视图',
        action_startover: '重新开始',
        copy_error: '无法自动复制——请选择下面的链接并手动复制：',
        fallback_label: '分享链接（手动复制）',
        download_error: '无法生成图片。请重试。',
        hint_flip: '点击钥匙扣翻转它。',
        aria_form: '创建钥匙扣',
        aria_preview: '预览',
        aria_flip: '{headline} 钥匙扣——点击翻转',
        label_for: '致',
        card_edit: '编辑此钥匙扣',
        card_fullscreen: '打开全屏',
        card_create: '创建你自己的 →',
        display_exit: '退出展示视图',
        ms_welcome: '欢迎',
        ms_30d: '30 天',
        ms_60d: '60 天',
        ms_90d: '90 天',
        ms_6m: '6 个月',
        ms_9m: '9 个月',
        ms_1y: '1 年',
        ms_18m: '18 个月',
        ms_years: '%d 年',
        ms_cleantime: '清醒时间',
    },

    'zh-Hant': {
        title: '發送一個{虛擬}鑰匙扣',
        intro: '慶祝某人的清醒時間。不儲存任何內容——卡片完全存在於你分享的連結中。',
        editing_note: '正在編輯此鑰匙扣——隨意修改並分享新連結。',
        field_recipient: '接收者的姓名或縮寫',
        ph_recipient: '例如 Sam R.',
        field_milestone: '里程碑',
        help_milestone: '要慶祝的清醒時間鑰匙扣。下方的清醒日期可以為你自動選擇。',
        field_cleandate: '清醒日期',
        optional: '（可選）',
        help_cleandate: '為卡片加入確切的清醒時間（例如「這是一年了」）並自動選擇對應的里程碑。',
        field_message: '個人留言',
        ph_message: '只為今天',
        field_from: '來自',
        ph_from: '你的名字',
        field_language: '語言',
        toggle_special: '顯示特殊的長期鑰匙扣',
        help_special: '在上面的里程碑清單中加入 5、10、15、25 和 30 年的紀念鑰匙扣。',
        toggle_official: '使用官方 NA 鑰匙扣正面',
        help_official: '在鑰匙扣正面放上官方 NA 標誌。保持關閉（預設）以使用普通正面。',
        note_trademark:
            'NA 的官方名稱和標誌是 NAWS 的註冊商標。只有在你的服務機構獲得授權使用時才啟用；否則請保持關閉以使用通用正面。',
        action_copy: '複製分享連結',
        action_copied: '已複製！',
        action_download: '下載圖片',
        action_preparing: '正在準備…',
        action_display: '開啟展示檢視',
        action_startover: '重新開始',
        copy_error: '無法自動複製——請選擇下面的連結並手動複製：',
        fallback_label: '分享連結（手動複製）',
        download_error: '無法產生圖片。請重試。',
        hint_flip: '點擊鑰匙扣翻轉它。',
        aria_form: '建立鑰匙扣',
        aria_preview: '預覽',
        aria_flip: '{headline} 鑰匙扣——點擊翻轉',
        label_for: '致',
        card_edit: '編輯此鑰匙扣',
        card_fullscreen: '開啟全螢幕',
        card_create: '建立你自己的 →',
        display_exit: '退出展示檢視',
        ms_welcome: '歡迎',
        ms_30d: '30 天',
        ms_60d: '60 天',
        ms_90d: '90 天',
        ms_6m: '6 個月',
        ms_9m: '9 個月',
        ms_1y: '1 年',
        ms_18m: '18 個月',
        ms_years: '%d 年',
        ms_cleantime: '清醒時間',
    },
};

/** Supported UI language codes, in menu order. */
export const SUPPORTED_UI_LANGS = Object.keys(UI);

/** Resolve the full string set for a language, English-backed per key. */
export function uiStrings(lang) {
    return { ...UI.en, ...(UI[lang] ?? {}) };
}

/**
 * Pick the best supported language for a list of BCP-47 preferences
 * (e.g. `navigator.languages`), falling back to English.
 */
export function detectLang(preferred = []) {
    const list = Array.isArray(preferred) ? preferred : [preferred];
    for (const raw of list) {
        if (typeof raw !== 'string' || !raw) continue;
        if (UI[raw]) return raw; // exact match (e.g. "zh-Hans")
        const lower = raw.toLowerCase();
        const base = lower.split('-')[0];
        if (base === 'zh') {
            // Traditional for TW/HK/MO or an explicit Hant tag, else Simplified.
            return /hant|tw|hk|mo/.test(lower) ? 'zh-Hant' : 'zh-Hans';
        }
        const match = SUPPORTED_UI_LANGS.find((code) => code.toLowerCase().split('-')[0] === base);
        if (match) return match;
    }
    return 'en';
}

const NUM_TO_MS = {
    '01': 'ms_welcome',
    '02': 'ms_30d',
    '03': 'ms_60d',
    '04': 'ms_90d',
    '05': 'ms_6m',
    '06': 'ms_9m',
    '07': 'ms_1y',
    '08': 'ms_18m',
};

const KEY_TO_MS = {
    welcome: 'ms_welcome',
    '30d': 'ms_30d',
    '60d': 'ms_60d',
    '90d': 'ms_90d',
    '6m': 'ms_6m',
    '9m': 'ms_9m',
    '1y': 'ms_1y',
    '18m': 'ms_18m',
};

/** Localized headline for an earned tag `{num, years}`. */
export function milestoneHeadline(tag, t) {
    const key = NUM_TO_MS[tag.num];
    if (key) return t[key];
    if (tag.years === 1) return t.ms_1y;
    if (tag.years) return sprintf(t.ms_years, tag.years);
    return t.ms_cleantime;
}

/** Localized label for a builder dropdown option `{key, years}`. */
export function optionLabel(opt, t) {
    const key = KEY_TO_MS[opt.key];
    if (key) return t[key];
    if (opt.years === 1) return t.ms_1y;
    if (opt.years) return sprintf(t.ms_years, opt.years);
    return opt.label;
}

/**
 * Split a title on `{…}` emphasis markers into render segments, e.g.
 * "Send a {Virtual} Keytag" → [{text:'Send a '}, {text:'Virtual', em:true}, …].
 */
export function splitEmphasis(str) {
    const parts = [];
    const re = /\{([^}]*)\}/g;
    let last = 0;
    let m;
    while ((m = re.exec(str)) !== null) {
        if (m.index > last) parts.push({ text: str.slice(last, m.index), em: false });
        parts.push({ text: m[1], em: true });
        last = m.index + m[0].length;
    }
    if (last < str.length) parts.push({ text: str.slice(last), em: false });
    return parts;
}

/** Replace a single `{token}` in a string (for ARIA labels, etc.). */
export function fillToken(str, token, value) {
    return str.replace(`{${token}}`, value);
}
