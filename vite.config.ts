import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import compression from "vite-plugin-compression2";
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(),
        VueI18nPlugin({
            include: './src/locales/**'
        }),
        compression({
            algorithm: "gzip"
        }),  // gzip
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    base: '/',
    server: {
        host: '0.0.0.0',
    },
})
