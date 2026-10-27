import { en, type LangPack } from './en';
import { es } from './es';
import { it } from './it';
import { pt } from './pt';
import { zhHans } from './zh-Hans';
import { zhHant } from './zh-Hant';

export type { LangPack };

export const languages = {
    en,
    es,
    it,
    pt,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
};
