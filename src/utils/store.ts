import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "{\"id\":5,\"name\":\"HelloMC25a\"}",
        ShowRoom: [{id: 0, name: "unavailable"}],
        Language: "zhHans",
        Notify: false,
        ShowSkin: [],
        Xuid: "",
        Tour: true
    }),
    actions: {},
    persist: {
        key: 'MCOnline',
    },
})

