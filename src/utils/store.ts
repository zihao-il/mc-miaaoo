import {defineStore} from 'pinia'

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: "{\"id\":3,\"name\":\"gouhope\"}",
        ShowRoom: [{id: 2, name: 'MultiMC23'}, {id: 3, name: 'gouhope'}],
        Language: "zhHant"
    }),
    actions: {
        setFriends(data: string) {
            this.Friends = data
        },
        setShowRoom(data: any[]) {
            this.ShowRoom = data
        },
        setLanguage(data: string) {
            this.Language = data
        },

    },
    persist: {
        key: 'MCOnline',
    },
})

