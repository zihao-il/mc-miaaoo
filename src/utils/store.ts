import {defineStore} from 'pinia'

type Friend = {
    id: string | number
    name: string
    canaddfriends?: boolean
}

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: null as Friend | null,
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

