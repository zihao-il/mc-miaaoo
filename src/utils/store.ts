import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "{\"id\":4,\"name\":\"HelloMC25\"}",
        ShowRoom: [{id: 0, name: "unavailable"}],
        Language: "zhHans",
        Notify: true,
    }),
    actions: {},
    persist: {
        key: 'MCOnline',
    },
})

