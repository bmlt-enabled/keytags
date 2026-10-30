import { en, type LangPack } from './en';
import { da } from './da';
import { de } from './de';
import { el } from './el';
import { es } from './es';
import { fa } from './fa';
import { fi } from './fi';
import { fr } from './fr';
import { hi } from './hi';
import { it } from './it';
import { ja } from './ja';
import { ne } from './ne';
import { pl } from './pl';
import { pt } from './pt';
import { ru } from './ru';
import { sv } from './sv';
import { zhHans } from './zh-Hans';
import { zhHant } from './zh-Hant';

export type { LangPack };

// `satisfies` checks every pack is a complete LangPack (a missing/renamed key is
// a build error) without widening the value type, so Object.keys() still works.
export const languages = {
    en,
    da,
    de,
    el,
    es,
    fa,
    fi,
    fr,
    hi,
    it,
    ja,
    ne,
    pl,
    pt,
    ru,
    sv,
    'zh-Hans': zhHans,
    'zh-Hant': zhHant,
} satisfies Record<string, LangPack>;
