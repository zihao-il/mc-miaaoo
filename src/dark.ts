import { useDark, useToggle } from '@vueuse/core'

export const isDark = useDark({
    storageKey: 'mcxbox-color-scheme',
    valueLight: 'light',
    valueDark: 'dark',
})
export const toggleDark: () => void = useToggle(isDark);
