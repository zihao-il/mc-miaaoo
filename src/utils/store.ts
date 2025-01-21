import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "{\"id\":3,\"name\":\"gouhope\"}",
        ShowRoom: [{id: 0, name: "unavailable"}],
        Language: "zhHant",
        Notify: true,
    }),
    actions: {},
    persist: {
        key: 'MCOnline',
    },
})

