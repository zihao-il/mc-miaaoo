import zhHans from './zh-Hans.json'
import zhHant from './zh-Hant.json'
import {createI18n} from 'vue-i18n';

let i18n: any;

const createI18nInstance = () => {
    i18n = createI18n({
        globalInjection: true,
        locale: 'zhHant',
        fallbackLocale: 'zhHans',
        messages: {
            zhHans,
            zhHant
        }
    });
    return i18n;
};
const setLocale = (locale: string) => {
    if (i18n) {
        i18n.global.locale.value = locale;
    }
};
export {createI18nInstance, setLocale};
