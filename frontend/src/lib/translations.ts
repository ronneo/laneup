import type { Config } from 'sveltekit-i18n'
import i18n from 'sveltekit-i18n'

interface Params {
    count:number
}

const config: Config<Params> = ({
    loaders: [{
        locale: 'en',
        key: 'common',
        loader: async () => (
            await import('./translations/en/common.json')
        ).default,
    },
    {
        locale: 'en',
        key: 'status',
        loader: async () => (
            await import('./translations/en/status.json')
        ).default,
    },
    {
        locale: 'en',
        key: 'manager',
        loader: async () => (
            await import('./translations/en/manager.json')
        ).default,
    },
    {
        locale: 'zh-cn',
        key: 'common',
        loader: async () => (
            await import('./translations/zh-cn/common.json')
        ).default,
    },
    {
        locale: 'zh-cn',
        key: 'manager',
        loader: async () => (
            await import('./translations/zh-cn/manager.json')
        ).default,
    },
    {
        locale: 'zh-cn',
        key: 'status',
        loader: async () => (
            await import('./translations/zh-cn/status.json')
        ).default,
    }],
})

export const { t, locale, locales, loading, loadTranslations } = new i18n(config)