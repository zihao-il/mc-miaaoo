import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "{\"id\":3,\"name\":\"gouhope\"}",
        ShowRoom: [{id: 2, name: 'MultiMC23'}, {id: 3, name: 'gouhope'}],
        Language: "zhHant",
        Notify: true,
    }),
    actions: {},
    persist: {
        key: 'MCOnline',
    },
})

