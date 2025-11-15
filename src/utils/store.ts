import {defineStore} from 'pinia'
import type { UploadUserFile } from 'element-plus'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "",
        ShowRoom: [{id: 0, name: "unavailable"}],
        Language: "zhHans",
        Notify: false,
        ShowSkin: true,
        Xuid: "",
        Tour: true,
        VerifyCode: "",
        Avatar: "",
        RoomNameLang: "",
        HideCrisp: false,
        BgImage: [] as UploadUserFile[],
        BgFilter: 0,
    }),
    actions: {},
    persist: {
        key: 'MCOnline',
    },
})

