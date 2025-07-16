import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "{\"id\":6,\"name\":\"HelloMC25b5988\"}",
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

