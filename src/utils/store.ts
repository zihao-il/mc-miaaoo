import {defineStore} from 'pinia'

type Friend = {
    id: string | number
    name: string
    canaddfriends?: boolean
}

export const useMCOnlineStore = defineStore('MCOnline', {
    state: () => ({
        Friends: { id: '2', name: 'MultiMC23', canaddfriends: false } as Friend,
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

