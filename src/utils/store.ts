import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "",
        ShowRoom: [{id: 0, name: "unavailable"}],
        Language: "zhHans",
        Notify: false,
        ShowSkin: [],
        Xuid: "",
        Tour: true,
        VerifyCode: ""
    }),
    actions: {},
    persist: {
        key: 'MCOnline',
    },
})

